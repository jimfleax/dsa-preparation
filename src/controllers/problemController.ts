import { Request, Response } from 'express';
import ProblemProgress from '../models/ProblemProgress.ts';

/**
 * Extracts the titleSlug from a LeetCode problem URL.
 * Handles URLs like:
 *   - https://leetcode.com/problems/two-sum/
 *   - https://leetcode.com/problems/two-sum
 *   - leetcode.com/problems/two-sum/description/
 */
function extractTitleSlug(url: string): string | null {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * GET /api/problems
 * Lists all tracked problems with optional search and status filtering.
 * Query params: ?search=<text>&status=solved|unsolved&sort=title|attempts|date
 */
export const listProblems = async (req: Request, res: Response) => {
  try {
    const { search, status, sort } = req.query;

    // Build dynamic filter
    const filter: Record<string, any> = {};

    if (status === 'solved') filter.isSolved = true;
    else if (status === 'unsolved') filter.isSolved = false;

    if (search && typeof search === 'string' && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Build sort criteria
    let sortCriteria: Record<string, 1 | -1> = { updatedAt: -1 };
    if (sort === 'title') sortCriteria = { title: 1 };
    else if (sort === 'attempts') sortCriteria = { attemptCount: -1 };
    else if (sort === 'date') sortCriteria = { lastSolvedDate: -1 };

    const problems = await ProblemProgress.find(filter).sort(sortCriteria).lean();

    res.json({ success: true, problems, count: problems.length });
  } catch (error: any) {
    console.error('Error listing problems:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/problems
 * Adds a new problem to the tracker.
 * Body: { url: string }
 * Auto-fetches the title from alfa-leetcode-api using the parsed titleSlug.
 */
export const addProblem = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid LeetCode URL is required.' });
    }

    const titleSlug = extractTitleSlug(url.trim());
    if (!titleSlug) {
      return res.status(400).json({ success: false, error: 'Could not parse a valid problem slug from the URL.' });
    }

    // Check if problem already exists
    const existing = await ProblemProgress.findOne({ titleSlug });
    if (existing) {
      return res.status(409).json({ success: false, error: 'This problem is already being tracked.', problem: existing });
    }

    // Auto-fetch the title from alfa-leetcode-api
    const apiBase = process.env.ALFA_LEETCODE_API_BASE || 'https://alfa-leetcode-api.onrender.com';
    let title = titleSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); // Fallback: capitalize slug

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for cold starts

      const apiResponse = await fetch(`${apiBase}/select?titleSlug=${titleSlug}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData.questionTitle) {
          title = apiData.questionTitle;
        }
      }
    } catch (fetchErr) {
      // Non-fatal: use the fallback title derived from slug
      console.warn(`alfa-leetcode-api title fetch failed for "${titleSlug}", using fallback title.`, fetchErr);
    }

    const problem = await ProblemProgress.create({
      titleSlug,
      title,
      url: url.trim(),
    });

    res.status(201).json({ success: true, problem });
  } catch (error: any) {
    console.error('Error adding problem:', error);
    // Handle Mongoose duplicate key error gracefully
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'This problem is already being tracked.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
