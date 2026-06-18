# Handoff Report: Backend Admin & Docs Setup (Milestone 1)

## Observation
- The `backend/src/models/` folder contains schemas for `Track`, `TrackedProblem`, and `User`.
- The `backend/package.json` contains `jsonwebtoken` but does not include password hashing libraries like `bcrypt` or `bcryptjs`.
- The frontend/backend is connected via `server.src.ts`, which registers routes under `/api/*` and uses an Express request global type definition in `backend/src/types.ts`.
- The `User` model does not use passwords (it relies on Google OAuth), but the new `Admin` model will require a standalone login.
- Analytics require gathering data across `User`, `Track`, and `TrackedProblem` collections. Specifically, the "completion rate" relies on identifying total possible problems vs tracked problems. "Revising" is indicated by the presence of `reviewDurationDays` on a `TrackedProblem`.

## Logic Chain
1. **Admin Schema & Auth:**
   Since admins log in via email/password but `bcrypt` is not in `package.json`, the implementation should either install `bcryptjs` (and `@types/bcryptjs`) or use native Node.js `crypto.scryptSync` to avoid new dependencies. A `login` endpoint is needed, returning a JWT token using the existing `JWT_SECRET`.
   Since we cannot create a signup script, the user will insert the first admin manually. We must document how they should hash the password if we use a specific hashing algorithm, or just rely on a standard `bcrypt` hash which they can generate online.

2. **Admin Auth Middleware:**
   We need an `adminAuthMiddleware.ts` (analogous to `authMiddleware.ts`) that verifies the JWT and checks the `Admin` collection.
   We must extend the `Express.Request` interface in `src/types.ts` to include `admin?: { id: string }`.

3. **Analytics Logic:**
   - **Users:** `User.countDocuments()` and `User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })`.
   - **Tracks & Problems:** `Track.countDocuments()`. To find total unique problems available, extract `titleSlug` from all `problems` and `parts.problems` across all tracks and count the unique set.
   - **Global Solved:** `TrackedProblem.countDocuments({ notrack: { $ne: true } })`.
   - **Most Active Tracks:** Aggregate `TrackedProblem` by `titleSlug` to get solve frequencies. Map these frequencies to each track's problems to calculate a track's "activeSolves" score, sorting to find the top 5.
   - **Completion Rate:** 
     - *Revising:* `TrackedProblem` records with `notrack: { $ne: true }` and `reviewDurationDays: { $exists: true, $ne: null }`.
     - *Solved (without revision):* Total Solved - Revising.
     - *Unsolved:* `(Total Users * Total Unique Problems) - Total Solved`.

4. **Track Management CRUD:**
   Expose standard Mongoose endpoints (`GET`, `POST`, `PUT`, `DELETE` on `/api/admin/tracks`) secured by the admin auth middleware.

## Caveats
- "Unsolved" is calculated theoretically as `(Total Users * Total Unique Problems) - Total TrackedProblems`. If a user tracks a problem not part of any official track, it might slightly skew the total. It's an acceptable proxy for a global metric.
- We assume `bcryptjs` will be used for password hashing in the `Admin` schema since it's the most common and standard way users would manually generate a hash to insert into the DB. The implementer should install it.
- No `register` endpoint is created per instructions.

## Conclusion
The backend needs the following new files and modifications:
1. `backend/src/models/Admin.ts`: Mongoose schema with email, password (hashed via `bcryptjs`), and name. Include a `comparePassword` method.
2. `backend/src/types.ts`: Add `admin?: { id: string }` to the `Express` namespace.
3. `backend/src/middleware/adminAuth.ts`: Middleware to verify JWT and attach `req.admin`.
4. `backend/src/controllers/admin/adminController.ts`: Implement `login`, `getUsers`, `getAnalytics`, and track CRUD functions.
5. `backend/src/routes/admin/adminRoutes.ts`: Define `/auth/login`, `/users`, `/analytics`, and `/tracks` routes.
6. `backend/server.src.ts`: Mount the new routes at `/api/admin`.

## Verification Method
1. Run `npm run build` and `npm run lint` in the `backend/` directory.
2. Ensure TypeScript compiles without errors.
3. Manually insert a test Admin document into the MongoDB `admins` collection using a known bcrypt hash (e.g., hash for "password123").
4. Send a `POST /api/admin/auth/login` request with the credentials; verify it returns a valid JWT.
5. Send a `GET /api/admin/analytics` request with the `Authorization: Bearer <token>` header; verify the correct aggregation fields are returned.
