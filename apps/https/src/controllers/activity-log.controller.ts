import type { Request, Response } from "express";
import { activityLogService } from "../services/activity-log.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";

export const activityLogController = {
  getAll: async (req: Request, res: Response) => {
    const result = await activityLogService.getAll({
      userId: req.query.userId as string,
      module: req.query.module as string,
      action: req.query.action as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    });
    sendPaginated(res, "Activity logs retrieved", result.records, {
      page: result.page, limit: result.limit, total: result.total,
    });
  },

  getRecent: async (req: Request, res: Response) => {
    const count = parseInt(req.query.count as string) || 50;
    const logs = await activityLogService.getRecent(count);
    sendSuccess(res, "Recent activity", logs);
  },

  getStats: async (_req: Request, res: Response) => {
    const stats = await activityLogService.getStats();
    sendSuccess(res, "Activity stats", stats);
  },
};
