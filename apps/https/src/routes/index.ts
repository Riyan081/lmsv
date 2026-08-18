import { Router, type Router as ExpressRouter } from "express";

// ─── LMS Module Routes ──────────────────────────────────────────
import departmentRoutes from "./department.routes.js";
import programRoutes from "./program.routes.js";
import batchRoutes from "./batch.routes.js";
import subjectRoutes from "./subject.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import leaveRoutes from "./leave.routes.js";
import timetableRoutes from "./timetable.routes.js";
import examRoutes from "./exam.routes.js";
import announcementRoutes from "./announcement.routes.js";
import calendarRoutes from "./calendar.routes.js";
import hostelRoutes from "./hostel.routes.js";
import activityLogRoutes from "./activity-log.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import userManagementRoutes from "./user-management.routes.js";

// ─── Legacy Routes (kept for backward compatibility) ────────────
import adminRoutes from "./admin.routes.js";
import userRoutes from "./user.routes.js";

const router: ExpressRouter = Router();

// ─── LMS API Routes ────────────────────────────────────────────
router.use("/api/departments", departmentRoutes);
router.use("/api/programs", programRoutes);
router.use("/api/batches", batchRoutes);
router.use("/api/subjects", subjectRoutes);
router.use("/api/users", userManagementRoutes);
router.use("/api/attendance", attendanceRoutes);
router.use("/api/leave", leaveRoutes);
router.use("/api/timetable", timetableRoutes);
router.use("/api/exams", examRoutes);
router.use("/api/announcements", announcementRoutes);
router.use("/api/calendar", calendarRoutes);
router.use("/api/hostel", hostelRoutes);
router.use("/api/activity-log", activityLogRoutes);
router.use("/api/dashboard", dashboardRoutes);

// ─── Legacy Routes ──────────────────────────────────────────────
router.use("/", userRoutes);
router.use("/admin", adminRoutes);

export default router;
