import type { Request, Response } from "express";
import { premiumService } from "../services/premium.service.js";
import { sendSuccess } from "../utils/response.js";

export const premiumController = {
  /**
   * GET /premium/features — List premium features.
   */
  getFeatures: (_req: Request, res: Response) => {
    const features = premiumService.getFeatures();
    sendSuccess(res, "Welcome to premium features! 🌟", features);
  },
};
