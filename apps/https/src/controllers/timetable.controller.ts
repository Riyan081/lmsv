import type { Request, Response } from "express";
import { timetableService } from "../services/timetable.service.js";
import { timetableGeneratorService } from "../services/timetable-generator.service.js";
import { sendSuccess } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

import prisma from "@repo/db/client";

export const timetableController = {
  /** Admin: list all timetable slots */
  getAll: async (_req: Request, res: Response) => {
    const slots = await timetableService.getAll();
    sendSuccess(res, "All timetable slots retrieved", slots);
  },

  getBySection: async (req: Request, res: Response) => {
    const slots = await timetableService.getBySection(req.params.sectionId as string, req.query.semesterId as string);
    sendSuccess(res, "Timetable retrieved", slots);
  },

  getByFaculty: async (req: Request, res: Response) => {
    const slots = await timetableService.getByFaculty(req.params.facultyId as string, req.query.semesterId as string);
    sendSuccess(res, "Faculty timetable retrieved", slots);
  },

  getMyTimetable: async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role === "faculty") {
      const slots = await timetableService.getByFaculty(user.id, req.query.semesterId as string);
      sendSuccess(res, "Your timetable", slots);
    } else if (user.role === "student") {
      let sectionId = user.sectionId;
      if (!sectionId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { sectionId: true },
        });
        sectionId = dbUser?.sectionId;
      }
      if (sectionId) {
        const slots = await timetableService.getBySection(sectionId, req.query.semesterId as string);
        sendSuccess(res, "Your timetable", slots);
        return;
      }
      sendSuccess(res, "No timetable available", []);
    } else {
      sendSuccess(res, "No timetable available", []);
    }
  },

  createSlot: async (req: Request, res: Response) => {
    const slot = await timetableService.createSlot(req.body);
    await logActivity({
      userId: (req as any).user?.id, action: "create", module: "timetable",
      entityType: "TimetableSlot", entityId: slot.id,
      description: `Created timetable slot for ${slot.subject.name}`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, "Timetable slot created", slot, 201);
  },

  bulkCreate: async (req: Request, res: Response) => {
    const slots = await timetableService.bulkCreate(req.body);
    await logActivity({
      userId: (req as any).user?.id, action: "create", module: "timetable",
      description: `Created ${slots.length} timetable slots in bulk`,
      ipAddress: req.ip, userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, `${slots.length} timetable slots created`, slots, 201);
  },

  updateSlot: async (req: Request, res: Response) => {
    const slot = await timetableService.updateSlot(req.params.id as string, req.body);
    sendSuccess(res, "Timetable slot updated", slot);
  },

  deleteSlot: async (req: Request, res: Response) => {
    await timetableService.deleteSlot(req.params.id as string);
    sendSuccess(res, "Timetable slot deleted");
  },

  /** POST /api/timetable/auto-generate */
  autoGenerate: async (req: Request, res: Response) => {
    const { sectionId, semesterId, clearExisting = false } = req.body;

    if (!sectionId || !semesterId) {
      res.status(400).json({ success: false, error: "sectionId and semesterId are required" });
      return;
    }

    const result = await timetableGeneratorService.generateAndSave(
      sectionId,
      semesterId,
      { clearExisting }
    );

    if (!result.success) {
      res.status(422).json({
        success: false,
        error: result.error,
        warnings: result.warnings,
      });
      return;
    }

    await logActivity({
      userId: (req as any).user?.id,
      action: "create",
      module: "timetable",
      description: `Auto-generated ${result.created} timetable slots for section`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    sendSuccess(res, `Auto-generated ${result.created} timetable slots`, {
      created: result.created,
      warnings: result.warnings,
    }, 201);
  },
};
