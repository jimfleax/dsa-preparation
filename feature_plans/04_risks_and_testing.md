# Risks, Testing, and Verification Plan

## 1. Risks & Potential Pitfalls

### 1.1 MongoDB Collection Name Derivation (High Risk)
- **The Issue:** Mongoose automatically derives the MongoDB collection name from the Model name (e.g., model `"ProblemProgress"` -> collection `"problemprogresses"`). If we rename the model to `"TrackedProblem"`, Mongoose will query a new, empty collection called `"trackedproblems"`, making it seem like all user data was deleted.
- **The Fix:** Explicitly pass the old collection name as the third argument to the `mongoose.model` function to ensure backward compatibility:
  ```typescript
  export default mongoose.model<ITrackedProblem>(
    "TrackedProblem",
    TrackedProblemSchema,
    "problemprogresses" // CRITICAL: Maintains access to existing data
  );
  ```

### 1.2 Broken Imports and String References (Medium Risk)
- **The Issue:** While TypeScript will catch broken module imports if a file is renamed, it will *not* catch broken string literals, such as `fetch("/api/problems")`.
- **The Fix:** Conduct a global regex search across the `/src` directory for `/api/problems` and replace them with `/api/tracker`.

### 1.3 State Synchronization in Tracks UI (Medium Risk)
- **The Issue:** When a user completes a problem inside a Track, the UI might not update immediately if the local `trackedProblems` state is not refetched or updated.
- **The Fix:** The `AttemptProblemModal` must accept an `onSuccess` callback. When the POST request to `/api/tracker` resolves, this callback must trigger a re-fetch of `GET /api/tracker` to ensure the Track card immediately shows the problem as completed.

### 1.4 Client-Side Performance (Low/Medium Risk)
- **The Issue:** Deriving the progress of Tracks requires checking if a Track's problem exists in the user's `trackedProblems` array. Using `array.find()` inside a nested loop over hundreds of problems is $O(N \times M)$ and can cause UI stutter.
- **The Fix:** Transform the `trackedProblems` array into a Hash Map (Dictionary) keyed by `titleSlug` (e.g., `Record<string, TrackedProblem>`). This makes lookups $O(1)$.

## 2. Verification Steps

### 2.1 Backend Verification
1. **Compilation Check:** Run `npx tsc --noEmit` to ensure no type errors remain after the rename.
2. **Endpoint Health Checks:**
   - Test `GET /api/tracker` using an authenticated tool (Postman/cURL). Verify existing data is returned (proves collection binding works).
   - Test `GET /api/tracks` to ensure it returns the global roadmap tracks.

### 2.2 Frontend Verification
1. **Routing & Navigation:**
   - Verify the top navigation now shows "Learn", "Problems", and "Tracker".
   - Click "Tracker" and ensure it loads the previously known "ProblemsTab" correctly, including Stats and the data table.
2. **Track UI rendering:**
   - Click "Problems". Verify that the Tracks load correctly.
   - Expand a track and check that the problems list renders.
   - Verify that the Completion Progress logic works (completed items are checked, incomplete show "Attempt").
3. **Attempt Flow (End-to-End):**
   - Click "Attempt" on an incomplete problem in a track.
   - Verify the Modal opens and displays Phase 1.
   - Click "Open in LeetCode". Verify Phase 2 appears.
   - Click "Yes, Track it".
   - Verify that the modal closes, a success toast/indicator appears, and the problem in the Track *immediately* changes to a completed state.
4. **Metrics Verification:**
   - Verify that adding a new tracked problem correctly increments the Recharts progress ring/pie chart in the Tracks dashboard.

## 3. Debugging Guide
- **If user data is "missing" after update:** Check `src/models/TrackedProblem.ts`. Ensure the third argument to `mongoose.model` is `"problemprogresses"`.
- **If attempting a problem throws a 404:** Check the frontend `fetch` calls. Ensure they hit `/api/tracker` instead of `/api/problems`.
- **If the Track progress doesn't update after tracking a problem:** Check the `useEffect` dependencies in `TracksTab.tsx` and ensure the `refreshKey` or fetch callback is being invoked when the modal closes successfully.