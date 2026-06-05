# Complete Logical Workflow

## Phase A: Registration & Login
1. User navigates to the app and sees the custom Login page.
2. If new, they click "Register", fill the form, and submit. The backend creates a new `User` document, hashes the password, and returns a JWT.
3. If existing, they submit Login credentials. The backend verifies the hash against `User.passwordHash` and returns a JWT.
4. The React `AuthContext` saves the JWT to `localStorage` and sets `isAuthenticated = true`.

## Phase B: Network Interception
1. For every subsequent API call (e.g., fetching problems, syncing), the frontend appends `Authorization: Bearer <JWT>` to the fetch headers.
2. If the backend's `requireAuth` middleware rejects the token (expired/invalid) with a `401`, the frontend catches this, clears `localStorage`, and forces a redirect to the Login screen.

## Phase C: Viewing & Syncing Problems
1. The frontend requests `GET /api/problems`.
2. Backend middleware verifies the token and injects `req.user.id`.
3. The controller queries `ProblemProgress.find({ userId: req.user.id })`.
4. When syncing, `POST /api/sync` looks up the User by `req.user.id`, gets their `leetcodeUsername`, fetches from the external API, and upserts progress records tagged with `req.user.id`.
