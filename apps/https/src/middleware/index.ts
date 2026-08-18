/**
 * Re-export all middleware from the shared auth package and local middleware.
 *
 * Usage:
 *   import { requireAuth, requireRole, asyncHandler, validate } from "../middleware";
 */

// Auth middleware
export { requireAuth, requireRole } from "@repo/auth/middleware";

// Error handling
export { asyncHandler } from "./async-handler.js";
export { errorHandler } from "./error-handler.js";

// Validation
export { validate } from "./validate.js";

// Activity logging
export { activityLoggerMiddleware, logActivity } from "./activity-logger.js";
export type { LogActivityParams } from "./activity-logger.js";
