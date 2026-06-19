import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin";

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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    ) as { id: string };
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: "Invalid admin token." });
    }

    req.admin = { id: admin.id };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};
