import type { Request, Response } from "express";
import { calendarService } from "../services/calendar.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

export const calendarController = {
  create: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const event = await calendarService.create(req.body, user.id);
    await logActivity({
      userId: user.id, action: "create", module: "calendar",
      entityType: "AcademicEvent", entityId: event.id,
      description: `Created ${event.type} event: "${event.title}"`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Event created", event, 201);
  },

  getAll: async (req: Request, res: Response) => {
    const result = await calendarService.getAll({
      startDate: req.query.startDate as string, endDate: req.query.endDate as string,
      type: req.query.type as string, departmentId: req.query.departmentId as string,
      month: req.query.month as string,
      page: parseInt(req.query.page as string) || 1, limit: parseInt(req.query.limit as string) || 50,
    });
    sendPaginated(res, "Events retrieved", result.records, {
      page: result.page, limit: result.limit, total: result.total,
    });
  },

  update: async (req: Request, res: Response) => {
    const event = await calendarService.update(req.params.id as string, req.body);
    sendSuccess(res, "Event updated", event);
  },

  delete: async (req: Request, res: Response) => {
    await calendarService.delete(req.params.id as string);
    sendSuccess(res, "Event deleted");
  },
};
