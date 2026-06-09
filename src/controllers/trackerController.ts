import { Request, Response } from "express";
import ProblemProgress from "../models/ProblemProgress.ts";
import {
  getLeetCodeTitle,
  getLeetCodeProblemInfo,
} from "../lib/leetcodeScraperUtil.ts";

/**
 * Extracts the titleSlug from a LeetCode problem URL.
 */
function extractTitleSlug(url: string): string | null {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * POST /api/problems/scrape-title
 * Public endpoint to scrape a LeetCode problem title (no auth required).
 * Used by frontend for real-time title fetching as user enters URL.
 * Body: { url: string }
 */
export const scrapeLeetCodeTitle = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "A valid LeetCode URL is required." });
    }

    const titleSlug = extractTitleSlug(url.trim());
    if (!titleSlug) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid LeetCode URL format." });
    }

    // Fetch the exact info from LeetCode
    const info = await getLeetCodeProblemInfo(url.trim());
    if (!info) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found on LeetCode." });
    }

    res.json({
      success: true,
      title: info.title,
      difficulty: info.difficulty,
      titleSlug,
    });
  } catch (error: any) {
    console.error("[scrapeLeetCodeTitle] Error:", error.message);
    res.status(502).json({
      success: false,
      error: "Failed to fetch problem details from LeetCode. Please try again.",
    });
  }
};

/**
 * GET /api/problems
 * Lists all tracked problems for the authenticated user, with optional search filtering.
 * Query params: ?search=<text>&sort=title|attempts|date
 */
export const listProblems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { search, sort } = req.query;

    // Always scope to the authenticated user — prevents IDOR
    // Exclude problems marked as notrack
    const filter: Record<string, any> = { userId, notrack: { $ne: true } };

    if (search && typeof search === "string" && search.trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    // Build sort criteria
    let sortCriteria: Record<string, 1 | -1> = { lastAttemptedDate: -1 };
    if (sort === "title") sortCriteria = { title: 1 };
    else if (sort === "attempts") sortCriteria = { attemptCount: -1 };
    else if (sort === "date") sortCriteria = { lastAttemptedDate: -1 };

    const problems = await ProblemProgress.find(filter)
      .sort(sortCriteria)
      .lean();

    res.json({ success: true, problems, count: problems.length });
  } catch (error: any) {
    console.error("Error listing problems:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/problems
 * Adds a new solved problem to the tracker for the authenticated user.
 * Body: { url: string }
 * Fetches the exact title from LeetCode using GraphQL API.
 * Sets attemptCount=1 and lastAttemptedDate=now.
 */
export const addProblem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "A valid LeetCode URL is required." });
    }

    const titleSlug = extractTitleSlug(url.trim());
    if (!titleSlug) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Could not parse a valid problem slug from the URL.",
        });
    }

    // Check for existing record scoped to this user
    const existing = await ProblemProgress.findOne({ userId, titleSlug });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          error: "This problem is already being tracked.",
          problem: existing,
        });
    }

    // Fetch the exact title and difficulty from LeetCode
    let title: string;
    let difficulty: string | undefined;
    try {
      const fetchedInfo = await getLeetCodeProblemInfo(url.trim());
      if (!fetchedInfo) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Could not fetch problem details from LeetCode. Please verify the URL.",
          });
      }
      title = fetchedInfo.title;
      difficulty = fetchedInfo.difficulty;
    } catch (scraperError: any) {
      console.error(
        "[addProblem] Error fetching title from LeetCode:",
        scraperError.message,
      );
      return res.status(502).json({
        success: false,
        error:
          "Failed to fetch problem details from LeetCode. Please try again later.",
      });
    }

    const problem = await ProblemProgress.create({
      userId,
      titleSlug,
      title,
      url: url.trim(),
      difficulty: difficulty as "Easy" | "Medium" | "Hard" | undefined,
      attemptCount: 1,
      lastAttemptedDate: new Date(),
    });

    res.status(201).json({ success: true, problem });
  } catch (error: any) {
    console.error("Error adding problem:", error);
    if (error.code === 11000) {
      console.error(
        "[addProblem] E11000 keyPattern:",
        JSON.stringify(error.keyPattern),
        "keyValue:",
        JSON.stringify(error.keyValue),
      );
      return res.status(409).json({
        success: false,
        error: "This problem is already being tracked.",
        debug: { keyPattern: error.keyPattern, keyValue: error.keyValue },
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/problems/:id/revisit
 * Records a revisit: increments attemptCount and sets lastAttemptedDate to now.
 * Uses compound query {_id, userId} to prevent IDOR.
 */
export const revisitProblem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params;

    // Compound query prevents accessing another user's problem (IDOR prevention)
    const problem = await ProblemProgress.findOne({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    problem.attemptCount += 1;
    problem.lastAttemptedDate = new Date();
    await problem.save();

    res.json({ success: true, problem });
  } catch (error: any) {
    console.error("Error recording revisit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/problems/:id
 * Updates a problem (url, attempts). Re-fetches LeetCode title/difficulty if URL changes.
 */
export const updateProblem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params;
    const { url, attemptCount } = req.body;

    const problem = await ProblemProgress.findOne({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    if (attemptCount !== undefined) {
      const parsedCount = parseInt(attemptCount, 10);
      if (isNaN(parsedCount) || parsedCount < 1) {
        return res
          .status(400)
          .json({ success: false, error: "Attempt count must be at least 1." });
      }
      problem.attemptCount = parsedCount;
    }

    if (url && typeof url === "string" && url.trim() !== problem.url) {
      const newUrl = url.trim();
      const titleSlug = extractTitleSlug(newUrl);

      if (!titleSlug) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Could not parse a valid problem slug from the new URL.",
          });
      }

      // Check for conflicts
      const existing = await ProblemProgress.findOne({
        userId,
        titleSlug,
        _id: { $ne: id },
      });
      if (existing) {
        return res
          .status(409)
          .json({
            success: false,
            error: "You are already tracking this problem in another entry.",
          });
      }

      // Fetch new title and difficulty
      try {
        const fetchedInfo = await getLeetCodeProblemInfo(newUrl);
        if (!fetchedInfo) {
          return res
            .status(400)
            .json({
              success: false,
              error:
                "Could not fetch problem details from LeetCode. Please verify the new URL.",
            });
        }
        problem.url = newUrl;
        problem.titleSlug = titleSlug;
        problem.title = fetchedInfo.title;
        if (fetchedInfo.difficulty)
          problem.difficulty = fetchedInfo.difficulty as any;
      } catch (scraperError: any) {
        console.error(
          "[updateProblem] Error fetching title from LeetCode:",
          scraperError.message,
        );
        return res.status(502).json({
          success: false,
          error:
            "Failed to fetch problem details from LeetCode. Please try again later.",
        });
      }
    }

    await problem.save();
    res.json({ success: true, problem });
  } catch (error: any) {
    console.error("Error updating problem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/problems/:id
 * Removes a problem from the tracker. Scoped to authenticated user only.
 */
export const deleteProblem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params;

    // Compound query prevents deleting another user's problem (IDOR prevention)
    const problem = await ProblemProgress.findOneAndDelete({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    res.json({ success: true, message: "Problem removed from tracker." });
  } catch (error: any) {
    console.error("Error deleting problem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/problems/untracked
 * Lists all problems for the authenticated user that have notrack: true.
 */
export const listUntrackedProblems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const problems = await ProblemProgress.find({ userId, notrack: true })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, problems, count: problems.length });
  } catch (error: any) {
    console.error("Error listing untracked problems:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/problems/:id/toggle-track
 * Toggles the notrack flag for a given problem.
 */
export const toggleTrackProblem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params;

    const problem = await ProblemProgress.findOne({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    problem.notrack = !problem.notrack;
    await problem.save();

    res.json({ success: true, problem });
  } catch (error: any) {
    console.error("Error toggling track status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
