# Milestone 3 Strategy: Frontend Admin Shell & Auth

## Consensus Findings

All three Explorers agree on the following points:

1. The current app is state-driven (in `App.tsx`) and lacks `react-router-dom`.
2. Modifying `AuthContext.tsx` to handle both roles is risky and will cause `localStorage` key collisions. An independent `AdminAuthContext.tsx` using `admin_token` and `admin_user` is required.
3. Introducing `react-router-dom` is necessary for the nested routes of the Admin dashboard.

## Resolved Strategy

To avoid any regressions in the existing `App.tsx` and keep the architecture clean, we will adopt Explorer 2's strategy:

1. **Dependency:** Install `react-router-dom`.
2. **Context:** Create `frontend/src/context/AdminAuthContext.tsx` for admin sessions using isolated localStorage keys (`admin_token`).
3. **App Shell:** Create `frontend/src/AdminApp.tsx`. Wrap it in `<AdminAuthProvider>` and `<BrowserRouter basename="/admin">`. Define routes: `/login` (public) and a protected `<AdminLayout>` for `/` and subsequent pages.
4. **Conditional Bootstrapping:** Modify `frontend/src/main.tsx` to check `window.location.pathname.startsWith("/admin")`. If true, render `<AdminApp />`. Otherwise, render the existing `<GoogleOAuthProvider><AuthProvider><App /></AuthProvider></GoogleOAuthProvider>`. This completely isolates the Admin app from the User app.
5. **UI Components:** Build `AdminProtectedRoute.tsx`, `AdminLayout.tsx` (with a sidebar), and `AdminLogin.tsx` (login form posting to `/api/admin/login`) inside `frontend/src/components/admin/` and `frontend/src/pages/admin/` directories.

## Caveats

- The backend implementation for M1 is occurring in parallel. Assume the endpoint for login is `POST /api/admin/login` and returns `{ token, user }`.
