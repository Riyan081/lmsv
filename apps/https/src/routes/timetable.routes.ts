import { Router } from "express";
import { timetableController } from "../controllers/timetable.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createTimetableSlotSchema, bulkCreateTimetableSchema } from "@repo/common/schemas";

const router = Router();
router.use(requireAuth);

// Any auth user: view own timetable
router.get("/my", asyncHandler(timetableController.getMyTimetable));

// Admin: get ALL slots (for admin timetable management page)
router.get("/", requireRole("admin"), asyncHandler(timetableController.getAll));

// Faculty/Admin: view by section or faculty
router.get("/section/:sectionId", requireRole("faculty", "admin"), asyncHandler(timetableController.getBySection));
router.get("/faculty/:facultyId", requireRole("faculty", "admin"), asyncHandler(timetableController.getByFaculty));

// Admin: create/update/delete slots
router.post("/", requireRole("admin"), validate(createTimetableSlotSchema), asyncHandler(timetableController.createSlot));
router.post("/bulk", requireRole("admin"), validate(bulkCreateTimetableSchema), asyncHandler(timetableController.bulkCreate));
router.put("/:id", requireRole("admin"), asyncHandler(timetableController.updateSlot));
router.delete("/:id", requireRole("admin"), asyncHandler(timetableController.deleteSlot));

// Admin-only: auto-generate timetable using constraint solver
router.post("/auto-generate", requireRole("admin"), asyncHandler(timetableController.autoGenerate));

export default router;
