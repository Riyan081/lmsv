import type { Request, Response } from "express";
import { subjectService } from "../services/subject.service.js";
import { sendSuccess } from "../utils/response.js";

export const subjectController = {
  getAll: async (_req: Request, res: Response) => {
    const subjects = await subjectService.getAll();
    sendSuccess(res, "Subjects retrieved", subjects);
  },

  getById: async (req: Request, res: Response) => {
    const subject = await subjectService.getById(req.params.id as string);
    sendSuccess(res, "Subject retrieved", subject);
  },

  create: async (req: Request, res: Response) => {
    const subject = await subjectService.create(req.body);
    sendSuccess(res, "Subject created", subject, 201);
  },

  update: async (req: Request, res: Response) => {
    const subject = await subjectService.update(req.params.id as string, req.body);
    sendSuccess(res, "Subject updated", subject);
  },

  delete: async (req: Request, res: Response) => {
    await subjectService.delete(req.params.id as string);
    sendSuccess(res, "Subject deleted");
  },
};
