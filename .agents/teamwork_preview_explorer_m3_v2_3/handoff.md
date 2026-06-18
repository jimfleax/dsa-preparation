# Handoff Report: Frontend Admin Login API Mismatch

## 1. Observation
- **`frontend/src/pages/admin/AdminLogin.tsx`**:
  - The login request is sent to `fetch("/api/admin/login", ...)` (Line 20).
  - The request payload is sent as `JSON.stringify({ username, password })` (Line 25).
  - The response is parsed and passed to the context as `adminLogin(data.token, data.user)` (Line 34).
  - The component manages a `username` state and renders a "Username" input field.
- **`frontend/src/context/AdminAuthContext.tsx`**:
  - The `AdminUser` interface defines the user object as `{ id: string; username: string; }` (Lines 12-15).
- **`frontend/src/components/admin/AdminLayout.tsx`**:
  - The layout displays the admin's identifier using `{adminUser?.username || "Admin"}` (Line 53).
- **`backend/src/controllers/admin/authController.ts`**:
  - The backend expects `const { email, password } = req.body;` (Line 7).
  - The backend returns `res.json({ token, admin: { email: admin.email, id: admin._id } });` (Line 29).
- **Frontend Tests (`adminRouting.test.tsx` & `runner.tsx`)**:
  - The tests mock the logged-in user in `localStorage` with `{ id: '1', username: 'admin' }`.

## 2. Logic Chain
1. The backend establishes the contract: the authentication endpoint relies on an `email` field rather than `username`, and it returns the authenticated user data under the `admin` key (containing `email` and `id`).
2. The frontend is currently out of sync with this contract, causing login requests to fail or authentication state to be incorrectly set (since `data.user` is undefined).
3. The reviewer feedback confirms the expected path is `/api/admin/auth/login`.
4. To fix the issue, the frontend must be updated to:
   - Request `POST /api/admin/auth/login`.
   - Send `email` and `password`.
   - Extract `data.admin` from the response.
   - Use `email` as the primary identifier in the frontend UI (`AdminLayout`), state, and types (`AdminUser`).
5. The test files must also be updated to reflect the new `AdminUser` interface so the mocked authentication flows correctly simulate an admin with an `email`.

## 3. Caveats
- I did not verify the exact Express route wiring for `/auth/login`, but the reviewer feedback and the existence of `backend/src/routes/admin/authRoutes.ts` heavily corroborate that `/api/admin/auth/login` is correct.
- If there is existing stale data in a developer's browser `localStorage` under `admin_user` (containing a `username`), it will lack the `email` field. This is harmless as `AdminLayout` will gracefully fall back to displaying "Admin", and a fresh login will overwrite the local storage with the correct structure.

## 4. Conclusion
The fix strategy involves modifying the frontend admin authentication flow to strictly adhere to the backend's email-centric contract.

**Specific Actions:**
1. **`frontend/src/pages/admin/AdminLogin.tsx`**: Change the `username` state to `email`, update the form input attributes, change the API endpoint to `/api/admin/auth/login`, send `{ email, password }` in the payload, and update the context call to `adminLogin(data.token, data.admin)`.
2. **`frontend/src/context/AdminAuthContext.tsx`**: Update the `AdminUser` interface to use `email: string` instead of `username: string`.
3. **`frontend/src/components/admin/AdminLayout.tsx`**: Update the UI logic to display `adminUser?.email` instead of `adminUser?.username`.
4. **`frontend/src/tests/adminRouting.test.tsx` & `frontend/src/tests/runner.tsx`**: Update the `localStorage` test mocks to use `email` (e.g., `{ id: '1', email: 'admin@example.com' }`).

## 5. Verification Method
- After implementation, review the modified files to ensure `username` has been fully removed from the admin auth flow.
- Run the frontend tests (`cd frontend && npm run test`) to verify the routing behavior works with the new `email` mock.
- Start the application stack and manually attempt an admin login with valid email/password credentials to confirm successful authentication and redirection.
