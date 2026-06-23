import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";

export const userController = {
  /**
   * GET /users — List all users.
   */
  getAll: async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    sendSuccess(res, "Users fetched successfully", users);
  },

  /**
   * GET /me — Get authenticated user's profile.
   */
  getMe: (req: Request, res: Response) => {
    const profile = userService.getUserProfile((req as any).user);
    sendSuccess(res, "Your profile", profile);
  },
};
