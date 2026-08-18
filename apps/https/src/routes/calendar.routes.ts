import { Router } from "express";
import { calendarController } from "../controllers/calendar.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createEventSchema, updateEventSchema } from "@repo/common/schemas";

const router = Router();
router.use(requireAuth);

// Any user: view calendar events
router.get("/", asyncHandler(calendarController.getAll));

// Admin: manage calendar events
router.post("/", requireRole("admin"), validate(createEventSchema), asyncHandler(calendarController.create));
router.put("/:id", requireRole("admin"), validate(updateEventSchema), asyncHandler(calendarController.update));
router.delete("/:id", requireRole("admin"), asyncHandler(calendarController.delete));

export default router;
