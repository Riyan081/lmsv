import { z } from "zod";

// ─── Standard API Response ────────────────────────────────────────

export const apiResponseSchema = z.object({
  message: z.string(),
  data: z.unknown().optional(),
});

export type ApiResponse<T = unknown> = {
  message: string;
  data?: T;
};

// ─── Error Response ───────────────────────────────────────────────

export const apiErrorSchema = z.object({
  error: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
