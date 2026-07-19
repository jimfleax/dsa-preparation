import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.ts";
import { getRequiredEnv } from "../lib/envUtils.ts";
import { AppError } from "../lib/AppError.ts";

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
        getRequiredEnv("JWT_SECRET")
      ) as DecodedToken;

      const user = await User.findById(decoded.userId).select("tokenVersion");
      if (!user) {
        return next(AppError.unauthorized("Not authorized, user not found"));
      }

      const dbTokenVersion = user.tokenVersion || 0;
      const tokenVersion = decoded.tokenVersion || 0;
      if (dbTokenVersion !== tokenVersion) {
        return next(AppError.unauthorized("Not authorized, session revoked"));
      }

      req.user = { id: decoded.userId };

      return next();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn(`Token verification failed: ${errorMessage}`);
      return next(AppError.unauthorized("Not authorized, token failed"));
    }
  }

  if (!token) {
    return next(AppError.unauthorized("Not authorized, no token"));
  }
};
