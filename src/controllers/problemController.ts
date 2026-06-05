import { Request, Response } from 'express';
import ProblemProgress from '../models/ProblemProgress.ts';

/**
 * Extracts the titleSlug from a LeetCode problem URL.
 */
function extractTitleSlug(url: string): string | null {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * GET /api/problems
 * Lists all tracked problems for the authenticated user, with optional search filtering.
 * Query params: ?search=<text>&sort=title|attempts|date
 */
export const listProblems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { search, sort } = req.query;

    // Always scope to the authenticated user — prevents IDOR
    const filter: Record<string, any> = { userId };

    if (search && typeof search === 'string' && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Build sort criteria
    let sortCriteria: Record<string, 1 | -1> = { lastAttemptedDate: -1 };
    if (sort === 'title') sortCriteria = { title: 1 };
    else if (sort === 'attempts') sortCriteria = { attemptCount: -1 };
    else if (sort === 'date') sortCriteria = { lastAttemptedDate: -1 };

    const problems = await ProblemProgress.find(filter).sort(sortCriteria).lean();

    res.json({ success: true, problems, count: problems.length });
  } catch (error: any) {
    console.error('Error listing problems:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/problems
 * Adds a new solved problem to the tracker for the authenticated user.
 * Body: { url: string }
 * Sets attemptCount=1 and lastAttemptedDate=now.
 */
export const addProblem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid LeetCode URL is required.' });
    }

    const titleSlug = extractTitleSlug(url.trim());
    if (!titleSlug) {
      return res.status(400).json({ success: false, error: 'Could not parse a valid problem slug from the URL.' });
    }

    // Check for existing record scoped to this user
    const existing = await ProblemProgress.findOne({ userId, titleSlug });
    if (existing) {
      return res.status(409).json({ success: false, error: 'This problem is already being tracked.', problem: existing });
    }

    // Generate title from slug (e.g. "two-sum" → "Two Sum")
    const title = titleSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const problem = await ProblemProgress.create({
      userId,
      titleSlug,
      title,
      url: url.trim(),
      attemptCount: 1,
      lastAttemptedDate: new Date(),
    });

    res.status(201).json({ success: true, problem });
  } catch (error: any) {
    console.error('Error adding problem:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'This problem is already being tracked.' });
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
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Compound query prevents accessing another user's problem (IDOR prevention)
    const problem = await ProblemProgress.findOne({ _id: id, userId });
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }

    problem.attemptCount += 1;
    problem.lastAttemptedDate = new Date();
    await problem.save();

    res.json({ success: true, problem });
  } catch (error: any) {
    console.error('Error recording revisit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/problems/:id
 * Removes a problem from the tracker. Scoped to authenticated user only.
 */
export const deleteProblem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Compound query prevents deleting another user's problem (IDOR prevention)
    const problem = await ProblemProgress.findOneAndDelete({ _id: id, userId });
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }

    res.json({ success: true, message: 'Problem removed from tracker.' });
  } catch (error: any) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
