# Handoff Report: Milestone 3 (Frontend Admin Shell & Auth)

**Scope**: Explore codebase and plan the implementation for M3 (Login page, Admin layout, Protected route logic, Auth context).

## 1. Observation

- `frontend/package.json` does not include `react-router-dom`. The current application relies on local state (`activeMainTab` in `src/App.tsx`) to toggle between the main views (home, learn, tracker, tracks).
- `frontend/src/context/AuthContext.tsx` handles standard user authentication via Google OAuth and stores credentials in `localStorage` using the exact keys `"token"` and `"user"`.
- `frontend/src/main.tsx` wraps the entire `<App />` tree globally with `<GoogleOAuthProvider>` and `<AuthProvider>`.
- `frontend/package.json` already contains `"recharts": "^3.8.1"` as requested by the scope.

## 2. Logic Chain

- Integrating a completely separate `/admin` dashboard into the existing state-based `App.tsx` would introduce significant bloat and tangle admin logic with public/student logic.
- The cleanest strategy is to install `react-router-dom` and split the application at the root (`main.tsx`). We can define a `<BrowserRouter>` with two main branches: `/admin/*` and `/*`.
- The regular user authentication relies on Google OAuth and standard `localStorage` keys. Admin authentication must be kept isolated to prevent conflicts (e.g., an admin token overwriting a student token). Therefore, a distinct `AdminAuthContext` must be created, using keys like `"admin_token"` and `"admin_user"`.
- The `/*` branch will continue to render `<App />` wrapped in the existing `<AuthProvider>` and `<GoogleOAuthProvider>`.
- The `/admin/*` branch will render a new `<AdminApp />` wrapped in `<AdminAuthProvider>`.
- Inside `<AdminApp />`, React Router can handle rendering the public `/admin/login` page or the `<AdminLayout>` (sidebar shell), protected by an `<AdminProtectedRoute>` wrapper component.

## 3. Caveats

- The backend implementation for M1/M2 is occurring in parallel. We assume the backend will provide a standard login endpoint (e.g., `/api/admin/login`) that accepts credentials and returns a JWT token.
- Vite handles SPA routing gracefully in development, but verify that the PWA Service Worker (configured in `vite.config.ts`) correctly caches and routes `/admin` URLs without throwing 404s in production.
- `react-router-dom` needs to be explicitly installed via `npm install react-router-dom`.

## 4. Conclusion

To implement Milestone 3, the implementer should execute the following strategy:

1. **Dependencies:** Run `npm install react-router-dom` in the `frontend/` directory.
2. **Context:** Create `src/context/AdminAuthContext.tsx` to handle admin JWT authentication using isolated `localStorage` keys (`admin_token`, `admin_user`).
3. **Routing Split:** Modify `src/main.tsx` to introduce `<BrowserRouter>` with two top-level routes:
   - `<Route path="/admin/*" element={<AdminAuthProvider><AdminApp /></AdminAuthProvider>} />`
   - `<Route path="/*" element={<GoogleOAuthProvider><AuthProvider><App /></AuthProvider></GoogleOAuthProvider>} />`
4. **Admin Shell:** Create a new `src/admin/` directory containing:
   - `AdminApp.tsx` (Internal router for `/login` and `/` protected routes).
   - `components/AdminProtectedRoute.tsx` (Redirects to `/admin/login` if `isAdminSignedIn` is false).
   - `components/AdminLayout.tsx` (Sidebar navigation and topbar).
   - `pages/AdminLogin.tsx` (Admin login form).

## 5. Verification Method

- Run `npm run dev` in the `frontend` directory.
- Navigate to `http://localhost:5173/` and verify the main app loads correctly without regressions.
- Navigate to `http://localhost:5173/admin` and verify it automatically redirects to `http://localhost:5173/admin/login`.
- Inspect `localStorage` after an admin login to verify it stores `"admin_token"` and does not overwrite the standard `"token"`.
