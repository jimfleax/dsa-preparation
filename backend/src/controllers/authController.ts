import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.ts";
import { getRequiredEnv } from "../lib/envUtils.ts";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(getRequiredEnv("GOOGLE_CLIENT_ID"));

const generateToken = (userId: string, tokenVersion: number): string => {
  const secret = getRequiredEnv("JWT_SECRET");
  return jwt.sign({ userId, tokenVersion }, secret, {
    expiresIn: "30d",
  });
};

export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: getRequiredEnv("GOOGLE_CLIENT_ID"),
      });
    } catch (verifyError: any) {
      console.warn("Token verification failed:", verifyError.message);
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired Google token" });
      return;
    }
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Google token payload" });
      return;
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || email.split("@")[0];

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      let changed = false;
      // Update googleId if they had an account but no googleId yet
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      // Migrate name field for existing users created under the old 'username' schema
      if (!user.name) {
        user.name = name;
        changed = true;
      }

      // Migrate tokenVersion if missing for older users
      if (user.tokenVersion === undefined) {
        user.tokenVersion = 0;
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
      });
    }

    const jwtToken = generateToken(user._id.toString(), user.tokenVersion || 0);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername,
      },
      token: jwtToken,
    });
  } catch (error: unknown) {
    console.error("Google Login Error:", error);
    if (
      error instanceof Error &&
      error.message.includes("E11000 duplicate key error")
    ) {
      res
        .status(400)
        .json({
          success: false,
          message:
            "Duplicate key error. There might be an issue with your data.",
        });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Server error during Google login" });
    }
  }
};
