import type { Request, Response } from "express";
import { userManagementService } from "../services/user-management.service.js";
import { sendSuccess } from "../utils/response.js";

export const userManagementController = {
  /** GET /api/users?role=student&sectionId=...&batchId=... */
  list: async (req: Request, res: Response) => {
    const role = (req.query.role as string) || "student";
    const users = await userManagementService.listByRole(role, {
      sectionId: req.query.sectionId as string | undefined,
      batchId: req.query.batchId as string | undefined,
    });
    sendSuccess(res, `${role}s retrieved`, users);
  },

  /** GET /api/users/:id */
  getById: async (req: Request, res: Response) => {
    const user = await userManagementService.getById(req.params.id as string);
    sendSuccess(res, "User retrieved", user);
  },

  /** POST /api/users */
  create: async (req: Request, res: Response) => {
    const user = await userManagementService.createUser(req.body);
    sendSuccess(res, "User created successfully", user, 201);
  },

  /** PUT /api/users/:id */
  update: async (req: Request, res: Response) => {
    const user = await userManagementService.updateUser(req.params.id as string, req.body);
    sendSuccess(res, "User updated", user);
  },

  /** DELETE /api/users/:id */
  delete: async (req: Request, res: Response) => {
    await userManagementService.deleteUser(req.params.id as string);
    sendSuccess(res, "User deleted");
  },
};
