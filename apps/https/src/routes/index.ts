import { Router, type Router as ExpressRouter } from "express";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import premiumRoutes from "./premium.routes.js";

const router: ExpressRouter = Router();

// Mount sub-routers
router.use("/", userRoutes);
router.use("/admin", adminRoutes);
router.use("/premium", premiumRoutes);

export default router;
