import { Request, Response } from "express";
import User from "../models/User.ts";

/**
 * GET /api/user/settings
 * Retrieves the current user's settings.
 */
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      settings: {
        userId: user._id,
        leetcodeUsername: user.leetcodeUsername || null,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching user settings:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
  }
};

/**
 * POST /api/user/settings
 * Updates the current user's settings (e.g. leetcodeUsername).
 * Body: { leetcodeUsername: string }
 */
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { leetcodeUsername } = req.body;

    if (
      leetcodeUsername !== undefined &&
      typeof leetcodeUsername !== "string"
    ) {
      return res
        .status(400)
        .json({ success: false, error: "leetcodeUsername must be a string." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(leetcodeUsername !== undefined && {
          leetcodeUsername: leetcodeUsername.trim(),
        }),
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      settings: {
        userId: user._id,
        leetcodeUsername: user.leetcodeUsername || null,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating user settings:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
  }
};
