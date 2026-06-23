/**
 * @repo/common — Shared schemas, types, and constants for the monorepo.
 *
 * Usage:
 *   import { userSchema, type User } from "@repo/common/schemas";
 *   import { ROLES, type UserRole } from "@repo/common/constants";
 */

// Re-export everything for convenience
export * from "./schemas/index.js";
export * from "./constants/index.js";
