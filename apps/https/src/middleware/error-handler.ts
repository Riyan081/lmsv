import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";

/**
 * Global error handling middleware.
 *
 * Catches all errors (thrown or passed via next()) and returns
 * a consistent JSON error response. Must be mounted LAST in the
 * Express middleware chain.
 *
 * Usage:
 *   app.use(errorHandler);  // after all routes
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default values
  let statusCode = 500;
  let message = "Internal server error";
  let details: Record<string, string[]> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    if (err instanceof ValidationError) {
      details = err.details;
    }
  } else if (err.name === "PrismaClientKnownRequestError") {
    // Handle Prisma-specific errors
    const prismaErr = err as any;
    switch (prismaErr.code) {
      case "P2002":
        statusCode = 409;
        message = `Duplicate value for: ${(prismaErr.meta?.target as string[])?.join(", ") || "unique field"}`;
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Related record not found (foreign key constraint)";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
    }
  } else if (err.name === "ZodError") {
    // Handle Zod validation errors
    statusCode = 422;
    message = "Validation failed";
    const zodErr = err as any;
    details = {};
    for (const issue of zodErr.issues || []) {
      const path = issue.path.join(".") || "_root";
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
  }

  // Log unexpected errors
  if (statusCode === 500) {
    console.error("[ERROR]", err);
  }

  const response: {
    success: false;
    error: string;
    details?: Record<string, string[]>;
  } = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}
