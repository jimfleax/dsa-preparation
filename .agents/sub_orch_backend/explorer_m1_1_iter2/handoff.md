# Milestone 1: Admin Backend Fix for Analytics Controller

## 1. Observation
- In `backend/src/controllers/admin/analyticsController.ts`, `solvedCount` and `revisingCount` were queried inside the initial `Promise.all` alongside `Track.find().lean()`.
- They did not filter by `titleSlug`, which caused problems not currently listed in any `Track` to be included in the counts.
- `totalPossibleInteractions` correctly bounds the curriculum size based on active tracks (`uniqueProblems.size * totalUsers`).
- `unsolvedCount` is then derived from `totalPossibleInteractions - (solvedCount + revisingCount)`.
- If users solve problems outside the tracked curriculum, `solvedCount + revisingCount` exceeds `totalPossibleInteractions`, leading to an incorrect `unsolvedCount` and total sum for the completion rate pie chart.

## 2. Logic Chain
- To accurately reflect completion of the track curriculum, `solvedCount` and `revisingCount` must only count problems that exist in the currently active tracks.
- We must extract `uniqueProblems` (an array of `titleSlug`s) from the fetched `tracks` first.
- We can then perform a secondary `Promise.all` to count `TrackedProblem` records where `attemptCount` matches the criteria AND `titleSlug: { $in: Array.from(uniqueProblems) }`.
- `totalSolvedGlobally` measures total engagement unconditionally, so it remains in the first `Promise.all` without the `titleSlug` filter.

## 3. Caveats
- Splitting the queries into two `Promise.all` calls adds a slight database latency overhead, but it is necessary for data correctness.
- The `notrack: { $ne: true }` filter is preserved for backwards compatibility with the existing schema logic.

## 4. Conclusion
The proposed fix resolves the bug by filtering `solvedCount` and `revisingCount` against the active curriculum slugs (`uniqueProblemSlugs`). A complete drop-in replacement file `proposed_analyticsController.ts` has been written to the explorer's workspace directory. The implementer should replace `backend/src/controllers/admin/analyticsController.ts` with this file.

## 5. Verification Method
1. Copy the content of `proposed_analyticsController.ts` into `backend/src/controllers/admin/analyticsController.ts`.
2. Run `npm run build` in the `backend/` directory to ensure there are no TypeScript errors.
3. Run the adversarial test provided in `challenger_m1_1/handoff.md` to confirm `solvedCount` is properly bounded.

```ts
// adversarial test pseudo-code:
// User solves "two-sum" (in Track) and "three-sum" (Not in Track).
// The analytics endpoint should report solved = 1 in the completionRate object, not 2.
```
