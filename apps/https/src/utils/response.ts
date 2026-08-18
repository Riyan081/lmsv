import type { Response } from "express";

/**
 * Standardized API response interfaces.
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

/**
 * Send a standardized success response.
 */
export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): void {
  const response: SuccessResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
}

/**
 * Send a standardized paginated response.
 */
export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  statusCode = 200
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  res.status(statusCode).json(response);
}

/**
 * Send a standardized error response.
 */
export function sendError(
  res: Response,
  error: string,
  statusCode = 400
): void {
  const response: ErrorResponse = { success: false, error };
  res.status(statusCode).json(response);
}

/**
 * Parse pagination query params with sensible defaults.
 */
export function parsePagination(query: Record<string, any>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}
