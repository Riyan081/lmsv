import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/index.js";
import { userController } from "../controllers/user.controller.js";

const router: ExpressRouter = Router();

router.get("/users", requireAuth, userController.getAll);
router.get("/me", requireAuth, userController.getMe);

export default router;
