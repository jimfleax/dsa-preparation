import { Request, Response } from "express";
import User from "../../models/User.js";
import TrackedProblem from "../../models/TrackedProblem.js";
import { AppError } from "../../lib/AppError.ts";
import { catchAsync } from "../../lib/catchAsync.ts";

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleteProgress = req.query.deleteProgress === "true";

  if (!id) {
    throw AppError.badRequest("User ID is required");
  }

  if (deleteProgress) {
    await TrackedProblem.deleteMany({ userId: id });
  }

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    throw AppError.notFound("User not found");
  }

  res.json({ message: "User deleted successfully" });
});

export const getUserProgress = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const progress = await TrackedProblem.find({ userId: id }).sort({
    lastAttemptedDate: -1,
  });
  res.json(progress);
});

export const getLeetCodeData = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user || !user.leetcodeUsername) {
    throw AppError.notFound("User or LeetCode username not found");
  }

  const username = user.leetcodeUsername;
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
          starRating
          userAvatar
        }
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!response.ok) {
    throw AppError.badRequest("Failed to fetch from LeetCode API");
  }

  const data = await response.json();
  res.json(data?.data?.matchedUser || {});
});
