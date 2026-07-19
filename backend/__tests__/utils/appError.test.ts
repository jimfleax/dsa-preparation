import { AppError } from "../../src/lib/AppError.ts";

describe("AppError", () => {
  it("creates a badRequest error with 400 status", () => {
    const err = AppError.badRequest("Invalid input");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Invalid input");
    expect(err.isOperational).toBe(true);
  });

  it("creates an unauthorized error with 401 status", () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized"); // Default message
  });

  it("creates a forbidden error with 403 status", () => {
    const err = AppError.forbidden("Access denied");
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Access denied");
  });

  it("creates a notFound error with 404 status", () => {
    const err = AppError.notFound("Resource not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Resource not found");
  });

  it("creates a conflict error with 409 status", () => {
    const err = AppError.conflict("Already exists");
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("Already exists");
  });

  it("creates an internal error with 500 status", () => {
    const err = AppError.internal("Server crashed");
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("Server crashed");
    expect(err.isOperational).toBe(true);
  });
  
  it("captures stack trace", () => {
    const err = AppError.badRequest();
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("AppError");
  });
});
