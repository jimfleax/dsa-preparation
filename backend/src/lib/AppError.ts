export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates it is a handled business error, not a programming bug
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string = "Bad Request") { return new AppError(msg, 400); }
  static unauthorized(msg: string = "Unauthorized") { return new AppError(msg, 401); }
  static forbidden(msg: string = "Forbidden") { return new AppError(msg, 403); }
  static notFound(msg: string = "Not Found") { return new AppError(msg, 404); }
  static conflict(msg: string = "Conflict") { return new AppError(msg, 409); }
  static internal(msg: string = "Internal Server Error") { return new AppError(msg, 500); }
}
