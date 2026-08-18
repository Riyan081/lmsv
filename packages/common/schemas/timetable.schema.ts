import { z } from "zod";

// ─── Timetable Slot ─────────────────────────────────────────────

/** Base object schema (without refinements) — used for .omit() in bulk create */
const timetableSlotBaseSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(5), // 0=Mon, 5=Sat
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM format"),
  room: z.string().max(50).optional(),
  subjectId: z.string().min(1, "Subject is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  sectionId: z.string().min(1, "Section is required"),
  semesterId: z.string().min(1, "Semester is required"),
});

const timeRefinement = (data: { startTime: string; endTime: string }) =>
  data.endTime > data.startTime;

export const createTimetableSlotSchema = timetableSlotBaseSchema.refine(timeRefinement, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const updateTimetableSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(5).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  room: z.string().max(50).optional(),
  subjectId: z.string().optional(),
  facultyId: z.string().optional(),
});

export type CreateTimetableSlotInput = z.infer<typeof createTimetableSlotSchema>;
export type UpdateTimetableSlotInput = z.infer<typeof updateTimetableSlotSchema>;

// ─── Bulk Create Timetable ──────────────────────────────────────

export const bulkCreateTimetableSchema = z.object({
  sectionId: z.string().min(1, "Section is required"),
  semesterId: z.string().min(1, "Semester is required"),
  slots: z
    .array(timetableSlotBaseSchema.omit({ sectionId: true, semesterId: true }))
    .min(1, "At least one slot is required"),
});

export type BulkCreateTimetableInput = z.infer<typeof bulkCreateTimetableSchema>;

// ─── Timetable Query ────────────────────────────────────────────

export const timetableQuerySchema = z.object({
  sectionId: z.string().optional(),
  facultyId: z.string().optional(),
  semesterId: z.string().optional(),
  dayOfWeek: z.string().optional(),
});

export type TimetableQueryInput = z.infer<typeof timetableQuerySchema>;
