# Handoff Report: Milestone 3 (Frontend Admin Shell & Auth)

## Observation

- `frontend/package.json` does not list `react-router-dom` in its dependencies.
- `frontend/src/main.tsx` (lines 21-33) renders `<App />` directly, without any Router wrapper.
- `frontend/src/App.tsx` (lines 76-80) handles navigation manually via an `activeMainTab` state (e.g., `'home'`, `'learn'`, `'tracker'`, `'tracks'`).
- `frontend/src/context/AuthContext.tsx` manages standard user authentication, saving `token` and `user` to generic `localStorage` keys (`"token"`, `"user"`). It does not support RBAC or a separate Admin schema.
- `frontend/vite.config.ts` correctly proxies `/api` to `localhost:3000` and configures the `VitePWA` plugin, meaning client-side routing fallbacks are handled properly by the Vite dev server.

## Logic Chain

- Because the existing application (`App.tsx`) is a monolithic, state-driven UI rather than a router-driven one, attempting to wrap the entire app in `react-router-dom` would require significant refactoring of existing tabs and transitions.
- The safest and cleanest way to introduce the `/admin` routes without risking regressions to the current UI is to intercept the route at the highest level. We can modify `main.tsx` to check `window.location.pathname`. If it starts with `/admin`, we render a new `<AdminApp />` root component; otherwise, we render the existing `<App />`.
- To manage admin sessions securely and prevent conflicts with standard users (e.g., an admin logging in shouldn't accidentally log out their standard user account), we must create an independent `AdminAuthContext.tsx` that uses separate localStorage keys (e.g., `admin_token`, `admin_user`).
- For the admin dashboard itself, adding `react-router-dom` inside `<AdminApp />` is highly recommended, as an admin shell inherently requires deep linking to various pages (e.g., `/admin/users`, `/admin/tracks`, `/admin/docs`, `/admin/login`).

## Caveats

- Since M1 (Backend Admin Setup) is being developed in parallel by another sub-orchestrator, the exact endpoint for the Admin login (likely `POST /api/admin/login`) and the shape of the admin user response are assumed based on standard conventions. The frontend implementation must use these logical defaults and may require a minor sync once M1 is complete.
- We assume that `react-router-dom` can be safely installed in the project. If package addition is strictly forbidden, the `<AdminApp />` would need a custom state-based router, but installing `react-router-dom` is the standard approach.

## Conclusion

To implement Milestone 3 cleanly, execute the following strategy:

1. **Dependency Injection**: Run `npm install react-router-dom` in the `frontend` directory.
2. **Admin Context**: Create `frontend/src/context/AdminAuthContext.tsx` to handle admin sessions (login/logout/token) using isolated localStorage keys (e.g., `admin_token`).
3. **App Shell**: Create `frontend/src/AdminApp.tsx`. Wrap it in `<AdminAuthProvider>` and `<BrowserRouter basename="/admin">`. Define your routes: `/login` (public) and a protected `<AdminLayout>` for `/` and subsequent pages.
4. **Conditional Bootstrapping**: Modify `frontend/src/main.tsx` to branch rendering:
   ```tsx
   const isAdminRoute = window.location.pathname.startsWith("/admin");
   // ... inside createRoot:
   isAdminRoute ? <AdminApp /> : <App />;
   ```
5. **UI Components**: Build `AdminProtectedRoute.tsx`, `AdminLayout.tsx` (with sidebar), and `AdminLogin.tsx` (login form posting to `/api/admin/login`) inside the `frontend/src/components/admin/` and `frontend/src/pages/admin/` directories.

## Verification Method

1. Run the frontend server using `npm run dev`.
2. Navigate to `http://localhost:5173/admin`. It should successfully load the new Admin Login page (or redirect to it).
3. Attempting to log in should trigger a network request to `/api/admin/login`.
4. Navigate to `http://localhost:5173/`. The standard user `App.tsx` should load flawlessly without any layout or routing regressions.
