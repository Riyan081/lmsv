import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { markAttendanceSchema } from "@repo/common/schemas";

const router = Router();

// All routes require auth
router.use(requireAuth);

// Student: view own attendance
router.get("/my-summary", requireRole("student"), asyncHandler(attendanceController.getMySummary));

// Faculty/Admin: mark attendance
router.post("/mark", requireRole("faculty", "admin"), validate(markAttendanceSchema), asyncHandler(attendanceController.mark));

// Faculty/Admin: get attendance records
router.get("/", requireRole("faculty", "admin"), asyncHandler(attendanceController.getAll));

// Faculty/Admin: get student summary
router.get("/summary/:studentId", requireRole("faculty", "admin"), asyncHandler(attendanceController.getStudentSummary));

// Faculty/Admin: low attendance alerts
router.get("/low/:subjectId", requireRole("faculty", "admin"), asyncHandler(attendanceController.getLowAttendance));

export default router;
