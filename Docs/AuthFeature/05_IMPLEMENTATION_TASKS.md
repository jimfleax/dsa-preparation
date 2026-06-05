# Implementation Tasks (Micro-Sections)

## Task 1: Environment & Dependency Setup
- Install `@clerk/clerk-react` and `@clerk/express`.
- Add `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env`.
- Remove global `LEETCODE_USERNAME` from `.env`.

## Task 2: Database Restructuring
- Update `src/models/ProblemProgress.ts` to include `userId: String` and change the index to `{ userId: 1, titleSlug: 1 }`.
- Create `src/models/User.ts` for storing `clerkUserId` and `leetcodeUsername`.

## Task 3: Backend Middleware & Security
- Update `server.ts` to include `clerkMiddleware()`.
- Create a router guard for `/api/*` routes using `requireAuth()`.
- Refactor all existing queries in `src/controllers/problemController.ts` to include `{ userId: req.auth.userId }`.

## Task 4: User Configuration API
- Create `src/routes/userRoutes.ts` and `userController.ts`.
- Implement `GET /api/user/settings` and `POST /api/user/settings` to read/update the `leetcodeUsername` for `req.auth.userId`.

## Task 5: Frontend Auth Integration
- Wrap `App` in `<ClerkProvider>`.
- Refactor `App.tsx` layout to use `<SignedIn>` and `<SignedOut>`.
- Place `<UserButton />` in the Navbar.

## Task 6: Frontend Settings & Sync Refactor
- Create a `SettingsModal.tsx` to collect the LeetCode Username if it's missing.
- Refactor `ProblemsTab.tsx`'s auto-sync `useEffect` to ensure the user has a configured LeetCode username before calling `/api/sync`.

## Task 7: Sync Logic Refactor
- Refactor `src/controllers/syncController.ts` to fetch the target username from the `User` DB model based on `req.auth.userId`, instead of using `process.env`.
