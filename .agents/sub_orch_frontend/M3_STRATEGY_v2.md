# Milestone 3 Strategy (Iteration 2): Fix API Mismatch

## Consensus Findings

The first iteration had API contract mismatches. The backend expects `/api/admin/auth/login` with `{ email, password }` and returns `{ token, admin }`.

## Resolved Strategy

Implement the following refactoring to perfectly align the frontend with the backend M1 contract:

**1. `frontend/src/context/AdminAuthContext.tsx`:**

- Update the `AdminUser` interface to replace `username: string` with `email: string`.
- Make sure `id: string` is present as well.

**2. `frontend/src/pages/admin/AdminLogin.tsx`:**

- Change the `username` React state variable to `email`.
- Update the input field: change `id`, `name`, `htmlFor` to `email`, update the `type` to `"email"`, and change the label text to "Email".
- Update the `fetch` URL to `"/api/admin/auth/login"`.
- Update the request body to send `JSON.stringify({ email, password })`.
- Update the success handler to extract `data.admin` and call `adminLogin(data.token, data.admin)` instead of `data.user`.

## Verification

- After these changes, running `npm run build` should pass with no TypeScript errors.
