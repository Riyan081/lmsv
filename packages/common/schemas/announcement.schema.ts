import { z } from "zod";

// ─── Create Announcement ────────────────────────────────────────

export const createAnnouncementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000),
  type: z.enum(["global", "department", "class", "hostel"]),
  targetId: z.string().optional(), // Required when type != "global"
  scheduledAt: z.string().datetime().optional(),
  isPinned: z.boolean().optional().default(false),
}).refine(
  (data) => data.type === "global" || (data.targetId && data.targetId.length > 0),
  {
    message: "Target is required for non-global announcements",
    path: ["targetId"],
  }
);

export const updateAnnouncementSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  isPinned: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

// ─── Announcement Query ─────────────────────────────────────────

export const announcementQuerySchema = z.object({
  type: z.enum(["global", "department", "class", "hostel"]).optional(),
  targetId: z.string().optional(),
  isPinned: z.string().optional(), // "true" / "false"
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type AnnouncementQueryInput = z.infer<typeof announcementQuerySchema>;
