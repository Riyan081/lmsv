import { Router } from "express";
import { announcementController } from "../controllers/announcement.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createAnnouncementSchema, updateAnnouncementSchema } from "@repo/common/schemas";

const router = Router();
router.use(requireAuth);

// Any user: view announcements relevant to them
router.get("/my", asyncHandler(announcementController.getMyAnnouncements));

// Admin/Faculty/Warden: create announcements
router.post("/", requireRole("admin", "faculty", "warden"), validate(createAnnouncementSchema), asyncHandler(announcementController.create));

// Admin: manage all announcements
router.get("/", requireRole("admin"), asyncHandler(announcementController.getAll));
router.put("/:id", requireRole("admin"), validate(updateAnnouncementSchema), asyncHandler(announcementController.update));
router.delete("/:id", requireRole("admin"), asyncHandler(announcementController.delete));

export default router;
