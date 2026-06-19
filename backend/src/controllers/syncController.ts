import { Request, Response } from "express";
import User from "../models/User.ts";
import TrackedProblem from "../models/TrackedProblem.ts";
import {
  fetchRecentAcceptedSubmissions,
  getLeetCodeProblemInfo,
} from "../lib/leetcodeScraperUtil.ts";

/**
 * GET /api/sync/check
 * Checks for new accepted submissions on LeetCode without saving to DB.
 */
export const checkSync = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || !user.leetcodeUsername) {
      return res.status(200).json({
        success: false,
        error: "LeetCode username not configured",
        noUsername: true,
      });
    }

    let recentSubmissions;
    try {
      recentSubmissions = await fetchRecentAcceptedSubmissions(
        user.leetcodeUsername,
      );
    } catch (err) {
      // Gracefully handle rate limits or API errors
      return res
        .status(200)
        .json({ success: false, error: "Failed to fetch from LeetCode API" });
    }

    // Deduplicate fetched submissions by titleSlug (in case of multiple recent attempts)
    const uniqueSlugs = new Map();
    recentSubmissions.forEach((sub) => {
      if (!uniqueSlugs.has(sub.titleSlug)) {
        uniqueSlugs.set(sub.titleSlug, sub);
      }
    });
    const dedupedSubmissions = Array.from(uniqueSlugs.values());

    // Fetch existing slugs and dates for this user
    const slugs = dedupedSubmissions.map((s) => s.titleSlug);
    const existingRecords = await TrackedProblem.find({
      userId,
      titleSlug: { $in: slugs },
    })
      .select("titleSlug lastAttemptedDate _id")
      .lean();

    const existingMap = new Map();
    existingRecords.forEach((r) => existingMap.set(r.titleSlug, r));

    const newSubmissions: any[] = [];
    const revisitedSubmissions: any[] = [];

    dedupedSubmissions.forEach((sub) => {
      const existing = existingMap.get(sub.titleSlug);
      if (!existing) {
        newSubmissions.push(sub);
      } else {
        const subDate = new Date(Number(sub.timestamp) * 1000);
        if (!isNaN(subDate.getTime()) && existing.lastAttemptedDate) {
          const existingDate = new Date(existing.lastAttemptedDate);

          // Compare dates (year, month, day) in UTC to avoid local timezone shifts causing weirdness
          const subDay = new Date(
            Date.UTC(
              subDate.getUTCFullYear(),
              subDate.getUTCMonth(),
              subDate.getUTCDate(),
            ),
          );
          const existingDay = new Date(
            Date.UTC(
              existingDate.getUTCFullYear(),
              existingDate.getUTCMonth(),
              existingDate.getUTCDate(),
            ),
          );

          // If the submission is on a strictly newer day than the recorded lastAttemptedDate
          if (subDay.getTime() > existingDay.getTime()) {
            revisitedSubmissions.push({
              submission: sub,
              problemId: existing._id,
            });
          }
        }
      }
    });

    res.json({
      success: true,
      newCount: newSubmissions.length,
      newSubmissions,
      revisitedCount: revisitedSubmissions.length,
      revisitedSubmissions,
    });
  } catch (error: unknown) {
    console.error("Error checking sync:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
  }
};

/**
 * POST /api/sync/track
 * Saves the provided submissions to the DB with the given notrack flag.
 */
export const trackSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { submissions, notrack } = req.body;
    if (!Array.isArray(submissions)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid submissions payload" });
    }

    if (submissions.length === 0) {
      return res.json({
        success: true,
        message: "No submissions to process.",
        added: 0,
      });
    }

    // 1. Fetch all existing records in a single query
    const titleSlugs = submissions.map((sub: any) => sub.titleSlug);
    const existingRecords = await TrackedProblem.find({
      userId,
      titleSlug: { $in: titleSlugs },
    })
      .select("titleSlug")
      .lean();

    const existingSet = new Set(existingRecords.map((r) => r.titleSlug));

    // Filter out already tracked problems
    const newSubmissions = submissions.filter(
      (sub: any) => !existingSet.has(sub.titleSlug),
    );

    if (newSubmissions.length === 0) {
      return res.json({
        success: true,
        message: "Processed 0 submissions.",
        added: 0,
      });
    }

    // 2. Fetch LeetCode details in parallel
    const enrichedSubmissions = await Promise.all(
      newSubmissions.map(async (sub: any) => {
        const url = `https://leetcode.com/problems/${sub.titleSlug}/`;
        let difficulty = undefined;
        try {
          const info = await getLeetCodeProblemInfo(url);
          if (info && info.difficulty) {
            difficulty = info.difficulty;
          }
        } catch (err) {
          console.warn(
            `Failed to fetch difficulty for ${sub.titleSlug}, proceeding without it.`,
          );
        }

        let lastAttemptedDate = new Date(Number(sub.timestamp) * 1000);
        if (isNaN(lastAttemptedDate.getTime())) {
          lastAttemptedDate = new Date();
        }

        return {
          userId,
          titleSlug: sub.titleSlug,
          title: sub.title,
          url,
          difficulty,
          attemptCount: 1,
          notrack: !!notrack,
          lastAttemptedDate,
        };
      }),
    );

    // 3. Batch insert new tracked problems
    const results = await TrackedProblem.insertMany(enrichedSubmissions);

    res.json({
      success: true,
      message: `Processed ${results.length} submissions.`,
      added: results.length,
    });
  } catch (error: unknown) {
    console.error("Error tracking submissions:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
  }
};
