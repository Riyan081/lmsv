import type { Request, Response } from "express";
import { adminService } from "../services/admin.service.js";
import { sendSuccess } from "../utils/response.js";

export const adminController = {
  /**
   * GET /admin/stats — Admin dashboard statistics.
   */
  getStats: async (_req: Request, res: Response) => {
    const stats = await adminService.getStats();
    sendSuccess(res, "Admin stats", stats);
  },
};
