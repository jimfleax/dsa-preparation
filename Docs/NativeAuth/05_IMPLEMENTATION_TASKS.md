# Implementation Tasks (Micro-Sections)

## Task 1: Environment & Dependency Setup
- Uninstall `@clerk/clerk-react`, `@clerk/express`.
- Install `jsonwebtoken`, `bcryptjs`, and their types.
- Add `JWT_SECRET` to `.env`.

## Task 2: Backend Auth Logic
- Create/update `src/models/User.ts` with password hashing logic.
- Create `src/controllers/authController.ts` (Login & Register functions).
- Create `src/routes/authRoutes.ts`.
- Create `src/middleware/authMiddleware.ts` for JWT verification.

## Task 3: Controller Refactoring
- Update `problemController.ts` and `syncController.ts` to use `req.user.id` instead of `req.auth.userId`.
- Update `ProblemProgress` schema to use `mongoose.Schema.Types.ObjectId` for `userId`.

## Task 4: Frontend Auth Context
- Create `src/context/AuthContext.tsx`.
- Wrap `App.tsx` with the provider.
- Implement a custom `fetchWithAuth` utility to handle token injection and 401 logouts.

## Task 5: Frontend UI Views
- Build `Login.tsx` and `Register.tsx` forms.
- Build `SettingsModal.tsx` for managing the LeetCode username.
- Implement protected route logic in `App.tsx` to conditionally render the main workspace or the auth views.
