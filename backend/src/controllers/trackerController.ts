import { Request, Response } from "express";
import TrackedProblem from "../models/TrackedProblem.ts";
import {
  getLeetCodeTitle,
  getLeetCodeProblemInfo,
} from "../lib/leetcodeScraperUtil.ts";
import { extractTitleSlug } from "../lib/slugUtils.ts";
import mongoose from "mongoose";
import { z } from "zod";

const addProblemSchema = z.object({
  url: z.string().url("A valid LeetCode URL is required."),
  reviewDurationDays: z.number().int().min(1).optional().nullable(),
});

const updateProblemSchema = z.object({
  url: z.string().url("A valid URL is required.").optional(),
  attemptCount: z.coerce.number().int().min(1, "Attempt count must be at least 1.").optional(),
  reviewDurationDays: z.number().int().min(1).optional().nullable(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional().nullable(),
});

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[scrapeLeetCodeTitle] Error:", message);
    res.status(502).json({
      success: false,
      error: "Failed to fetch problem details from LeetCode. Please try again.",
    });
  }
};

/**
 * GET /api/problems
 * Lists all tracked problems for the authenticated user, with optional search filtering and pagination.
 * Query params: ?search=<text>&sort=title|attempts|date&page=<number>&limit=<number>
 */
export const listProblems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { search, sort } = req.query;
    
    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

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

    // Execute queries in parallel for performance
    const [problems, totalCount] = await Promise.all([
      TrackedProblem.find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      TrackedProblem.countDocuments(filter)
    ]);

    res.json({ 
      success: true, 
      problems, 
      count: problems.length,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: unknown) {
    console.error("Error listing problems:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
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

    const parseResult = addProblemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: parseResult.error.issues[0].message });
    }
    const { url, reviewDurationDays } = parseResult.data;

    const titleSlug = extractTitleSlug(url.trim());
    if (!titleSlug) {
      return res.status(400).json({
        success: false,
        error: "Could not parse a valid problem slug from the URL.",
      });
    }

    // Check for existing record scoped to this user
    const existing = await TrackedProblem.findOne({ userId, titleSlug });
    if (existing) {
      return res.status(409).json({
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
        return res.status(400).json({
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

    const problem = await TrackedProblem.create({
      userId,
      titleSlug,
      title,
      url: url.trim(),
      difficulty: difficulty as "Easy" | "Medium" | "Hard" | undefined,
      attemptCount: 1,
      lastAttemptedDate: new Date(),
      ...(reviewDurationDays ? { reviewDurationDays } : {}),
    });

    res.status(201).json({ success: true, problem });
  } catch (error: unknown) {
    console.error("Error adding problem:", error);
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      const mongoError = error as any;
      console.error(
        "[addProblem] E11000 keyPattern:",
        JSON.stringify(mongoError.keyPattern),
        "keyValue:",
        JSON.stringify(mongoError.keyValue),
      );
      return res.status(409).json({
        success: false,
        error: "This problem is already being tracked.",
        debug: { keyPattern: mongoError.keyPattern, keyValue: mongoError.keyValue },
      });
    }
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format." });
    }

    // Compound query prevents accessing another user's problem (IDOR prevention)
    const problem = await TrackedProblem.findOne({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    const { timestamp, reviewDurationDays } = req.body || {};

    problem.attemptCount += 1;
    if (timestamp) {
      problem.lastAttemptedDate = new Date(Number(timestamp) * 1000);
    } else {
      problem.lastAttemptedDate = new Date();
    }
    
    if (reviewDurationDays !== undefined) {
      if (reviewDurationDays === null) {
        problem.reviewDurationDays = undefined; // Unset
      } else {
        problem.reviewDurationDays = reviewDurationDays;
      }
    }
    
    await problem.save();

    res.json({ success: true, problem });
  } catch (error: unknown) {
    console.error("Error recording revisit:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format." });
    }

    const parseResult = updateProblemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: parseResult.error.issues[0].message });
    }
    const { url, attemptCount, reviewDurationDays, notes } = parseResult.data;

    const problem = await TrackedProblem.findOne({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    if (attemptCount !== undefined) {
      problem.attemptCount = attemptCount;
    }

    if (reviewDurationDays !== undefined) {
      if (reviewDurationDays === null) {
        problem.reviewDurationDays = undefined;
      } else {
        problem.reviewDurationDays = reviewDurationDays;
      }
    }

    if (notes !== undefined) {
      if (notes === null) {
        problem.notes = undefined;
      } else {
        problem.notes = notes;
      }
    }

    if (url && typeof url === "string" && url.trim() !== problem.url) {
      const newUrl = url.trim();
      const titleSlug = extractTitleSlug(newUrl);

      if (!titleSlug) {
        return res.status(400).json({
          success: false,
          error: "Could not parse a valid problem slug from the new URL.",
        });
      }

      // Check for conflicts
      const existing = await TrackedProblem.findOne({
        userId,
        titleSlug,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "You are already tracking this problem in another entry.",
        });
      }

      // Fetch new title and difficulty
      try {
        const fetchedInfo = await getLeetCodeProblemInfo(newUrl);
        if (!fetchedInfo) {
          return res.status(400).json({
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
  } catch (error: unknown) {
    console.error("Error updating problem:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format." });
    }

    // Compound query prevents deleting another user's problem (IDOR prevention)
    const problem = await TrackedProblem.findOneAndDelete({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    res.json({ success: true, message: "Problem removed from tracker." });
  } catch (error: unknown) {
    console.error("Error deleting problem:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
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

    const problems = await TrackedProblem.find({ userId, notrack: true })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, problems, count: problems.length });
  } catch (error: unknown) {
    console.error("Error listing untracked problems:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format." });
    }

    const problem = await TrackedProblem.findOne({ _id: id, userId });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    problem.notrack = !problem.notrack;
    await problem.save();

    res.json({ success: true, problem });
  } catch (error: unknown) {
    console.error("Error toggling track status:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
  }
};


