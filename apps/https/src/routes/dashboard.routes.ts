import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { asyncHandler, requireAuth, requireRole } from "../middleware/index.js";

const router = Router();
router.use(requireAuth);

router.get("/admin", requireRole("admin"), asyncHandler(dashboardController.getAdminDashboard));
router.get("/faculty", requireRole("faculty"), asyncHandler(dashboardController.getFacultyDashboard));
router.get("/student", requireRole("student"), asyncHandler(dashboardController.getStudentDashboard));
router.get("/warden", requireRole("warden"), asyncHandler(dashboardController.getWardenDashboard));

export default router;
