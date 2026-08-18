import { Router } from "express";
import { programController } from "../controllers/program.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createProgramSchema, updateProgramSchema } from "@repo/common/schemas";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", asyncHandler(programController.getAll));
router.get("/:id", asyncHandler(programController.getById));
router.post("/", validate(createProgramSchema), asyncHandler(programController.create));
router.put("/:id", validate(updateProgramSchema), asyncHandler(programController.update));
router.delete("/:id", asyncHandler(programController.delete));

export default router;
