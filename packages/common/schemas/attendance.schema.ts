import { z } from "zod";

// ─── Mark Attendance ────────────────────────────────────────────

export const markAttendanceSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  period: z.number().int().min(1).max(10),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: z.enum(["present", "absent", "late"]),
      })
    )
    .min(1, "At least one attendance record is required"),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

// ─── Attendance Query ───────────────────────────────────────────

export const attendanceQuerySchema = z.object({
  subjectId: z.string().optional(),
  studentId: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["present", "absent", "late"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;

// ─── Attendance Regularization ──────────────────────────────────

export const regularizeAttendanceSchema = z.object({
  attendanceId: z.string().min(1),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export type RegularizeAttendanceInput = z.infer<typeof regularizeAttendanceSchema>;
