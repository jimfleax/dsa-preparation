# Changelog

All notable changes to this project will be documented in this file.

## [2026-06-08] - Automated LeetCode Submissions Sync
- **Changed:** `src/models/ProblemProgress.ts`, `src/types.ts`, `src/lib/leetcodeScraperUtil.ts`, `src/controllers/syncController.ts`, `src/controllers/problemController.ts`, `src/routes/syncRoutes.ts`, `src/routes/problemRoutes.ts`, `src/App.tsx`, `src/components/ProblemsTab.tsx`
- **Added:** `src/components/SyncToast.tsx`, `src/components/UntrackedProblemsModal.tsx`
- **Why:** Integrated LeetCode API to auto-fetch new accepted submissions on app load. Added `notrack` schema property and management modal to allow users to permanently dismiss submissions from the main tracker without losing the prompt state.
- **Risk:** LOW — Additive change. Backward-compatible Schema update, protected endpoints, and failure-tolerant API scraping.
- **Verification:** Verified via `tsc --noEmit` and functional code review.

## [2026-06-08] - Edit Problem Feature
- **Changed:** `src/controllers/problemController.ts`, `src/routes/problemRoutes.ts`, `src/components/EditProblemModal.tsx`, `src/components/ProblemsTab.tsx`
- **Why:** To allow users to modify tracked problems (URL, attempts) and delete them via a modal.
- **Risk:** Low. Uses existing auth and data structures. Update fetches real data before overriding.
- **Verification:** Verified via TypeScript compiler check and component review.

## [2026-06-08] - Add LeetCode Difficulty Tracking
- **Changed:** `src/lib/leetcodeScraperUtil.ts`, `src/controllers/problemController.ts`, `src/models/ProblemProgress.ts`, `src/types.ts`, `src/components/AddProblemModal.tsx`, `src/components/ProblemsTab.tsx`
- **Why:** Integrated LeetCode problem difficulty ratings to provide more context to tracked problems. Implemented scraping the difficulty from the LeetCode GraphQL API, saving it to MongoDB, and displaying it with consistent styling (badges) in the frontend components.
- **Risk:** LOW — Additive change. Backward-compatible Schema update allowing existing records to have empty or fallback values (N/A).
- **Verification:** Verified via `_test_feature.ts` script for scraper utility and `tsc --noEmit` for typing across the full stack.

## [2026-06-05] - Native Authentication Migration (Clerk Removal)
- **Changed:** `src/main.tsx`, `src/App.tsx`, `src/models/User.ts`, `server.src.ts`, `src/components/SettingsModal.tsx`, `src/components/AddProblemModal.tsx`, `src/components/ProblemsTab.tsx`
- **Why:** Migrated authentication from Clerk to a native JWT-based system to ensure data ownership and decouple from third-party vendor limits. Replaced all Clerk UI components with native `LoginModal` and `RegisterModal`, backed by `AuthContext`.
- **Risk:** HIGH — Replaces the entire authentication core and touches all protected routes/components.
- **Verification:** Verified via `_test_feature.ts` script for end-to-end user registration, login (JWT minting), and protected route (`/api/user/settings`) access using the minted token.

## [2026-06-05] - Backend Deployment Stability & Error Handling Fix
- **Changed:** `server.src.ts`
- **Why:** Fixed a critical bug in production where missing Clerk keys (e.g., `CLERK_PUBLISHABLE_KEY`) caused `clerkMiddleware()` to crash silently inside Express, returning a 500 HTML error on public endpoints like `/api/documents` and `/api/health`. Added a global Express error handler to guarantee JSON responses, explicit checks for environment variables, and detailed server logs.
- **Risk:** LOW — Improves server robustness and error transparency without changing business logic.
- **Verification:** Verified via local simulated failure testing (`curl -s http://localhost:3000/api/health`) with intentionally missing keys.

## [2026-06-05] - DSA Problem Tracking Feature

- **Changed:** `server.ts`, `src/App.tsx`, `src/types.ts`, `package.json`
- **Added:**
  - `src/lib/db.ts` — Mongoose connection with graceful shutdown
  - `src/models/ProblemProgress.ts` — Mongoose schema for tracked problems
  - `src/controllers/problemController.ts` — List & Add problem API logic
  - `src/controllers/syncController.ts` — LeetCode submission sync logic
  - `src/routes/problemRoutes.ts` — Express router for `/api/problems`
  - `src/routes/syncRoutes.ts` — Express router for `/api/sync`
  - `src/components/ProblemsTab.tsx` — Dense table view for tracked problems
  - `src/components/AddProblemModal.tsx` — Modal to add problems via URL
  - `.env.example` — Environment variable template
  - `_test_db_connection.ts` — DB connection verification script
  - `_test_api_endpoints.ts` — API endpoint test script
- **Why:** Implements the full-stack "Problem Tracking" feature as outlined in `Docs/00_OVERVIEW.md` through `Docs/04_IMPLEMENTATION_STEPS.md`. Enables users to track, sync, search, and filter DSA problems from LeetCode.
- **Risk:** MEDIUM — Introduces MongoDB as a new infrastructure dependency. All existing "Learn" tab functionality is fully preserved behind a tab guard.
- **Verification:** Verified via `npm run lint` (zero errors), `_test_db_connection.ts`, and `_test_api_endpoints.ts`.
