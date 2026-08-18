import { Router } from "express";
import { batchController } from "../controllers/batch.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createBatchSchema, updateBatchSchema, createSectionSchema } from "@repo/common/schemas";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", asyncHandler(batchController.getAll));
router.get("/:id", asyncHandler(batchController.getById));
router.post("/", validate(createBatchSchema), asyncHandler(batchController.create));
router.put("/:id", validate(updateBatchSchema), asyncHandler(batchController.update));
router.delete("/:id", asyncHandler(batchController.delete));

// Section within batch
router.post("/sections", validate(createSectionSchema), asyncHandler(batchController.createSection));

export default router;
