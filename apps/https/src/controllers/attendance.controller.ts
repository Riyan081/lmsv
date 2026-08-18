import type { Request, Response } from "express";
import { attendanceService } from "../services/attendance.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

export const attendanceController = {
  /** POST /api/attendance/mark — Mark attendance for a class */
  mark: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await attendanceService.markAttendance(req.body, user.id);

    await logActivity({
      userId: user.id,
      action: "create",
      module: "attendance",
      entityType: "Attendance",
      description: `Marked attendance: ${result.present} present, ${result.absent} absent, ${result.late} late`,
      metadata: { subjectId: req.body.subjectId, date: req.body.date, period: req.body.period, ...result },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    sendSuccess(res, "Attendance marked successfully", result, 201);
  },

  /** GET /api/attendance — Get attendance records with filters */
  getAll: async (req: Request, res: Response) => {
    const result = await attendanceService.getAttendance({
      subjectId: req.query.subjectId as string,
      studentId: req.query.studentId as string,
      date: req.query.date as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    });

    sendPaginated(res, "Attendance records retrieved", result.records, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },

  /** GET /api/attendance/summary/:studentId — Get attendance summary */
  getStudentSummary: async (req: Request, res: Response) => {
    const summary = await attendanceService.getStudentSummary(
      req.params.studentId as string,
      req.query.semesterId as string
    );
    sendSuccess(res, "Attendance summary retrieved", summary);
  },

  /** GET /api/attendance/my-summary — Get own attendance (student) */
  getMySummary: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const summary = await attendanceService.getStudentSummary(
      user.id,
      req.query.semesterId as string
    );
    sendSuccess(res, "Your attendance summary", summary);
  },

  /** GET /api/attendance/low/:subjectId — Low attendance students */
  getLowAttendance: async (req: Request, res: Response) => {
    const threshold = parseInt(req.query.threshold as string) || 75;
    const result = await attendanceService.getLowAttendance(req.params.subjectId as string, threshold);
    sendSuccess(res, "Low attendance students retrieved", result);
  },
};
