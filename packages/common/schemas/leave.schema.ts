import { z } from "zod";

// ─── Create Leave Application ───────────────────────────────────

export const createLeaveSchema = z.object({
  type: z.enum(["medical", "personal", "emergency", "other"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(1000),
  attachmentUrl: z.string().url().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;

// ─── Approve/Reject Leave ───────────────────────────────────────

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  approverNote: z.string().max(500).optional(),
});

export type UpdateLeaveStatusInput = z.infer<typeof updateLeaveStatusSchema>;

// ─── Leave Query ────────────────────────────────────────────────

export const leaveQuerySchema = z.object({
  userId: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  type: z.enum(["medical", "personal", "emergency", "other"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type LeaveQueryInput = z.infer<typeof leaveQuerySchema>;
