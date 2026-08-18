import type { Request, Response } from "express";
import { leaveService } from "../services/leave.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

export const leaveController = {
  create: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const leave = await leaveService.create(user.id, req.body);

    await logActivity({
      userId: user.id, action: "create", module: "leave",
      entityType: "LeaveApplication", entityId: leave.id,
      description: `Applied for ${leave.type} leave (${leave.startDate.toISOString().split("T")[0]} to ${leave.endDate.toISOString().split("T")[0]})`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });

    sendSuccess(res, "Leave application submitted", leave, 201);
  },

  getAll: async (req: Request, res: Response) => {
    const result = await leaveService.getAll({
      userId: req.query.userId as string,
      status: req.query.status as string,
      type: req.query.type as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    sendPaginated(res, "Leave applications retrieved", result.records, {
      page: result.page, limit: result.limit, total: result.total,
    });
  },

  getById: async (req: Request, res: Response) => {
    const leave = await leaveService.getById(req.params.id as string);
    sendSuccess(res, "Leave application retrieved", leave);
  },

  updateStatus: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const leave = await leaveService.updateStatus(req.params.id as string, user.id, req.body);

    await logActivity({
      userId: user.id, action: req.body.status === "approved" ? "approve" : "reject",
      module: "leave", entityType: "LeaveApplication", entityId: leave.id,
      description: `${req.body.status === "approved" ? "Approved" : "Rejected"} leave for ${leave.user.name}`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });

    sendSuccess(res, `Leave application ${req.body.status}`, leave);
  },

  getMyLeaves: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await leaveService.getMyLeaves(
      user.id,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 20
    );
    sendPaginated(res, "Your leave applications", result.records, {
      page: result.page, limit: result.limit, total: result.total,
    });
  },
};
