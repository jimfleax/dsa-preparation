import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/Admin";
import { getRequiredEnv } from "../../lib/envUtils.ts";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../lib/AppError.ts";
import { catchAsync } from "../../lib/catchAsync.ts";

const client = new OAuth2Client(getRequiredEnv("GOOGLE_CLIENT_ID"));

export const adminGoogleLogin = catchAsync(async (
  req: Request,
  res: Response,
) => {
  const { token } = req.body;

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: getRequiredEnv("GOOGLE_CLIENT_ID"),
      });
  } catch (verifyError: any) {
    console.warn("Admin Google Token verification failed:", verifyError.message);
    throw AppError.unauthorized("Invalid or expired Google token");
  }
    const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw AppError.badRequest("Invalid Google token payload");
  }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || email.split("@")[0];

    // Find existing admin
    const admin = await Admin.findOne({ email });

  if (!admin) {
    // Security: Do NOT create a new admin if not found. Only existing admins can log in.
    throw AppError.forbidden("Unauthorized. Admin account not found for this email.");
  }

    let changed = false;
    if (!admin.googleId) {
      admin.googleId = googleId;
      changed = true;
    }
    if (!admin.name) {
      admin.name = name;
      changed = true;
    }

    if (admin.tokenVersion === undefined) {
      admin.tokenVersion = 0;
      changed = true;
    }

    if (changed) {
      await admin.save();
    }

    const secret = getRequiredEnv("JWT_SECRET");

    const jwtToken = jwt.sign(
      { id: admin._id },
      secret,
      { expiresIn: "1d" },
    );

  res.json({
    success: true,
    token: jwtToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  });
});
