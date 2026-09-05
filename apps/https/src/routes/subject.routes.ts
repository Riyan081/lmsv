import { Router } from "express";
import { subjectController } from "../controllers/subject.controller.js";
import { asyncHandler, requireAuth, requireRole, validate } from "../middleware/index.js";
import { createSubjectSchema, updateSubjectSchema } from "@repo/common/schemas";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", asyncHandler(subjectController.getAll));
router.get("/:id", asyncHandler(subjectController.getById));
router.post("/", validate(createSubjectSchema), asyncHandler(subjectController.create));
router.post("/:id/assign-faculty", asyncHandler(subjectController.assignFaculty));
router.put("/:id", validate(updateSubjectSchema), asyncHandler(subjectController.update));
router.delete("/:id", asyncHandler(subjectController.delete));

export default router;
