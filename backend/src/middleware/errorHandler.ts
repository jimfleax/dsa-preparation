import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/AppError.ts";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("[Global Error Handler] Caught Exception:", err);

  // Default fallback status and message
  let statusCode = err.statusCode || 500;
  let success = false;
  let error = err.message || "An unexpected internal server error occurred.";
  let errors: any[] | undefined = undefined;

  // 1. Validation Errors (Zod)
  if (err instanceof ZodError) {
    statusCode = 400;
    const firstIssue = err.issues[0];
    error = firstIssue ? `Invalid input: ${firstIssue.message}` : "Validation failed.";
    errors = err.issues;
  }
  // 2A. Database Errors: Duplicate Key (MongoDB Code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    error = "A resource with this information already exists.";
  }
  // 2B. Database Errors: Cast Error (Invalid MongoDB ObjectId)
  else if (err.name === "CastError") {
    statusCode = 400;
    error = "Invalid ID format provided.";
  }
  // 2C. Database Errors: Mongoose Validation Error
  else if (err.name === "ValidationError") {
    statusCode = 400;
    error = `Database validation failed: ${err.message}`;
  }
  // 3. Authentication & Authorization Errors
  else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    error = "Session expired or invalid token. Please log in again.";
  }
  // 4. Custom AppErrors (includes Not Found, Forbidden, External Service, etc.)
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    error = err.message;
  }
  // 5. Fallback Internal Server Error
  else {
    // If it's a 500 and not operational, hide the internal message in production
    if (process.env.NODE_ENV === "production" && statusCode === 500) {
      error = "An unexpected internal server error occurred.";
    }
  }

  const responsePayload: any = {
    success,
    error,
  };

  // Attach detailed validation errors array if present
  if (errors) {
    responsePayload.errors = errors;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};
