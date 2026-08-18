import { z } from "zod";

// ─── Create Hostel ──────────────────────────────────────────────

export const createHostelSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["boys", "girls"]),
  wardenId: z.string().optional(),
  totalRooms: z.number().int().min(0).optional().default(0),
});

export const updateHostelSchema = createHostelSchema.partial();

export type CreateHostelInput = z.infer<typeof createHostelSchema>;
export type UpdateHostelInput = z.infer<typeof updateHostelSchema>;

// ─── Create Room ────────────────────────────────────────────────

export const createRoomSchema = z.object({
  hostelId: z.string().min(1, "Hostel is required"),
  roomNumber: z.string().min(1).max(20),
  floor: z.number().int().min(0).max(20),
  capacity: z.number().int().min(1).max(10).default(2),
});

export const updateRoomSchema = z.object({
  roomNumber: z.string().min(1).max(20).optional(),
  floor: z.number().int().min(0).max(20).optional(),
  capacity: z.number().int().min(1).max(10).optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

// ─── Room Allocation ────────────────────────────────────────────

export const allocateRoomSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  roomId: z.string().min(1, "Room is required"),
  allocatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

export type AllocateRoomInput = z.infer<typeof allocateRoomSchema>;

// ─── Gate Pass ──────────────────────────────────────────────────

export const createGatePassSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
  outDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  outTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM format"),
  expectedReturnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

export const updateGatePassStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export type CreateGatePassInput = z.infer<typeof createGatePassSchema>;
export type UpdateGatePassStatusInput = z.infer<typeof updateGatePassStatusSchema>;

// ─── Hostel Complaint ───────────────────────────────────────────

export const createComplaintSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
  category: z.enum(["plumbing", "electrical", "furniture", "cleaning", "other"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
