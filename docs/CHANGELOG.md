# Changelog

All notable changes to this project will be documented in this file.

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
