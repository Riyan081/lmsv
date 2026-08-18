import { z } from "zod";
import { ROLES, ALL_ROLES } from "../constants/roles.js";

// ─── User Schema ──────────────────────────────────────────────────

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
  role: z.enum(ALL_ROLES as unknown as [string, ...string[]]).default(ROLES.STUDENT),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

// ─── User Profile (public-safe subset) ───────────────────────────

export const userProfileSchema = userSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
  image: true,
  createdAt: true,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
