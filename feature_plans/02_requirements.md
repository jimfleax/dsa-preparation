# Technical Requirements & Architecture

## 1. Database Schema (MongoDB)

### 1.1 Existing Model Rename
- **`ProblemProgress` -> `TrackedProblem`**
  - The existing schema (`userId`, `titleSlug`, `title`, `url`, `difficulty`, `attemptCount`, `lastAttemptedDate`, `notrack`) will remain unchanged.
  - The collection name in MongoDB may stay the same under the hood to prevent data migration issues, or be migrated if required. For the scope of the backend logic, the mongoose model should be renamed to `TrackedProblem`.

### 1.2 New Model: `Track`
To make tracks dynamic and scalable, they will be stored in the database.
- **Schema:**
  - `title` (String, required): e.g., "Foundational Binary Search"
  - `description` (String, optional): Brief description of the track.
  - `order` (Number, default 0): For default UI sorting.
  - `problems` (Array of Subdocuments):
    - `titleSlug` (String, required): For mapping to `TrackedProblem`
    - `title` (String, required)
    - `url` (String, required)
    - `difficulty` (String, Enum: ["Easy", "Medium", "Hard"])
  - `timestamps` (createdAt, updatedAt)

*Note:* We DO NOT store user progress inside the `Track` model. Progress is purely a derived state computed on the frontend or backend by cross-referencing `Track.problems[].titleSlug` with the user's `TrackedProblem` records.

## 2. Backend API Endpoints

### 2.1 Renaming Existing Endpoints
The existing `/api/problems` routes will be renamed to `/api/tracker`:
- `GET /api/tracker` (Fetch all tracked problems)
- `POST /api/tracker` (Add a problem to tracker)
- `PATCH /api/tracker/:id/revisit` (Revisit)
- `DELETE /api/tracker/:id` (Delete)

### 2.2 New Endpoints for Tracks
- `GET /api/tracks`
  - Fetches all global tracks.
  - No authentication required if tracks are public, or require Auth to match current app security posture.
  - Response: `{ success: true, tracks: ITrack[] }`

*Note:* Because deriving progress requires the user's tracker data, the frontend will fetch both `GET /api/tracks` and `GET /api/tracker` independently and compute the progress metrics client-side. This keeps the backend highly decoupled and cacheable.

## 3. Frontend Architecture

### 3.1 Types (`src/types.ts`)
- Rename `ProblemProgress` interface to `TrackedProblem`.
- Add `Track` interface.
- Add `TrackProblem` interface.

### 3.2 State Management & Top-Level (`App.tsx`)
- Update `activeMainTab` state to support three tabs: `"learn" | "tracks" | "tracker"`.
- Rename "Problems" to "Tracker" in the UI header.
- Add a new "Problems" (Tracks) tab in the header.

### 3.3 Components to Rename/Refactor
- `src/components/ProblemsTab.tsx` -> `src/components/TrackerTab.tsx`
- Ensure all references to the old API routes (`/api/problems`) are updated to (`/api/tracker`).

### 3.4 New Components (`src/components/`)
- **`TracksTab.tsx`**: The main view for the new "Problems" category.
  - **Metrics Dashboard**: Recharts implementation showing overall completion % and per-track completion pie/bar charts.
  - **Filter Controls**: Dropdowns/buttons for "All", "Completed", "Incomplete".
  - **Tracks List**: Maps through tracks and renders `TrackCard`.
- **`TrackCard.tsx`**: 
  - Displays track title, description, and a mini progress bar.
  - Accordion style: clicking expands to show the list of `TrackProblem`s.
- **`AttemptProblemModal.tsx`** (or parameterized `SmartRevisitModal.tsx`):
  - Needs Phase 1: Show problem -> "Attempt" button opens URL.
  - Needs Phase 2: "Are you done attempting?" -> "Yes, Track it" / "Cancel".
  - If "Yes, Track it", sends a POST request to `/api/tracker` (if new) or PATCH (if revisiting).

## 4. Derived State Logic (Client-Side)
- A Track is considered **Completed** if EVERY problem inside `Track.problems` has a corresponding `TrackedProblem` record for the current user.
- A Track's **Last Attempted Date** is the maximum `lastAttemptedDate` among all its problems that the user has tracked. This will be used for sorting tracks.
- Overall Completion % = `(Total unique tracked problems present in all tracks) / (Total problems across all tracks) * 100`.