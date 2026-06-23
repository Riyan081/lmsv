import { Router, type Router as ExpressRouter } from "express";
import { requireAuth, requireRole } from "../middleware/index.js";
import { adminController } from "../controllers/admin.controller.js";

const router: ExpressRouter = Router();

router.get("/stats", requireAuth, requireRole("admin"), adminController.getStats);

export default router;
