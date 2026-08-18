/**
 * LMS User role constants used across the monorepo.
 *
 * Import from: @repo/common/constants
 */
export const ROLES = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
  WARDEN: "warden",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** All available roles as an array (useful for validation) */
export const ALL_ROLES: UserRole[] = Object.values(ROLES);

/** Role display labels */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  faculty: "Faculty",
  student: "Student",
  warden: "Hostel Warden",
};
