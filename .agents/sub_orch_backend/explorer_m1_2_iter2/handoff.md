# Handoff Report: Analytics Controller Bug Fix

## 1. Observation
- Inspected `/home/reetabratabhandari/Projects/dsa-preparation/backend/src/controllers/admin/analyticsController.ts`.
- At lines 11-27, `solvedCount` and `revisingCount` are computed unconditionally using `TrackedProblem.countDocuments(...)` within the same `Promise.all` that fetches the `tracks`.
- At lines 29-37, `uniqueProblems` is computed *after* fetching the `tracks` to calculate `totalProblemsAvailable`.
- As verified in the Challenger report (`/home/reetabratabhandari/Projects/dsa-preparation/.agents/sub_orch_backend/challenger_m1_1/handoff.md`), the lack of `titleSlug` filtering on `solvedCount` and `revisingCount` allows problems solved outside the current tracks to inflate the counts, causing `unsolvedCount` to hit `0` via `Math.max(0, ...)` and distorting the completion rate metrics.

## 2. Logic Chain
1. To accurately calculate the problem completion rate restricted to the track curriculum, `solvedCount` and `revisingCount` must only consider `TrackedProblem` records whose `titleSlug` belongs to `uniqueProblems`.
2. Because `uniqueProblems` requires `tracks` to be fetched and parsed first, the queries for `solvedCount` and `revisingCount` cannot be executed in the initial `Promise.all` block.
3. Therefore, the `Promise.all` must be split. The first block fetches `tracks` (along with global counts). We then extract `uniqueProblems` as an array (`uniqueProblemsArr`). Finally, a second `Promise.all` block calculates `solvedCount` and `revisingCount` with the filter `titleSlug: { $in: uniqueProblemsArr }`.

## 3. Caveats
- `totalSolvedGlobally` (lines 16, 24) remains unchanged as it properly measures overall engagement, including problems not explicitly listed in active tracks.
- This two-step querying approach introduces a slight sequential delay since we have to await `tracks` before querying `solvedCount` and `revisingCount`, but this is required for correctness.

## 4. Conclusion
The implementation of `getAnalytics` is mathematically flawed due to unbounded `TrackedProblem` counts for curriculum metrics. The fix is to extract `solvedCount` and `revisingCount` from the initial `Promise.all` and fetch them sequentially *after* computing the array of `uniqueProblems`.

**Proposed Code Changes to `backend/src/controllers/admin/analyticsController.ts`**:
```typescript
    const [
      totalUsers,
      newUsers,
      totalTracks,
      tracks,
      totalSolvedGlobally
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Track.countDocuments(),
      Track.find().lean(),
      TrackedProblem.countDocuments({ notrack: { $ne: true } })
    ]);

    // Total problems available (unique titleSlugs in tracks)
    const uniqueProblems = new Set<string>();
    tracks.forEach(track => {
      track.problems?.forEach((p: any) => uniqueProblems.add(p.titleSlug));
      track.parts?.forEach((part: any) => {
        part.problems?.forEach((p: any) => uniqueProblems.add(p.titleSlug));
      });
    });
    const totalProblemsAvailable = uniqueProblems.size;
    const uniqueProblemsArr = Array.from(uniqueProblems);

    // Now calculate solved/revising count filtered by only tracked problems
    const [solvedCount, revisingCount] = await Promise.all([
      TrackedProblem.countDocuments({ notrack: { $ne: true }, titleSlug: { $in: uniqueProblemsArr }, attemptCount: 1 }),
      TrackedProblem.countDocuments({ notrack: { $ne: true }, titleSlug: { $in: uniqueProblemsArr }, attemptCount: { $gt: 1 } })
    ]);
```

## 5. Verification Method
1. Execute the modified `analyticsController.ts` using the test described in the Challenger report.
2. In a MongoDB test environment:
   - Create a single Track with `titleSlug: "two-sum"`.
   - Create two `TrackedProblem` records for a single user: one for `"two-sum"` and one for `"three-sum"`.
   - Call the `getAnalytics` endpoint.
   - Verify `completionRate.solved` equals `1` and not `2`. Total possible interactions should be `1` (1 unique problem * 1 user), and `completionRate.unsolved` should correctly be `0`.
