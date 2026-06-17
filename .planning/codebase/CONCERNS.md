# Codebase Concerns and Technical Debt

This document details observed technical debt, areas of high complexity, tight coupling, and performance bottlenecks within the `dsa-preparation` codebase.

## 1. High Complexity & Tight Coupling (God Components)
Several frontend components have grown significantly in scope, taking on too many responsibilities and violating the Single Responsibility Principle.

*   **`frontend/src/App.tsx` (~1,200 lines)**: 
    This acts as a "God Component". It manages the top-level layout, multiple view states (Home, Learn, Tracker, Tracks), network connectivity tracking, complex authentication/login modals, user settings, search states, API sync logic, and global keyboard shortcuts. It should be broken down into a standard router structure (e.g., React Router) with separate page components and dedicated context providers for connectivity and search state.
*   **`frontend/src/components/TrackerTab.tsx` (~900 lines)**: 
    This component manages data fetching, complex client-side filtering/sorting logic, infinite scroll state, multiple edit/delete modals, smart revisiting features, and rendering pie charts. State management should be decoupled from the presentation layer (e.g., using a custom hook `useTrackerProblems`), and the modals/charts should be extracted into separate, smaller components.
*   **`backend/server.src.ts` (~380 lines)**:
    While not overwhelmingly large, it handles Express bootstrapping, DB connection, CORS logic, and contains inline business logic for reading and parsing markdown files (`/api/documents` and `/api/document`). This inline logic should be extracted into a dedicated `documentsController.ts`.

## 2. Logical Bugs & Pagination Mismatches (Critical)
There is a severe architectural mismatch between the backend's pagination and the frontend's data manipulation logic.

*   **Client-Side Filtering/Sorting on Paginated Data (`TrackerTab.tsx`)**:
    The backend provides paginated results (e.g., `limit=20`), but the frontend performs search and sorting purely on the client side (`useMemo` over the `problems` state). This means if a user searches for a problem that exists on page 3, it will **not** be found unless the user has manually triggered the infinite scroll to load page 3. Similarly, sorting by attempt count will only sort the *currently loaded* chunk, not the global dataset. The backend actually supports server-side search and sort (`?search=<text>&sort=...`), but the client neglects to use it properly.
*   **Progress Calculation on Partial Data (`TracksTab.tsx`)**:
    To calculate overall progress and categorize tracks, the component fetches progress via `/api/tracker` without query parameters. Because the backend defaults to `limit=50`, if a user has solved more than 50 problems, the remaining problems will simply be ignored in the "Tracks Mastered" and "Problems Solved" calculations.

## 3. Server-Side Performance Bottlenecks
*   **Synchronous File I/O (`backend/server.src.ts`)**:
    The endpoints `/api/documents` and `/api/document` use synchronous `fs.readdirSync` and `fs.readFileSync` to read markdown files and parse frontmatter. Because Node.js is single-threaded, hitting these endpoints blocks the entire event loop. As the number of documents grows or concurrent users increase, this will cause severe API latency. **Recommendation**: Switch to `fs.promises.readFile`/`readdir` or cache the parsed documents in memory on startup.

## 4. Over-Engineered Client Caching
*   **RxDB/RxJS for Simple Caching (`frontend/src/lib/apiFetch.ts`)**:
    The project imports `rxdb`, `rxjs`, and `dexie` simply to cache `GET` API requests using a network-first strategy. `rxdb` is a powerful, heavy library designed for offline-first, reactive, multi-device synchronization. Using it purely to cache stringified API responses is massive overkill and heavily inflates the frontend bundle size. **Recommendation**: Replace this with the native browser Cache API, a Service Worker (Workbox is already in `package.json`), or a simple IndexedDB wrapper.

## 5. Minor Technical Debt
*   **Missing DB Indexes**: The `Track` model (`backend/src/models/Track.ts`) lacks indexes on commonly queried/sorted fields (e.g., `order`), which could cause performance drops during `Track.find().sort({ order: 1 })`.
*   **Unused Dependencies**: The backend `package.json` includes `@google/genai`, but it is not currently utilized in any business logic.
