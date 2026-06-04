# Implementation Plan

## Phase 1: Backend Infrastructure & Database
1. Create `.env` file for `MONGODB_URI` and `LEETCODE_USERNAME`.
2. Create `src/lib/db.ts` to establish the Mongoose connection.
3. Create Mongoose model `ProblemProgress` in `src/models/ProblemProgress.ts`.
4. Import and initialize the database connection in `server.ts`.

## Phase 2: API Route Development
1. Build `GET /api/problems` to list tracked problems from the DB.
2. Build `POST /api/problems` to add a new problem to the database.
3. Build `POST /api/sync`. This route will read `LEETCODE_USERNAME` from `process.env`, fetch the `/acSubmission` endpoint from `alfa-leetcode-api`, parse the submissions, and perform an upsert/update on the MongoDB documents.

## Phase 3: Frontend Refactoring (Tabs & Layout)
1. Update `App.tsx` state to include `activeMainTab` ('learn', 'problems').
2. Update the `<header>` in `App.tsx` to include the Tab selectors and the dynamic "Add Problem" button.
3. Conditionally render the existing `StatsGrid` and `Documents` grid only when the 'Learn' tab is active.

## Phase 4: Frontend 'Problems' View & Modal
1. Create `ProblemsTab.tsx` component to fetch and display data from `/api/problems`.
2. Implement the Dense Table View structure with sorting/filtering local state.
3. Add a `useEffect` inside `ProblemsTab.tsx` with a mount-flag to send a one-time request to `POST /api/sync` on initial load, followed by fetching the updated list.
4. Create `AddProblemModal.tsx` utilizing Lucide icons and Tailwind styles matching the `index.css` aesthetic.
5. Implement the auto-fetch title logic `onBlur` or `onChange` of the URL input.

## Phase 5: Verification & Testing
1. Test MongoDB connection resilience.
2. Verify API rate-limit handling for `alfa-leetcode-api`.
3. Validate Table UI responsiveness and color consistency.
