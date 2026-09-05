import type { Request, Response } from "express";
import { examService } from "../services/exam.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

export const examController = {
  create: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const exam = await examService.create(req.body, user.id);
    await logActivity({
      userId: user.id, action: "create", module: "exam",
      entityType: "Exam", entityId: exam.id,
      description: `Created exam "${exam.name}" for ${exam.subject.name}`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Exam created", exam, 201);
  },

  getAll: async (req: Request, res: Response) => {
    const result = await examService.getAll({
      subjectId: req.query.subjectId as string,
      semesterId: req.query.semesterId as string,
      type: req.query.type as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    sendPaginated(res, "Exams retrieved", result.records, {
      page: result.page, limit: result.limit, total: result.total,
    });
  },

  enterMarks: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await examService.enterMarks(req.body, user.id);
    await logActivity({
      userId: user.id, action: "create", module: "exam",
      entityType: "Result", entityId: result.examId,
      description: `Entered marks for ${result.totalEntered} students`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Marks entered successfully", result);
  },

  getStudentResults: async (req: Request, res: Response) => {
    const results = await examService.getStudentResults(req.params.studentId as string, req.query.semesterId as string);
    sendSuccess(res, "Student results retrieved", results);
  },

  getMyResults: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const results = await examService.getStudentResults(user.id, req.query.semesterId as string);
    sendSuccess(res, "Your results", results);
  },

  update: async (req: Request, res: Response) => {
    const user = (req as any).user;
    const exam = await examService.update(req.params.id as string, req.body);
    await logActivity({
      userId: user.id, action: "update", module: "exam",
      entityType: "Exam", entityId: exam.id,
      description: `Updated exam "${exam.name}"`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Exam updated", exam);
  },

  delete: async (req: Request, res: Response) => {
    const user = (req as any).user;
    await examService.delete(req.params.id as string);
    await logActivity({
      userId: user.id, action: "delete", module: "exam",
      entityType: "Exam", entityId: req.params.id as string,
      description: `Deleted exam ${req.params.id}`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Exam deleted");
  },
};
