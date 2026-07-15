import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin";
import { getRequiredEnv } from "../lib/envUtils.ts";

export const requireAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const secret = getRequiredEnv("JWT_SECRET");
    const decoded = jwt.verify(token, secret) as { id: string };
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: "Invalid admin token." });
    }

    req.admin = { id: admin.id };
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error instanceof Error ? error.message : "Unknown error");
    res.status(401).json({ error: "Invalid token." });
  }
};
