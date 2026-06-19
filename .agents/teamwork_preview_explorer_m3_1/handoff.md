# Milestone 3 Investigation: Frontend Admin Shell & Auth

## 1. Observation

- The frontend is built with React, Vite, and Tailwind CSS.
- Current routing is entirely state-based, handled inside `frontend/src/App.tsx` via `activeMainTab` state (`"home" | "learn" | "tracker" | "tracks"`).
- There is no routing library installed (checked `frontend/package.json` – `react-router-dom` is missing).
- User authentication is managed by `frontend/src/context/AuthContext.tsx` using a `token` and `user` stored in `localStorage`, initially provisioned via `@react-oauth/google`.
- `App.tsx` contains the entire user-facing UI layout including the navbar, top-level tabs, and offline banners.
- Backend Admin code (M1) is currently running in parallel, so explicit endpoints like `/api/admin/login` are not yet available to inspect locally.

## 2. Logic Chain

1. **Routing Requirements**: To introduce a new Admin layout with a Sidebar and separate paths (`/admin`, `/admin/users`, `/admin/tracks`), we need an actual routing system. Modifying the existing `App.tsx` to conditionally render a completely different layout based on `window.location.pathname` is unscalable and prone to bugs, especially with nested paths. Therefore, installing `react-router-dom` is the most robust approach.
2. **Authentication Separation**: Admin users are stored in a separate backend collection and have a distinct auth flow. Modifying the existing `AuthContext.tsx` to handle both roles is risky and might cause `localStorage` key collisions (e.g. overwriting the main `token`). A separate `AdminAuthContext.tsx` using keys like `admin_token` and `admin_user` is required.
3. **Route Protection**: The Admin Shell needs a protective wrapper (`AdminProtectedRoute`) that reads from `AdminAuthContext` and redirects unauthenticated admins to `/admin/login`.
4. **App Restructuring**: The entry point must be refactored. `main.tsx` or `App.tsx` should inject the `BrowserRouter` and `<Routes>`. The current monolith in `App.tsx` should be moved into a `UserDashboard` component to serve as the element for the `/*` catch-all route.

## 3. Caveats

- **Dependency Addition**: The proposed strategy introduces `react-router-dom`. If project constraints strictly forbid new dependencies, a custom `window.location` based hook could be implemented, but it is highly discouraged given the scope of upcoming milestones (M4/M5 nested routes).
- **Backend API Endpoints**: Since M1 is in parallel development, the exact authentication endpoints are assumed (e.g., `POST /api/admin/auth/login`). The implementer will need to align with the final backend contracts once they are published.

## 4. Conclusion

The implementation strategy for Milestone 3 should be:

1. Install `react-router-dom`.
2. Create `frontend/src/context/AdminAuthContext.tsx` to manage admin session state independently from normal users.
3. Move the current `App.tsx` UI into `frontend/src/components/UserDashboard.tsx` (or similar).
4. Refactor `App.tsx` to be the root router containing:
   - `/*` -> `<UserDashboard />`
   - `/admin/login` -> `<AdminLogin />`
   - `/admin/*` -> `<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>`
5. Build the `AdminLogin` page and `AdminLayout` (with Sidebar) components as scoped.

## 5. Verification Method

1. Install `react-router-dom` and apply the structural changes.
2. Run `npm run dev` in the frontend.
3. Navigate to `http://localhost:5173/admin/login` and verify that the Admin login UI renders without the main user application navbar.
4. Manually set a mock admin token in local storage, navigate to `http://localhost:5173/admin`, and verify the Admin layout with the sidebar is visible.
5. Navigate to `http://localhost:5173/` and verify the original user application renders and behaves normally with its tab-based navigation.
