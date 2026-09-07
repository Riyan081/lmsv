import { Router } from "express";
import { userManagementController } from "../controllers/user-management.controller.js";
import { asyncHandler, requireAuth, requireRole } from "../middleware/index.js";

const router = Router();

// Profile of current authenticated user (all roles)
router.get("/me", requireAuth, asyncHandler(userManagementController.getProfile));

// Read access for authenticated staff (admin and faculty)
router.get("/", requireAuth, requireRole("admin", "faculty"), asyncHandler(userManagementController.list));
router.get("/:id", requireAuth, requireRole("admin", "faculty"), asyncHandler(userManagementController.getById));

// Write access strictly for admin
router.post("/", requireAuth, requireRole("admin"), asyncHandler(userManagementController.create));
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(userManagementController.update));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(userManagementController.delete));

export default router;
