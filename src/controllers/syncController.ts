import { Request, Response } from 'express';
import ProblemProgress from '../models/ProblemProgress.ts';

/**
 * POST /api/sync
 * Syncs the user's LeetCode accepted submissions with the local database.
 * Reads LEETCODE_USERNAME from process.env.
 * Fetches from alfa-leetcode-api and upserts problems, avoiding duplicate counting.
 */
export const syncSubmissions = async (req: Request, res: Response) => {
  try {
    const username = process.env.LEETCODE_USERNAME;
    if (!username) {
      return res.status(500).json({
        success: false,
        error: 'LEETCODE_USERNAME is not configured in environment variables.',
      });
    }

    const apiBase = process.env.ALFA_LEETCODE_API_BASE || 'https://alfa-leetcode-api.onrender.com';

    // Fetch accepted submissions with a generous timeout (cold-start tolerance)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let submissions: any[] = [];
    try {
      const response = await fetch(`${apiBase}/${username}/acSubmission?limit=50`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(502).json({
          success: false,
          error: `alfa-leetcode-api returned status ${response.status}.`,
        });
      }

      const data = await response.json();
      submissions = data.submission || [];
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.error('Sync fetch error:', fetchErr);
      return res.status(502).json({
        success: false,
        error: fetchErr.name === 'AbortError'
          ? 'alfa-leetcode-api request timed out (15s). It may be cold-starting — try again shortly.'
          : `Failed to reach alfa-leetcode-api: ${fetchErr.message}`,
      });
    }

    let synced = 0;
    let skipped = 0;

    for (const sub of submissions) {
      const { id: submissionId, title, titleSlug, timestamp } = sub;

      if (!titleSlug || !submissionId) {
        skipped++;
        continue;
      }

      // Convert UNIX epoch string to Date
      const solvedDate = new Date(parseInt(timestamp, 10) * 1000);
      const url = `https://leetcode.com/problems/${titleSlug}/`;

      // Upsert: create if not exists, update if exists and submission is new
      const existing = await ProblemProgress.findOne({ titleSlug });

      if (existing) {
        // Skip if this exact submission was already synced
        if (existing.syncedSubmissionIds.includes(submissionId)) {
          skipped++;
          continue;
        }

        // Update the existing record
        existing.isSolved = true;
        existing.attemptCount += 1;
        existing.syncedSubmissionIds.push(submissionId);

        // Update lastSolvedDate only if this submission is newer
        if (!existing.lastSolvedDate || solvedDate > existing.lastSolvedDate) {
          existing.lastSolvedDate = solvedDate;
        }

        await existing.save();
      } else {
        // Create a new tracked problem from the submission
        await ProblemProgress.create({
          titleSlug,
          title: title || titleSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          url,
          isSolved: true,
          attemptCount: 1,
          lastSolvedDate: solvedDate,
          syncedSubmissionIds: [submissionId],
        });
      }

      synced++;
    }

    res.json({
      success: true,
      synced,
      skipped,
      total: submissions.length,
    });
  } catch (error: any) {
    console.error('Error syncing submissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
