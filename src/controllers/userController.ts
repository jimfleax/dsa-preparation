import { Request, Response } from 'express';
import User from '../models/User.ts';

/**
 * GET /api/user/settings
 * Retrieves the current user's settings. Creates a skeleton User document
 * on first access (auto-provisioning on login).
 */
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Find or create the user document (auto-provision on first login)
    let user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      user = await User.create({ clerkUserId: userId });
    }

    res.json({
      success: true,
      settings: {
        clerkUserId: user.clerkUserId,
        leetcodeUsername: user.leetcodeUsername || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/user/settings
 * Updates the current user's settings (e.g. leetcodeUsername).
 * Body: { leetcodeUsername: string }
 */
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { leetcodeUsername } = req.body;

    if (leetcodeUsername !== undefined && typeof leetcodeUsername !== 'string') {
      return res.status(400).json({ success: false, error: 'leetcodeUsername must be a string.' });
    }

    // Upsert: create if not exists, update if exists
    const user = await User.findOneAndUpdate(
      { clerkUserId: userId },
      {
        clerkUserId: userId,
        ...(leetcodeUsername !== undefined && { leetcodeUsername: leetcodeUsername.trim() }),
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      settings: {
        clerkUserId: user.clerkUserId,
        leetcodeUsername: user.leetcodeUsername || null,
      },
    });
  } catch (error: any) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
