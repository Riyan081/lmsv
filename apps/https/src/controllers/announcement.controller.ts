import type { Request, Response } from "express";
import { announcementService } from "../services/announcement.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

import prisma from "@repo/db/client";

export const announcementController = {
  create: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const announcement = await announcementService.create(req.body, user.id);
    await logActivity({
      userId: user.id, action: "create", module: "announcement",
      entityType: "Announcement", entityId: announcement.id,
      description: `Created ${announcement.type} announcement: "${announcement.title}"`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Announcement created", announcement, 201);
  },

  getAll: async (req: Request, res: Response) => {
    const result = await announcementService.getAll({
      type: req.query.type as string, targetId: req.query.targetId as string,
      isPinned: req.query.isPinned as string,
      page: parseInt(req.query.page as string) || 1, limit: parseInt(req.query.limit as string) || 20,
    });
    sendPaginated(res, "Announcements retrieved", result.records, {
      page: result.page, limit: result.limit, total: result.total,
    });
  },

  getMyAnnouncements: async (req: Request, res: Response) => {
    const user = (req as any).user;
    let departmentId = user.departmentId;
    let sectionId = user.sectionId;
    if (!departmentId || !sectionId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { departmentId: true, sectionId: true },
      });
      if (dbUser) {
        departmentId = departmentId || dbUser.departmentId;
        sectionId = sectionId || dbUser.sectionId;
      }
    }

    const result = await announcementService.getForUser(
      user.id, user.role, departmentId, sectionId,
      parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 20,
    );
    sendPaginated(res, "Your announcements", result.records, {
      page: result.page, limit: result.limit, total: result.total,
    });
  },

  update: async (req: Request, res: Response) => {
    const announcement = await announcementService.update(req.params.id as string, req.body);
    sendSuccess(res, "Announcement updated", announcement);
  },

  delete: async (req: Request, res: Response) => {
    await announcementService.delete(req.params.id as string);
    sendSuccess(res, "Announcement deleted");
  },
};
