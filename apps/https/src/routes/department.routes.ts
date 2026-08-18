import { Router } from "express";
import { departmentController } from "../controllers/department.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createDepartmentSchema, updateDepartmentSchema } from "@repo/common/schemas";

const router = Router();

// All department routes require admin auth
router.use(requireAuth, requireRole("admin"));

router.get("/", asyncHandler(departmentController.getAll));
router.get("/:id", asyncHandler(departmentController.getById));
router.post("/", validate(createDepartmentSchema), asyncHandler(departmentController.create));
router.put("/:id", validate(updateDepartmentSchema), asyncHandler(departmentController.update));
router.delete("/:id", asyncHandler(departmentController.delete));

export default router;
