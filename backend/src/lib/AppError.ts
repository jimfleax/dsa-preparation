export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates it is a handled business error, not a programming bug
    Error.captureStackTrace(this, this.constructor);
  }
}
