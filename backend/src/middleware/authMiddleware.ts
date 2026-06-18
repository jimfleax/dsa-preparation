import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.ts";

interface DecodedToken {
  userId: string;
  tokenVersion?: number;
  iat: number;
  exp: number;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as DecodedToken;

      const user = await User.findById(decoded.userId).select("tokenVersion");
      if (!user) {
        res.status(401).json({ error: "Not authorized, user not found" });
        return;
      }

      const tokenVersion = decoded.tokenVersion || 0;
      if (user.tokenVersion !== tokenVersion) {
        res.status(401).json({ error: "Not authorized, session revoked" });
        return;
      }

      req.user = { id: decoded.userId };

      return next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn(`Token verification failed: ${errorMessage}`);
      res.status(401).json({ error: "Not authorized, token failed" });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ error: "Not authorized, no token" });
  }
};
