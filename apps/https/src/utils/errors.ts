/**
 * Custom error classes for the LMS API.
 *
 * Usage:
 *   throw new NotFoundError("Student not found");
 *   throw new ValidationError("Invalid email format");
 *   throw new ForbiddenError("Only admins can perform this action");
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Bad Request */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

/** 401 — Unauthorized */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 403 — Forbidden */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/** 404 — Not Found */
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

/** 409 — Conflict (duplicate, already exists) */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

/** 422 — Validation Error (with optional field-level details) */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>;

  constructor(message = "Validation failed", details?: Record<string, string[]>) {
    super(message, 422);
    this.details = details;
  }
}
