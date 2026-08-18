import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

export const dashboardController = {
  /** GET /api/dashboard/admin */
  getAdminDashboard: async (_req: Request, res: Response) => {
    const data = await dashboardService.getAdminDashboard();
    sendSuccess(res, "Admin dashboard", data);
  },

  /** GET /api/dashboard/faculty */
  getFacultyDashboard: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const data = await dashboardService.getFacultyDashboard(user.id);
    sendSuccess(res, "Faculty dashboard", data);
  },

  /** GET /api/dashboard/student */
  getStudentDashboard: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const data = await dashboardService.getStudentDashboard(user.id);
    sendSuccess(res, "Student dashboard", data);
  },

  /** GET /api/dashboard/warden */
  getWardenDashboard: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const data = await dashboardService.getWardenDashboard(user.id);
    sendSuccess(res, "Warden dashboard", data);
  },
};
