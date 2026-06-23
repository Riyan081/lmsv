import type { Response } from "express";
import type { ApiResponse } from "@repo/common/schemas";

/**
 * Standardized success response helper.
 */
export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): void {
  const response: ApiResponse<T> = { message, data };
  res.status(statusCode).json(response);
}

/**
 * Standardized error response helper.
 */
export function sendError(
  res: Response,
  error: string,
  statusCode = 400
): void {
  res.status(statusCode).json({ error });
}
