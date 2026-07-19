import { Request, Response } from "express";
import User from "../models/User.ts";
import { AppError } from "../lib/AppError.ts";
import { catchAsync } from "../lib/catchAsync.ts";

/**
 * GET /api/user/settings
 * Retrieves the current user's settings.
 */
export const getUserSettings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw AppError.unauthorized("Unauthorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound("User not found");
  }

  res.json({
    success: true,
    settings: {
      userId: user._id,
      leetcodeUsername: user.leetcodeUsername || null,
    },
  });
});

/**
 * POST /api/user/settings
 * Updates the current user's settings (e.g. leetcodeUsername).
 * Body: { leetcodeUsername: string }
 */
export const updateUserSettings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw AppError.unauthorized("Unauthorized");
  }

    const { leetcodeUsername } = req.body;

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
    throw AppError.notFound("User not found");
  }

  res.json({
    success: true,
    settings: {
      userId: user._id,
      leetcodeUsername: user.leetcodeUsername || null,
    },
  });
});
