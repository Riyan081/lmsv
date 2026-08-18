import { z } from "zod";

// ─── Create Academic Event ──────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  type: z.enum(["holiday", "exam_period", "event", "seminar", "workshop", "sports"]),
  departmentId: z.string().optional(), // null = all departments
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export const updateEventSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.enum(["holiday", "exam_period", "event", "seminar", "workshop", "sports"]).optional(),
  departmentId: z.string().optional().nullable(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ─── Calendar Query ─────────────────────────────────────────────

export const calendarQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["holiday", "exam_period", "event", "seminar", "workshop", "sports"]).optional(),
  departmentId: z.string().optional(),
  month: z.string().optional(), // "2024-08"
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;
