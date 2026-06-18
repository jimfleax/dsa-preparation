# Codebase Concerns and Potential Issues

This document maps the primary technical concerns, security risks, scaling bottlenecks, and technical debt present in the DSA Preparation repository. These findings are synthesized from the existing codebase structure, `CODEBASE_AUDIT.md`, `refactoring_plan.md`, and previous architectural audits.

## 1. Security Risks

*   **XSS Susceptibility via `localStorage` (High Risk):** 
    *   JWT tokens are currently stored in `localStorage` (`frontend/src/context/AuthContext.tsx`). This makes the application highly susceptible to session hijacking if a Cross-Site Scripting (XSS) vulnerability is introduced. 
    *   *Recommendation:* Migrate to `HttpOnly`, `Secure`, `SameSite` cookies for authentication state.
*   **No Token Revocation Strategy (Medium Risk):**
    *   Tokens are issued with a 30-day lifespan (`expiresIn: "30d"`) but remain valid on the backend even after a user logs out (`authController.ts`). Stolen tokens cannot be revoked.
    *   *Recommendation:* Implement short-lived access tokens with refresh tokens, or a token blacklist using Redis/MongoDB.

## 2. Logical Bugs & Architectural Mismatches (Critical)

*   **Client-Side Filtering/Sorting on Paginated Data (`TrackerTab.tsx`):**
    *   The backend provides paginated results (e.g., `limit=20`), but the frontend performs search and sorting purely on the client side (`useMemo` over the `problems` state). Searching for a problem on an unloaded page fails. Sorting by attempt count only sorts the *currently loaded* chunk.
    *   *Recommendation:* Implement server-side search and sort properly (`?search=<text>&sort=...`) since the backend already supports it.
*   **Progress Calculation on Partial Data (`TracksTab.tsx`):**
    *   To calculate overall progress, it fetches via `/api/tracker` without query parameters. Since it defaults to `limit=50`, users with >50 problems will have inaccurate progress states.

## 3. Scaling Bottlenecks and Server-Side Performance Issues

*   **Synchronous File I/O Blocking the Event Loop (`backend/server.src.ts`):** 
    *   Endpoints `/api/documents` and `/api/document` use synchronous operations (`fs.readdirSync`, `fs.readFileSync`). This blocks the entire event loop for all concurrent requests.
    *   *Recommendation:* Transition to asynchronous file system operations (`fs.promises.*`).
*   **N+1 Queries and Sequential Network Calls (`src/controllers/syncController.ts`):** 
    *   The `trackSubmissions` endpoint iterates over submissions with sequential MongoDB queries (`findOne`) and LeetCode API fetches. This operates with O(N) latency.
    *   *Recommendation:* Utilize `insertMany` and `Promise.all` for concurrent batching.
*   **Inefficient DB Fetching (`src/controllers/syncController.ts`):** 
    *   The `checkSync` endpoint pulls a user's entire history into memory to check existing submissions, rather than filtering dynamically via the database using `$in`.
*   **Missing and Suboptimal Indexes:** 
    *   Crucial compound indexes are missing. Queries in `TrackedProblem` lack comprehensive coverage, text searches trigger full collection scans due to missing text indexes, and `Track` lacks an `order` index.

## 4. Frontend Performance & Client-Side Bottlenecks

*   **Over-Engineered Client Caching (`frontend/src/lib/apiFetch.ts`):**
    *   The project uses `rxdb`, `rxjs`, and `dexie` for simple API `GET` caching. This is massive overkill and inflates bundle size.
    *   *Recommendation:* Replace with the native browser Cache API, a Service Worker, or a simple IndexedDB wrapper.
*   **Lack of Code Splitting for Heavy Views:** 
    *   Heavy views (`TrackerTab` with `recharts` and `PreviewPanel` with `react-markdown`) are eagerly loaded in `App.tsx`, inflating the initial JS bundle size.
    *   *Recommendation:* Implement route/tab-level code splitting using `React.lazy` and `Suspense`.
*   **Excessive Re-renders from Global State & Contexts:** 
    *   The frontend relies on monolithic global state in `App.tsx` (like `searchQuery`) triggering full tree re-renders per keystroke. Modals remain perpetually mounted. Context Providers (e.g., `AuthContext`) use object literals directly, causing downstream re-renders.

## 5. Technical Debt & Code Organization

*   **Monolithic "God Components" and SRP Violations:** 
    *   **Frontend (`src/App.tsx` - ~1,200 lines):** Acts as a massive monolith managing routing, offline state, data fetching, search states, API sync logic, global keyboard shortcuts, and rendering logic for multiple tabs and modals. Should be broken down into a standard router structure.
    *   **Frontend (`src/components/TrackerTab.tsx` - ~900 lines):** Manages data fetching, complex client-side filtering, infinite scroll, edit/delete modals, and charts. State management should be decoupled.
    *   **Backend (`server.src.ts` - ~380 lines):** Mixes Express server setup, CORS configuration, raw file parsing logic, and route proxying.
*   **DRY Violations:** 
    *   Repeated layouts and logic (mapping loops, badges, date logic) appear across tracker views (`TrackerTab.tsx`, `SmartRevisitModal.tsx`). 
*   **Type Safety Gaps:**
    *   Pervasive use of `any` types in catch blocks (`catch (err: any)`) and API response mapping bypasses TypeScript's safety mechanisms.
*   **Stray Debugging Code:** 
    *   Production code contains lingering `console.log` and `console.error` statements which may inflate logging costs and expose internal behavior.

## 6. Lacking Documentation

*   **Architecture & Onboarding Gaps:** 
    *   While the `README.md` is well-written for end users and getting started locally, there is a lack of deep, inline developer documentation describing the database schema rationale, LeetCode synchronization architectural decisions, and detailed API documentation.
