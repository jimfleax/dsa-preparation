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
      return res
        .status(200)
        .json({
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

    // Fetch existing slugs for this user
    const existingRecords = await TrackedProblem.find({ userId }).select(
      "titleSlug",
    );
    const existingSlugs = new Set(existingRecords.map((r) => r.titleSlug));

    // Filter out submissions that are already tracked/notracked
    const newSubmissions = dedupedSubmissions.filter(
      (sub) => !existingSlugs.has(sub.titleSlug),
    );

    res.json({
      success: true,
      newCount: newSubmissions.length,
      newSubmissions,
    });
  } catch (error: any) {
    console.error("Error checking sync:", error);
    res.status(500).json({ success: false, error: error.message });
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

    const results = [];

    for (const sub of submissions) {
      // Ensure we don't insert duplicates
      const existing = await TrackedProblem.findOne({
        userId,
        titleSlug: sub.titleSlug,
      });
      if (existing) continue;

      // Create a problem URL to fetch info
      const url = `https://leetcode.com/problems/${sub.titleSlug}/`;

      // Attempt to fetch difficulty
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

      // Create new record
      const progress = new TrackedProblem({
        userId,
        titleSlug: sub.titleSlug,
        title: sub.title,
        url,
        difficulty,
        attemptCount: 1,
        notrack: !!notrack,
        lastAttemptedDate: new Date(Number(sub.timestamp) * 1000), // Convert from epoch seconds if applicable
      });

      // Handle potentially invalid timestamps safely
      if (isNaN(progress.lastAttemptedDate.getTime())) {
        progress.lastAttemptedDate = new Date();
      }

      await progress.save();
      results.push(progress);
    }

    res.json({
      success: true,
      message: `Processed ${results.length} submissions.`,
      added: results.length,
    });
  } catch (error: any) {
    console.error("Error tracking submissions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
