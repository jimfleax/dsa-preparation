# Handoff Report: Admin Login API Mismatch

**Core Finding:** The frontend Admin Login component contains hardcoded paths, payload fields, and response expectations that do not match the backend's contract. The backend expects an `email` field at `/api/admin/auth/login` and returns `{ token, admin }`, whereas the frontend sends `username` to `/api/admin/login` and expects `{ token, user }`.

## 1. Observation

- In `frontend/src/pages/admin/AdminLogin.tsx`:
  - Line 20: The API endpoint called is `fetch("/api/admin/login", ...)`
  - Line 25: The request payload is `body: JSON.stringify({ username, password })`
  - Line 34: The response mapped is `adminLogin(data.token, data.user)`
  - Lines 56-72: Form renders an input with `id="username"`, `name="username"`, `type="text"`.
- In `backend/src/routes/admin/index.ts` and `backend/src/routes/admin/authRoutes.ts`:
  - `adminRoutes` is mounted at `/api/admin` and it mounts `authRoutes` at `/auth`.
  - `authRoutes` mounts the login handler at `/login`. Thus, the actual endpoint is `POST /api/admin/auth/login`.
- In `backend/src/controllers/admin/authController.ts` (Lines 6-30):
  - The controller destructures `const { email, password } = req.body;`.
  - On success, it returns `res.json({ token, admin: { email: admin.email, id: admin._id } });`.
- In `frontend/src/context/AdminAuthContext.tsx` (Lines 13-16):
  - The `AdminUser` interface defines `{ id: string; username: string; }`.
- In `frontend/src/components/admin/AdminLayout.tsx` (Line 53):
  - The component displays `{adminUser?.username || "Admin"}`.
- In `frontend/src/tests/adminRouting.test.tsx` (Line 70) & `frontend/src/tests/runner.tsx` (Line 54):
  - Mock data uses `{ id: '1', username: 'admin' }`.

## 2. Logic Chain

1. The frontend attempts to login at `/api/admin/login` but the backend is listening on `/api/admin/auth/login`. This results in a 404.
2. The frontend sends `username` instead of `email`, causing the backend to reject the request (`400 Bad Request`) since it requires `email`.
3. Even if the request succeeds, the frontend expects the user object at `data.user`, but the backend sends it at `data.admin`. This results in an `undefined` user being saved to context.
4. The frontend context and components expect `adminUser.username`, but the backend model uses `email`.
5. Tests contain mock local storage data utilizing `username` which will cause type/logic errors when the interface is changed to `email`.

## 3. Caveats

- No caveats. The mismatch is purely structural between the frontend's API call definition and the backend's controller logic.

## 4. Conclusion & Fix Strategy

To perfectly align the frontend with the backend contract, implement the following changes:

1. **`frontend/src/context/AdminAuthContext.tsx`**:
   - Change `AdminUser` interface: `username: string;` -> `email: string;`.

2. **`frontend/src/pages/admin/AdminLogin.tsx`**:
   - Change state: `const [username, setUsername]` to `const [email, setEmail]`.
   - Update API endpoint: `/api/admin/login` -> `/api/admin/auth/login`.
   - Update Payload: `{ username, password }` -> `{ email, password }`.
   - Update Response Mapping: `adminLogin(data.token, data.user)` -> `adminLogin(data.token, data.admin)`.
   - Update UI inputs: Change the "Username" input to "Email" (`id="email"`, `name="email"`, `type="email"`). Replace the `User` icon from `lucide-react` with `Mail`.

3. **`frontend/src/components/admin/AdminLayout.tsx`**:
   - Update display value: `{adminUser?.username || "Admin"}` -> `{adminUser?.email || "Admin"}`.

4. **`frontend/src/tests/adminRouting.test.tsx`** & **`frontend/src/tests/runner.tsx`**:
   - Update mock local storage to use `email` instead of `username`: `JSON.stringify({ id: '1', email: 'admin@example.com' })`.

## 5. Verification Method

- **Static Analysis**: Verify type correctness using TypeScript: `npx tsc --noEmit` in the `frontend` folder.
- **Unit Tests**: Run frontend tests with `npm test` inside the frontend directory to ensure the mock changes work.
- **Integration/E2E**:
  - Run the full stack (`npm run dev` in backend, `npm start` in frontend).
  - Attempt an admin login at `/admin/login` using a valid admin email and password.
  - Verify that the login succeeds, the dashboard loads, and the admin's email appears in the sidebar instead of "Admin".
