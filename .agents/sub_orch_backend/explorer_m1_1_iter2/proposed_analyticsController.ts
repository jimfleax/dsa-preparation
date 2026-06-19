import { Request, Response } from "express";
import User from "../../models/User";
import Track from "../../models/Track";
import TrackedProblem from "../../models/TrackedProblem";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsers, totalTracks, tracks, totalSolvedGlobally] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Track.countDocuments(),
        Track.find().lean(),
        TrackedProblem.countDocuments({ notrack: { $ne: true } }),
      ]);

    // Total problems available (unique titleSlugs in tracks)
    const uniqueProblems = new Set<string>();
    tracks.forEach((track) => {
      track.problems?.forEach((p: any) => uniqueProblems.add(p.titleSlug));
      track.parts?.forEach((part: any) => {
        part.problems?.forEach((p: any) => uniqueProblems.add(p.titleSlug));
      });
    });
    const totalProblemsAvailable = uniqueProblems.size;
    const uniqueProblemSlugs = Array.from(uniqueProblems);

    // Calculate solved and revising bounded by the current curriculum
    const [solvedCount, revisingCount] = await Promise.all([
      TrackedProblem.countDocuments({
        notrack: { $ne: true },
        attemptCount: 1,
        titleSlug: { $in: uniqueProblemSlugs },
      }),
      TrackedProblem.countDocuments({
        notrack: { $ne: true },
        attemptCount: { $gt: 1 },
        titleSlug: { $in: uniqueProblemSlugs },
      }),
    ]);

    // Unsolved calculate
    const totalPossibleInteractions = totalProblemsAvailable * totalUsers;
    const unsolvedCount = Math.max(
      0,
      totalPossibleInteractions - (solvedCount + revisingCount),
    );

    // Most active tracks
    // Aggregate TrackedProblem counts by titleSlug
    const problemCounts = await TrackedProblem.aggregate([
      { $match: { notrack: { $ne: true } } },
      { $group: { _id: "$titleSlug", count: { $sum: 1 } } },
    ]);

    const problemCountMap = new Map<string, number>();
    problemCounts.forEach((pc) => problemCountMap.set(pc._id, pc.count));

    const trackActivity = tracks.map((track) => {
      let score = 0;
      track.problems?.forEach((p: any) => {
        score += problemCountMap.get(p.titleSlug) || 0;
      });
      track.parts?.forEach((part: any) => {
        part.problems?.forEach((p: any) => {
          score += problemCountMap.get(p.titleSlug) || 0;
        });
      });
      return {
        _id: track._id,
        title: track.title,
        activityScore: score,
      };
    });

    trackActivity.sort((a, b) => b.activityScore - a.activityScore);
    const mostActiveTracks = trackActivity.slice(0, 5);

    res.json({
      users: {
        total: totalUsers,
        newLast30Days: newUsers,
      },
      content: {
        totalTracks,
        totalProblemsAvailable,
      },
      engagement: {
        totalProblemsSolvedGlobally: totalSolvedGlobally,
        mostActiveTracks,
      },
      completionRate: {
        solved: solvedCount,
        revising: revisingCount,
        unsolved: unsolvedCount,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
