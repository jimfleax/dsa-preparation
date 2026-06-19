import { Request, Response } from "express";
import User from "../../models/User";
import Track from "../../models/Track";
import TrackedProblem from "../../models/TrackedProblem";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsers, totalTracks, totalSolvedGlobally, uniqueProblemsAgg, mostActiveTracks] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Track.countDocuments(),
        TrackedProblem.countDocuments({ notrack: { $ne: true } }),
        Track.aggregate([
          {
            $project: {
              allProblems: {
                $concatArrays: [
                  { $ifNull: ["$problems.titleSlug", []] },
                  {
                    $reduce: {
                      input: { $ifNull: ["$parts.problems.titleSlug", []] },
                      initialValue: [],
                      in: { $concatArrays: ["$$value", "$$this"] },
                    },
                  },
                ],
              },
            },
          },
          { $unwind: "$allProblems" },
          { $group: { _id: "$allProblems" } },
        ]),
        Track.aggregate([
          {
            $project: {
              title: 1,
              allProblems: {
                $concatArrays: [
                  { $ifNull: ["$problems.titleSlug", []] },
                  {
                    $reduce: {
                      input: { $ifNull: ["$parts.problems.titleSlug", []] },
                      initialValue: [],
                      in: { $concatArrays: ["$$value", "$$this"] },
                    },
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "problemprogresses",
              localField: "allProblems",
              foreignField: "titleSlug",
              as: "submissions",
            },
          },
          {
            $project: {
              title: 1,
              activityScore: {
                $size: {
                  $filter: {
                    input: "$submissions",
                    as: "sub",
                    cond: { $ne: ["$$sub.notrack", true] },
                  },
                },
              },
            },
          },
          { $sort: { activityScore: -1 } },
          { $limit: 5 },
        ])
      ]);

    const uniqueProblemsArr = uniqueProblemsAgg.map((p) => p._id);
    const totalProblemsAvailable = uniqueProblemsArr.length;

    const progressCounts = await TrackedProblem.aggregate([
      {
        $match: {
          notrack: { $ne: true },
          titleSlug: { $in: uniqueProblemsArr },
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $gt: ["$attemptCount", 1] }, "revising", "solved"],
          },
          count: { $sum: 1 },
        },
      },
    ]);

    let solvedCount = 0;
    let revisingCount = 0;
    progressCounts.forEach((pc) => {
      if (pc._id === "solved") solvedCount = pc.count;
      if (pc._id === "revising") revisingCount = pc.count;
    });

    // Unsolved calculate
    const totalPossibleInteractions = totalProblemsAvailable * totalUsers;
    const unsolvedCount = Math.max(
      0,
      totalPossibleInteractions - (solvedCount + revisingCount),
    );

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
