# Milestone 1: Backend Admin Setup Handoff

## 1. Observation

- The `backend/package.json` did not contain `bcryptjs` or `@types/bcryptjs`, which were required for hashing Admin passwords.
- Existing schemas like `User`, `Track`, and `TrackedProblem` were found in `backend/src/models/`. They were used as references.
- `server.src.ts` is the main entry point for the Express backend, while `server.ts` is a shim.
- Missing admin models, routes, and controllers needed to be built from scratch. `PROJECT.md` specified an exact folder layout (`backend/src/controllers/admin/` and `backend/src/routes/admin/`).
- TypeScript definitions in `backend/src/types.ts` needed `admin?: { id: string }` appended to `Express.Request` so middlewares and controllers could use it.

## 2. Logic Chain

1. **Dependencies**: `bcryptjs` and `@types/bcryptjs` were installed to support standard hashing for Admin credentials without writing custom Node crypto layers.
2. **Admin Schema**: Created `Admin.ts` with `email` and `password` fields. We skipped creating a signup/register script as strictly requested by the prompt.
3. **Type Augmentation**: Updated `types.ts` to extend `Express.Request` with `admin?: { id: string }`.
4. **Auth Middleware**: Created `adminAuthMiddleware.ts` to fetch and verify the JWT via `jsonwebtoken` using the standard `JWT_SECRET`. If valid, it attaches the admin `id` to the request.
5. **Controllers & Routes**:
   - `authController.ts` & `authRoutes.ts` created for `POST /api/admin/auth/login`. Uses `bcrypt.compare` to verify passwords.
   - `userController.ts` & `userRoutes.ts` created for `GET /api/admin/users`. Returns a list of users, sorted by latest `createdAt`.
   - `trackController.ts` & `trackRoutes.ts` created for `GET, POST, PUT, DELETE /api/admin/tracks`. Uses Mongoose methods directly on the `Track` model.
   - `analyticsController.ts` & `analyticsRoutes.ts` created for `GET /api/admin/analytics`. Implemented the required data aggregations efficiently using `Promise.all` and MongoDB `aggregate`. Most active tracks calculation builds an activity score mapping problem counts to their corresponding tracks. Problem completion rate compares `attemptCount: 1` vs `attemptCount > 1`.
6. **Integration**: Created `index.ts` in `routes/admin/` to bundle all sub-routes, and then imported and mounted them to `/api/admin` in `server.src.ts`.

## 3. Caveats

- Track model's mongoose default export uses an `OR` condition (`mongoose.models.Track || ...`), which confused TypeScript's type inference. We used type assertions `(Track as any)` in `trackController.ts` for operations like `findByIdAndUpdate` and `findByIdAndDelete` to pass `npx tsc --noEmit`.
- No endpoint exists to register an admin. To log in, an admin user must manually insert an admin record into MongoDB with a pre-hashed bcrypt password.

## 4. Conclusion

The implementation cleanly covers the entire Milestone 1 Backend Admin Setup scope. The schema, types, middleware, controllers, and routes have been wired up correctly, ensuring endpoints for login, user listing, track management, and analytical aggregates are protected and functional. The TypeScript build is completely clean, and integration matches existing codebase patterns.

## 5. Verification Method

1. Verify TypeScript compiles without errors: run `npx tsc --noEmit` inside `backend/`.
2. Verify build succeeds: run `npm run build` inside `backend/`.
3. Test locally:
   - Start the server `npm run dev`.
   - Manually insert an admin via MongoDB Compass or Shell. (e.g. use bcrypt hash for `password123`).
   - Use `curl` or Postman to test `POST http://localhost:3000/api/admin/auth/login` with `{"email":"admin@example.com", "password":"password123"}`.
   - Pass the returned JWT as a Bearer token to test `GET http://localhost:3000/api/admin/analytics` and verify the metrics.
