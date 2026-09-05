import type { Request, Response } from "express";
import { subjectService } from "../services/subject.service.js";
import { sendSuccess } from "../utils/response.js";
import prisma from "@repo/db/client";
import { ConflictError } from "../utils/errors.js";

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

  /** POST /api/subjects/:id/assign-faculty */
  assignFaculty: async (req: Request, res: Response) => {
    const { facultyId, sectionId, semesterId } = req.body;
    const subjectId = req.params.id as string;

    if (!facultyId || !sectionId || !semesterId) {
      res.status(400).json({ success: false, error: "facultyId, sectionId, and semesterId are required" });
      return;
    }

    // Check for duplicate
    const existing = await prisma.facultySubject.findFirst({
      where: { facultyId, subjectId, semesterId, sectionId },
    });
    if (existing) throw new ConflictError("This faculty is already assigned to this subject/section");

    const mapping = await prisma.facultySubject.create({
      data: { facultyId, subjectId, semesterId, sectionId },
      include: {
        faculty: { select: { id: true, name: true, email: true } },
        section: { select: { id: true, name: true } },
      },
    });
    sendSuccess(res, "Faculty assigned to subject", mapping, 201);
  },
};
