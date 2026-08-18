import { Router } from "express";
import { examController } from "../controllers/exam.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createExamSchema, updateExamSchema, enterMarksSchema } from "@repo/common/schemas";

const router = Router();
router.use(requireAuth);

// Student: view own results
router.get("/results/my", requireRole("student"), asyncHandler(examController.getMyResults));

// Faculty/Admin: manage exams and marks
router.get("/", requireRole("faculty", "admin"), asyncHandler(examController.getAll));
router.post("/", requireRole("faculty", "admin"), validate(createExamSchema), asyncHandler(examController.create));
router.put("/:id", requireRole("faculty", "admin"), validate(updateExamSchema), asyncHandler(examController.update));
router.delete("/:id", requireRole("faculty", "admin"), asyncHandler(examController.delete));
router.post("/marks", requireRole("faculty", "admin"), validate(enterMarksSchema), asyncHandler(examController.enterMarks));
router.get("/results/:studentId", requireRole("faculty", "admin"), asyncHandler(examController.getStudentResults));

export default router;
