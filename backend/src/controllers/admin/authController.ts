import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/Admin";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!admin.password) {
      return res.status(401).json({ error: "Invalid credentials. Please use Google Login." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    res.json({ token, admin: { email: admin.email, id: admin._id } });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const adminGoogleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: "Token is required" });
      return;
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError: any) {
      console.warn("Admin Google Token verification failed:", verifyError.message);
      res.status(401).json({ success: false, message: "Invalid or expired Google token" });
      return;
    }
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: "Invalid Google token payload" });
      return;
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || email.split('@')[0];

    // Find existing admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      // Security: Do NOT create a new admin if not found. Only existing admins can log in.
      res.status(403).json({ success: false, message: "Unauthorized. Admin account not found for this email." });
      return;
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

    const jwtToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
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
  } catch (error) {
    console.error("Admin Google Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during Google login" });
  }
};

