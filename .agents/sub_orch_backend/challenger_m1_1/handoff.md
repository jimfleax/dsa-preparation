# Milestone 1: Admin Backend Validation Report

## 1. Observation
1. During my review of `backend/src/controllers/admin/analyticsController.ts`, I empirically tested the logic for calculating the "Problem completion rate (Solved vs Revising/Unsolved)".
2. The logic relies on:
   - `totalProblemsAvailable = uniqueProblems.size;` (from tracking all `titleSlug`s in the `Track` collection)
   - `totalPossibleInteractions = totalProblemsAvailable * totalUsers;`
   - `solvedCount` = `TrackedProblem.countDocuments({ attemptCount: 1 })`
   - `revisingCount` = `TrackedProblem.countDocuments({ attemptCount: { $gt: 1 } })`
   - `unsolvedCount = Math.max(0, totalPossibleInteractions - (solvedCount + revisingCount));`
3. I wrote a `mongodb-memory-server` script to inject an edge-case: A `TrackedProblem` entry where the user solved a problem that is **not** currently listed in any `Track` (e.g. a custom problem, or one removed from tracks).
4. In the test output, `totalPossibleInteractions` was `1`, but `solvedCount` was `2`. This resulted in `unsolvedCount = 0` (due to `Math.max(0)`), but the sum of `solved + revising + unsolved` became `2 + 0 + 0 = 2`, which is 200% of the total curriculum capacity (1).

## 2. Logic Chain
- The calculation for `totalPossibleInteractions` bounds the "curriculum size" based on active tracks.
- `solvedCount` and `revisingCount` fetch all records unconditionally, bypassing the track bounds.
- If users solve problems outside the tracked curriculum, these numbers balloon and destroy the validity of the completion rate pie chart (where parts must sum to the total whole).
- Therefore, the completion rate is empirically incorrect under realistic conditions where `TrackedProblem` records outlive active `Track` constraints.

## 3. Caveats
- `totalSolvedGlobally` (another metric) legitimately measures total engagement, so it is correct to count all tracked problems there. The bug only applies to the `completionRate` scope.
- Mongoose's typing issue `(Track as any).findByIdAndUpdate` in `trackController.ts` is a minor TS nuisance but doesn't affect runtime execution, so it is not a blocker.

## 4. Conclusion
I DO NOT approve the implementation. The analytics logic for `completionRate` is mathematically flawed and will cause UI components (like Recharts pie charts) to render improperly or misleadingly. `solvedCount` and `revisingCount` should be filtered such that `titleSlug: { $in: Array.from(uniqueProblems) }` to accurately reflect completion *of the track curriculum*.

## 5. Verification Method
Run the following adversarial test to reproduce:
```ts
// ... setup in-memory DB ...
await User.create({ name: "User1", email: "user1@example.com" });
await Track.create({ title: "Track1", problems: [{ titleSlug: "two-sum" }] });
await TrackedProblem.create({ userId: "1", titleSlug: "two-sum", attemptCount: 1 });
// Solve a problem OUTSIDE tracks
await TrackedProblem.create({ userId: "1", titleSlug: "three-sum", attemptCount: 1 });

// Expected: solved = 1 (of track). Actual: solved = 2 (of track).
```
