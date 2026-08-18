import { Router } from "express";
import { activityLogController } from "../controllers/activity-log.controller.js";
import { asyncHandler, requireAuth, requireRole } from "../middleware/index.js";

const router = Router();

// Activity logs are admin-only
router.use(requireAuth, requireRole("admin"));

router.get("/", asyncHandler(activityLogController.getAll));
router.get("/recent", asyncHandler(activityLogController.getRecent));
router.get("/stats", asyncHandler(activityLogController.getStats));

export default router;
