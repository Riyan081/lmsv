import { Router, type Router as ExpressRouter } from "express";
import { requireAuth, requireRole } from "../middleware/index.js";
import { premiumController } from "../controllers/premium.controller.js";

const router: ExpressRouter = Router();

router.get(
  "/features",
  requireAuth,
  requireRole("premium", "admin"),
  premiumController.getFeatures
);

export default router;
