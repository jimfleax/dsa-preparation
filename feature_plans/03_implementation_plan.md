# Implementation Plan

This document outlines the step-by-step procedure to implement the Tracker and Roadmap Tracks features. Ensure all tests and compilations pass before moving to the next phase.

## Phase 1: Backend Renaming (Problems -> Tracker)
1. **Rename Model:**
   - Rename file: `src/models/ProblemProgress.ts` -> `src/models/TrackedProblem.ts`.
   - Inside the file, rename `IProblemProgress` to `ITrackedProblem` and `ProblemProgressSchema` to `TrackedProblemSchema`. Update the export default to use `"TrackedProblem"`.
2. **Rename Controller:**
   - Rename file: `src/controllers/problemController.ts` -> `src/controllers/trackerController.ts`.
   - Update imports to use `TrackedProblem.ts`.
3. **Rename Routes & Server Mounts:**
   - Rename file: `src/routes/problemRoutes.ts` -> `src/routes/trackerRoutes.ts`.
   - In `src/server.ts`, update the route import and mount path: `app.use("/api/tracker", trackerRoutes)`.
4. **Update Sync Controller:**
   - In `src/controllers/syncController.ts` (and anywhere else), update imports and references from `ProblemProgress` to `TrackedProblem`.

## Phase 2: Frontend Renaming & Refactoring
1. **Update Types:**
   - In `src/types.ts`, rename the interface `ProblemProgress` to `TrackedProblem`.
2. **Rename Components:**
   - Rename `src/components/ProblemsTab.tsx` to `src/components/TrackerTab.tsx`.
   - Search globally in `src/components/` for `ProblemProgress` and replace with `TrackedProblem`. This includes updating `EditProblemModal.tsx`, `UntrackedProblemsModal.tsx`, `SmartRevisitModal.tsx`, etc.
3. **Update API Calls:**
   - In `TrackerTab.tsx`, `App.tsx`, `AddProblemModal.tsx`, `SmartRevisitModal.tsx`, and `UntrackedProblemsModal.tsx`, update all `fetch` calls referencing `/api/problems` to `/api/tracker`.
4. **Update App Navigation (`App.tsx`):**
   - Rename the existing "Problems" navigation button label to "Tracker".
   - Introduce a new state for the tabs: `activeMainTab: "learn" | "problems" | "tracker"`.

## Phase 3: Backend Track Implementation
1. **Create `Track` Model:**
   - File: `src/models/Track.ts`.
   - Implement schema as defined in `02_requirements.md` (fields: title, description, order, array of problems with titleSlug, title, url, difficulty).
2. **Create `Track` Controller & Routes:**
   - File: `src/controllers/trackController.ts`. Include a `getAllTracks` function.
   - File: `src/routes/trackRoutes.ts`. Route `GET /` to `getAllTracks`.
3. **Mount Track Routes:**
   - In `src/server.ts`, add `app.use("/api/tracks", trackRoutes)`.

## Phase 4: Frontend "Problems" (Tracks) UI
1. **Create `src/components/TracksTab.tsx`:**
   - Add state for `tracks` (from `/api/tracks`) and `trackedProblems` (from `/api/tracker`).
   - Use `useEffect` to fetch both concurrently on mount.
   - Calculate derived state: `completedTracks`, `incompleteTracks`.
   - Implement filtering (All/Completed/Incomplete) using a local state.
   - Sort tracks based on `lastAttemptedDate` of their inner problems found in `trackedProblems`. (If none found, sort by `Track.order`).
2. **Create `src/components/TrackCard.tsx`:**
   - Receives a `track` object and a map of `trackedProblems` for fast lookup.
   - Render an accordion UI. The header shows the track title and a progress bar (e.g., "5/10 Completed").
   - Expanded state shows the list of problems. Each problem row shows a checkmark if completed, or an "Attempt" button if not.
3. **Mount in `App.tsx`:**
   - Render `<TracksTab />` when `activeMainTab === "problems"`.

## Phase 5: The Attempt Modal Integration
1. **Create `AttemptProblemModal.tsx`** (or adapt `SmartRevisitModal.tsx`):
   - When "Attempt" is clicked on a Track problem, open this modal.
   - **Phase 1:** Shows problem details (Title, Difficulty). Button: "Open in LeetCode".
   - **Phase 2:** After clicking, changes to "Are you done attempting?" -> buttons "Yes, Track it" and "Cancel".
   - On "Yes, Track it", make a `POST` request to `/api/tracker` with the `url`. If it succeeds, call a callback to re-fetch the `trackedProblems` state in `TracksTab.tsx` to instantly update the UI.

## Phase 6: Overall Metrics Dashboard
1. **Build Dashboard inside `TracksTab.tsx`:**
   - At the top of the component, use Recharts to display:
     - A Pie Chart of Overall Tracked problems vs Total problems in Tracks.
     - A small grid or Bar Chart showing progress distribution per track.
   - Ensure styles match the existing `StatsGrid` and dashboard aesthetics in the app.

## Phase 7: Final Review & Cleanup
- Check for any leftover "problems" route references or broken imports.
- Ensure TypeScript compiles successfully (`npx tsc --noEmit`).
- Verify responsive design (mobile vs desktop) for the new Track cards.