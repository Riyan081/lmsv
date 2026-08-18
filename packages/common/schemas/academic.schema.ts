import { z } from "zod";

// ─── Department Schemas ─────────────────────────────────────────

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10)
    .toUpperCase(),
  description: z.string().max(500).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

// ─── Program Schemas ────────────────────────────────────────────

export const createProgramSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).toUpperCase(),
  durationYears: z.number().int().min(1).max(6),
  totalSemesters: z.number().int().min(1).max(12),
  departmentId: z.string().min(1, "Department is required"),
});

export const updateProgramSchema = createProgramSchema.partial();

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

// ─── Batch Schemas ──────────────────────────────────────────────

export const createBatchSchema = z.object({
  name: z.string().min(2).max(50), // e.g., "2023-2027"
  startYear: z.number().int().min(2000).max(2100),
  endYear: z.number().int().min(2000).max(2100),
  programId: z.string().min(1, "Program is required"),
}).refine((data) => data.endYear > data.startYear, {
  message: "End year must be after start year",
  path: ["endYear"],
});

export const updateBatchSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  startYear: z.number().int().min(2000).max(2100).optional(),
  endYear: z.number().int().min(2000).max(2100).optional(),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

// ─── Section Schemas ────────────────────────────────────────────

export const createSectionSchema = z.object({
  name: z.string().min(1).max(10), // e.g., "A", "B"
  batchId: z.string().min(1, "Batch is required"),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;

// ─── Semester Schemas ───────────────────────────────────────────

export const createSemesterSchema = z.object({
  number: z.number().int().min(1).max(12),
  programId: z.string().min(1, "Program is required"),
  isCurrent: z.boolean().optional().default(false),
});

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;

// ─── Subject Schemas ────────────────────────────────────────────

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).toUpperCase(),
  credits: z.number().int().min(1).max(10),
  type: z.enum(["theory", "practical", "elective"]).default("theory"),
  semesterId: z.string().min(1, "Semester is required"),
  departmentId: z.string().min(1, "Department is required"),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
