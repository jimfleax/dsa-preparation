import { Request, Response } from 'express';
import User from '../models/User.ts';

/**
 * POST /api/sync
 * Placeholder for LeetCode sync functionality.
 * Fetches the user's leetcodeUsername from the User model, then would
 * call the alfa-leetcode-api to sync submission data.
 *
 * Currently returns a stub response until the LeetCode API integration is built.
 */
export const syncLeetCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Fetch the user's LeetCode username from our DB
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || !user.leetcodeUsername) {
      return res.status(400).json({
        success: false,
        error: 'Please link your LeetCode username in Settings before syncing.',
      });
    }

    // TODO: Integrate with alfa-leetcode-api using user.leetcodeUsername
    // For now, return a placeholder response
    res.json({
      success: true,
      message: `Sync placeholder for LeetCode user: ${user.leetcodeUsername}. Full sync integration coming soon.`,
      leetcodeUsername: user.leetcodeUsername,
    });
  } catch (error: any) {
    console.error('Error syncing LeetCode data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
