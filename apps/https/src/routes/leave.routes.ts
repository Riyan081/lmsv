import { Router } from "express";
import { leaveController } from "../controllers/leave.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createLeaveSchema, updateLeaveStatusSchema } from "@repo/common/schemas";

const router = Router();
router.use(requireAuth);

// Any authenticated user can apply for leave
router.post("/", validate(createLeaveSchema), asyncHandler(leaveController.create));

// Any user can view own leaves
router.get("/my", asyncHandler(leaveController.getMyLeaves));

// Faculty/Admin: view all leaves and manage
router.get("/", requireRole("faculty", "admin"), asyncHandler(leaveController.getAll));
router.get("/:id", requireRole("faculty", "admin"), asyncHandler(leaveController.getById));
router.patch("/:id/status", requireRole("faculty", "admin"), validate(updateLeaveStatusSchema), asyncHandler(leaveController.updateStatus));

export default router;
