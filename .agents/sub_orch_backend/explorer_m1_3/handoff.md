# Admin Dashboard API Investigation Handoff

## Observation
- The `dsa-preparation` backend is an Express + MongoDB application. 
- Existing models are located in `backend/src/models/` (`User.ts`, `Track.ts`, `TrackedProblem.ts`).
- Existing routes and controllers are directly under `backend/src/routes/` and `backend/src/controllers/`.
- `PROJECT.md` specifies that Admin routes and controllers should be placed in `backend/src/routes/admin/` and `backend/src/controllers/admin/`.
- Authentication is currently handled via JWT, but standard User login is Google OAuth. There is no password hashing library like `bcryptjs` currently installed in `package.json`.
- `Track.ts` has a schema with `problems` and `parts[].problems`. 
- `TrackedProblem.ts` stores user problem progress, including a `reviewDurationDays` field (which can indicate "revising") and `notrack` boolean.
- We are constrained NOT to build an endpoint for creating the first admin, meaning the `Admin` model should be simple and manually seedable.

## Logic Chain
1. **Admin Schema**: We must create `backend/src/models/Admin.ts` with `email` and `password`. Since we shouldn't build a creation endpoint, the user will insert the first document directly into MongoDB. To simplify hashing, we can either install `bcryptjs` or use Node's native `crypto` module (e.g. SHA-256 or scrypt) so the user can easily generate a hash to insert. `bcryptjs` is recommended for standard security.
2. **Admin Auth Middleware**: We need `backend/src/middleware/adminAuthMiddleware.ts` that verifies the JWT and ensures the token belongs to an existing `Admin` document, protecting all `/api/admin/*` endpoints (except login).
3. **Admin Routes & Controllers**: We should create the `admin/` subdirectories as specified in `PROJECT.md`.
   - `authController.ts` & `authRoutes.ts` -> POST `/api/admin/auth/login`
   - `userController.ts` & `userRoutes.ts` -> GET `/api/admin/users`
   - `trackController.ts` & `trackRoutes.ts` -> CRUD operations on the `Track` model.
   - `analyticsController.ts` & `analyticsRoutes.ts` -> GET `/api/admin/analytics`
4. **Analytics Aggregations**:
   - *Total registered users*: `User.countDocuments()`
   - *New users (last 30 days)*: `User.countDocuments({ createdAt: { $gte: 30DaysAgo } })`
   - *Total tracks*: `Track.countDocuments()`
   - *Total problems available*: Extract and count unique `titleSlug`s from all tracks (`problems` and `parts.problems`).
   - *Total problems solved globally*: `TrackedProblem.countDocuments({ notrack: { $ne: true } })`
   - *Most active tracks*: Aggregate `TrackedProblem` by `titleSlug` to get solve counts, then map these counts to the problems in each `Track` to calculate a total "activity score" per track.
   - *Problem completion rate (Solved vs Revising/Unsolved)*: Calculate pure solved vs revising. Revising can be defined as `TrackedProblem` documents where `reviewDurationDays` is present (`{ reviewDurationDays: { $ne: null } }`). Pure solved is the rest.

## Caveats
- `bcryptjs` is not currently in `package.json`. The implementer will need to install it (`npm install bcryptjs` and `npm i -D @types/bcryptjs`), OR use Node's native `crypto.createHash('sha256')` if they want to remain zero-dependency.
- The definition of "Revising/Unsolved" vs "Solved" was inferred from the `reviewDurationDays` field in `TrackedProblem.ts`. If a problem is tracked and has `reviewDurationDays`, it's in "Revising" state; otherwise, it's just "Solved". "Unsolved" can be considered the difference between total available problems and total unique solved problems globally, or just left out of the pie chart if it focuses only on tracked problems.
- Track CRUD operations will need to reuse or recreate logic. Ensure `Track.ts` is imported correctly.

## Conclusion
The backend is ready to accept the new Admin Dashboard features. The implementer should create the `Admin` model, add `bcryptjs`, and implement the required controllers and routes under the `admin/` namespaces. The analytics endpoint will require querying `User`, `Track`, and `TrackedProblem` models to build the required metrics payload. Finally, the main router in `server.src.ts` must mount the new admin routes at `/api/admin`.

## Verification Method
1. Inspect `backend/package.json` for `bcryptjs` or verify `crypto` is used.
2. View `backend/src/models/Admin.ts` for the schema.
3. Check `backend/src/middleware/adminAuthMiddleware.ts` for strict admin JWT validation.
4. Verify `/api/admin/auth/login` works by manually inserting an admin into the DB and logging in.
5. Hit `/api/admin/analytics` (with admin JWT) and ensure the payload contains all 5 required metrics.
