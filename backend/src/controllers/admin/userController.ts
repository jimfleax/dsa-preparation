import { Request, Response } from "express";
import User from "../../models/User";
import TrackedProblem from "../../models/TrackedProblem";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleteProgress = req.query.deleteProgress === 'true';

    if (!id) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    if (deleteProgress) {
      await TrackedProblem.deleteMany({ userId: id });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const progress = await TrackedProblem.find({ userId: id }).sort({ lastAttemptedDate: -1 });
    res.json(progress);
  } catch (error) {
    console.error("Get user progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLeetCodeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || !user.leetcodeUsername) {
      res.status(404).json({ error: "User or LeetCode username not found" });
      return;
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
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch from LeetCode API" });
      return;
    }

    const data = await response.json();
    res.json(data?.data?.matchedUser || {});
  } catch (error) {
    console.error("Get LeetCode data error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
