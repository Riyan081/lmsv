import type { Request, Response } from "express";
import { batchService } from "../services/batch.service.js";
import { sendSuccess } from "../utils/response.js";

export const batchController = {
  getAll: async (_req: Request, res: Response) => {
    const batches = await batchService.getAll();
    sendSuccess(res, "Batches retrieved", batches);
  },

  getById: async (req: Request, res: Response) => {
    const batch = await batchService.getById(req.params.id as string);
    sendSuccess(res, "Batch retrieved", batch);
  },

  create: async (req: Request, res: Response) => {
    const batch = await batchService.create(req.body);
    sendSuccess(res, "Batch created", batch, 201);
  },

  update: async (req: Request, res: Response) => {
    const batch = await batchService.update(req.params.id as string, req.body);
    sendSuccess(res, "Batch updated", batch);
  },

  delete: async (req: Request, res: Response) => {
    await batchService.delete(req.params.id as string);
    sendSuccess(res, "Batch deleted");
  },

  createSection: async (req: Request, res: Response) => {
    const section = await batchService.createSection(req.body);
    sendSuccess(res, "Section created", section, 201);
  },
};
