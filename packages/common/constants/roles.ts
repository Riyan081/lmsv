/**
 * User role constants used across the monorepo.
 *
 * Import from: @repo/common/constants
 */
export const ROLES = {
  USER: "user",
  PREMIUM: "premium",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** All available roles as an array (useful for validation) */
export const ALL_ROLES: UserRole[] = Object.values(ROLES);
