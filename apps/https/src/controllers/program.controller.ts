import type { Request, Response } from "express";
import { programService } from "../services/program.service.js";
import { sendSuccess } from "../utils/response.js";

export const programController = {
  getAll: async (_req: Request, res: Response) => {
    const programs = await programService.getAll();
    sendSuccess(res, "Programs retrieved", programs);
  },

  getById: async (req: Request, res: Response) => {
    const program = await programService.getById(req.params.id as string);
    sendSuccess(res, "Program retrieved", program);
  },

  create: async (req: Request, res: Response) => {
    const program = await programService.create(req.body);
    sendSuccess(res, "Program created", program, 201);
  },

  update: async (req: Request, res: Response) => {
    const program = await programService.update(req.params.id as string, req.body);
    sendSuccess(res, "Program updated", program);
  },

  delete: async (req: Request, res: Response) => {
    await programService.delete(req.params.id as string);
    sendSuccess(res, "Program deleted");
  },
};
