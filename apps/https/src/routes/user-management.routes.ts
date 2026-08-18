import { Router } from "express";
import { userManagementController } from "../controllers/user-management.controller.js";
import { asyncHandler, requireAuth, requireRole } from "../middleware/index.js";

const router = Router();

// All user management requires admin
router.use(requireAuth, requireRole("admin"));

router.get("/", asyncHandler(userManagementController.list));
router.get("/:id", asyncHandler(userManagementController.getById));
router.post("/", asyncHandler(userManagementController.create));
router.put("/:id", asyncHandler(userManagementController.update));
router.delete("/:id", asyncHandler(userManagementController.delete));

export default router;
