import { Request, Response } from "express";
import Track from "../models/Track.ts";
import TrackedProblem from "../models/TrackedProblem.ts";
import { extractTitleSlug } from "../lib/slugUtils.ts";

export const listTracks = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = req.query.limit
      ? Math.min(100, Math.max(1, parseInt(req.query.limit as string)))
      : null;

    let query = Track.find();

    if (limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const [tracks, totalCount] = await Promise.all([
      query,
      limit ? Track.countDocuments() : Promise.resolve(0),
    ]);

    if (limit) {
      res.json({
        success: true,
        tracks,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      });
    } else {
      res.json({ success: true, tracks });
    }
  } catch (error) {
    console.error("Error listing tracks:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getTrackMetrics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const tracks = await Track.find()
      .select("_id problems.url parts.problems.url")
      .lean();

    const trackedProblems = await TrackedProblem.find({
      userId,
      notrack: { $ne: true },
    })
      .select("titleSlug")
      .lean();

    const trackedSlugs = new Set(
      trackedProblems
        .map((p) => p.titleSlug)
        .filter(Boolean),
    );

    let totalProblems = 0;
    let totalSolved = 0;
    let masteredTracks = 0;
    const completedTrackIds: string[] = [];

    tracks.forEach((track: any) => {
      const allProblems = [
        ...(track.problems || []),
        ...(track.parts?.flatMap((p: any) => p.problems) || []),
      ];

      let trackCompletedCount = 0;
      allProblems.forEach((problem: any) => {
        totalProblems++;
        const slug = extractTitleSlug(problem.url);
        if (slug && trackedSlugs.has(slug)) {
          totalSolved++;
          trackCompletedCount++;
        }
      });

      if (
        allProblems.length > 0 &&
        trackCompletedCount === allProblems.length
      ) {
        masteredTracks++;
        completedTrackIds.push(track._id.toString());
      }
    });

    res.json({
      success: true,
      metrics: {
        totalProblems,
        totalSolved,
        totalTracks: tracks.length,
        masteredTracks,
        completedTrackIds,
      },
    });
  } catch (error) {
    console.error("Error getting track metrics:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
