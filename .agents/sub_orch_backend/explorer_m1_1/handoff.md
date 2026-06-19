# Milestone 1: Backend Admin Setup Handoff

## 1. Observation

- The codebase uses Express.js with Mongoose (`backend/src/`).
- The standard user authentication uses JWT via `src/middleware/authMiddleware.ts` and sets `req.user`.
- The `Track` and `TrackedProblem` models are heavily used. `TrackedProblem` has a `notrack` boolean to ignore tracked problems, and `attemptCount` which increments upon revisit.
- Routes and Controllers currently exist for users, tracks, and tracked problems, but none for the admin scope.
- PROJECT.md and SCOPE.md specify:
  - Add Admin schema (`backend/src/models/Admin.ts`).
  - Add admin auth middleware, auth route (login), user list route, analytics route, and track CRUD routes.
  - No endpoint to create the first admin; the user will do it manually.
  - `backend/src/routes/admin/` and `backend/src/controllers/admin/` should be used for layout.

## 2. Logic Chain & Implementation Strategy

### A. Admin Model & Types

1. **Create `src/models/Admin.ts`**:
   - Schema: `username` (String, required, unique), `passwordHash` (String, required). Include `timestamps`.
2. **Update `src/types.ts`**:
   - Augment `Express.Request` to add `admin?: { id: string }` so `req.admin` can be used safely in controllers.

### B. Admin Auth Middleware

1. **Create `src/middleware/adminAuthMiddleware.ts`**:
   - Export `requireAdminAuth(req, res, next)`.
   - Read Bearer token, verify using `process.env.JWT_SECRET`.
   - Decode payload (e.g., `{ adminId: string }`), fetch Admin from DB. If valid, set `req.admin = { id: admin.id }` and call `next()`.

### C. Controllers & Routes Setup

Create directories: `src/controllers/admin/` and `src/routes/admin/`.

1. **Auth (`authController.ts` & `authRoutes.ts`)**:
   - `login`: Find admin by username, use `bcrypt.compare` on `passwordHash`, return JWT.
   - Route: `POST /api/admin/auth/login`.

2. **User List (`userController.ts` & `userRoutes.ts`)**:
   - `getUsers`: Fetch all users from `User` model, sorted by `createdAt: -1`.
   - Route: `GET /api/admin/users` (Protected by `requireAdminAuth`).

3. **Track Management (`trackController.ts` & `trackRoutes.ts`)**:
   - Implement `createTrack`, `updateTrack`, `deleteTrack` using `Track` model. (Read operations exist in standard routes but can also be duplicated or reused here if needed. A standard CRUD set is recommended).
   - Routes: `POST /api/admin/tracks`, `PUT /api/admin/tracks/:id`, `DELETE /api/admin/tracks/:id` (Protected).

4. **Analytics (`analyticsController.ts` & `analyticsRoutes.ts`)**:
   - `getAnalytics`: Returns an aggregated JSON.
     - **Registered & New Users**: `User.countDocuments()` and `User.countDocuments({ createdAt: { $gte: 30DaysAgo } })`.
     - **Total Tracks & Problems Available**: `Track.countDocuments()` and aggregate sum of lengths of `problems` and `parts.problems` across all tracks.
     - **Total Problems Solved Globally**: `TrackedProblem.countDocuments({ notrack: { $ne: true } })`.
     - **Most Active Tracks**:
       - Use `TrackedProblem.aggregate` to group by `titleSlug` and count interactions.
       - Fetch all `Track` records, sum up interaction counts from their constituent problems based on `titleSlug`, sort descending, and return top 5.
     - **Problem Completion Rate**:
       - `Solved` = `TrackedProblem.countDocuments({ notrack: { $ne: true }, attemptCount: 1 })`.
       - `Revising` = `TrackedProblem.countDocuments({ notrack: { $ne: true }, attemptCount: { $gt: 1 } })`.
       - `Unsolved` = `(Total Available Problems * Total Users) - (Solved + Revising)`.
   - Route: `GET /api/admin/analytics` (Protected).

### D. Main App Integration

1. **Create `src/routes/admin/index.ts`**:
   - Combine all admin routes.
2. **Update `server.src.ts`**:
   - Import `adminRoutes` and mount via `app.use("/api/admin", adminRoutes);`.

## 3. Caveats

- **"Revising/Unsolved" definition**: The prompt asks for "Solved vs Revising/Unsolved". `TrackedProblem` doesn't explicitly store "Revising" or "Unsolved" as a status. We define "Revising" as a problem where `attemptCount > 1`, "Solved" as `attemptCount === 1` (with `notrack: false`), and "Unsolved" as the mathematical remainder of possible problem interactions globally.
- **Admin creation**: The user will manually create the first admin using MongoDB compass or shell (needs to hash password via bcrypt manually, or we can provide a small util script if they want, but prompt explicitly forbids building an endpoint/script for it).

## 4. Conclusion

The implementation strategy cleanly segregates admin functionality into its own routing space and middleware, satisfying all constraints from M1 without touching the public user interfaces. The logic for compiling analytics takes advantage of `TrackedProblem` schema features like `attemptCount` and `titleSlug`.

## 5. Verification Method

- **TypeScript Build**: Run `npm run build` from `backend/` to ensure `Express.Request` augmentation and new types compile successfully.
- **Route Testing**: Temporarily inject a dummy admin into the DB manually, hit `POST /api/admin/auth/login`, grab the token, and hit `GET /api/admin/analytics`.
