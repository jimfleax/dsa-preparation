# Milestone 1: Admin Backend Bug Fix Report

## 1. Observation
- The previous Challenger noted an issue in `backend/src/controllers/admin/analyticsController.ts`: `solvedCount` and `revisingCount` calculate across *all* problems, not just those currently in active tracks.
- Currently, `solvedCount` and `revisingCount` are queried in the very first `Promise.all` block before `uniqueProblems` is even derived. 
- Lines 25-26 in `analyticsController.ts` query `TrackedProblem.countDocuments({ notrack: { $ne: true }, attemptCount: 1 })` and `attemptCount: { $gt: 1 }` unconditionally for all active `titleSlug`s.
- This causes `unsolvedCount` to compute artificially lower (or exactly `0` if `solvedCount + revisingCount > totalPossibleInteractions`), skewing the total `completionRate` metric.

## 2. Logic Chain
- The calculation of `totalPossibleInteractions` depends on `uniqueProblems.size`. 
- To accurately compute problem completion rate relative to the available track curriculum, `solvedCount` and `revisingCount` must also be scoped to `uniqueProblems`.
- By removing `solvedCount` and `revisingCount` from the initial `Promise.all` array and executing them in a subsequent `Promise.all` using the derived `uniqueProblemsArray = Array.from(uniqueProblems)`, the metrics will be appropriately scoped.

## 3. Caveats
- `totalSolvedGlobally` remains in the initial `Promise.all` without the `$in` filter. This correctly continues to measure overall platform engagement regardless of track inclusion.
- Querying with `$in: uniqueProblemsArray` may slightly increase the query time if there are thousands of problems, but given a standard DSA tracking app's scale (~1000 problems), the query overhead is negligible.

## 4. Conclusion
The problem completion rate computation must be fixed by extracting `solvedCount` and `revisingCount` into a separate `Promise.all` block *after* `uniqueProblems` is compiled. 

**Proposed Code Fix in `analyticsController.ts`:**
Remove `solvedCount` and `revisingCount` from the first `Promise.all`, then query them right after `uniqueProblems` is processed:

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
    const uniqueProblemsArray = Array.from(uniqueProblems);

    const [solvedCount, revisingCount] = await Promise.all([
      TrackedProblem.countDocuments({ notrack: { $ne: true }, titleSlug: { $in: uniqueProblemsArray }, attemptCount: 1 }),
      TrackedProblem.countDocuments({ notrack: { $ne: true }, titleSlug: { $in: uniqueProblemsArray }, attemptCount: { $gt: 1 } })
    ]);

    // Unsolved calculate
    const totalPossibleInteractions = totalProblemsAvailable * totalUsers;
    const unsolvedCount = Math.max(0, totalPossibleInteractions - (solvedCount + revisingCount));
```

## 5. Verification Method
- Execute the adversarial test from the Challenger's report to ensure that creating a solved problem outside the active tracks (`titleSlug: "three-sum"`) no longer inflates the `solvedCount` or zeroes the `unsolvedCount` inappropriately.
- `npm run build` within `/home/reetabratabhandari/Projects/dsa-preparation/backend` to ensure the TypeScript changes compile cleanly.
