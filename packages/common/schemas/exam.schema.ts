import { z } from "zod";

// ─── Create Exam ────────────────────────────────────────────────

export const createExamSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["internal", "midterm", "endsem", "supplementary"]),
  subjectId: z.string().min(1, "Subject is required"),
  semesterId: z.string().min(1, "Semester is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  totalMarks: z.number().int().min(1).max(500),
});

export const updateExamSchema = createExamSchema.partial();

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;

// ─── Enter Marks (bulk) ─────────────────────────────────────────

export const enterMarksSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  results: z
    .array(
      z.object({
        studentId: z.string().min(1),
        marksObtained: z.number().min(0),
        grade: z.string().optional(),
      })
    )
    .min(1, "At least one result is required"),
});

export type EnterMarksInput = z.infer<typeof enterMarksSchema>;

// ─── Exam Query ─────────────────────────────────────────────────

export const examQuerySchema = z.object({
  subjectId: z.string().optional(),
  semesterId: z.string().optional(),
  type: z.enum(["internal", "midterm", "endsem", "supplementary"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type ExamQueryInput = z.infer<typeof examQuerySchema>;
