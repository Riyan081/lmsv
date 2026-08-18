import type { Request, Response } from "express";
import { departmentService } from "../services/department.service.js";
import { sendSuccess } from "../utils/response.js";
import { logActivity } from "../middleware/activity-logger.js";

/**
 * Department controller — handles HTTP requests for department CRUD.
 * All handlers are wrapped by asyncHandler in routes.
 */
export const departmentController = {
  /** GET /api/departments */
  getAll: async (_req: Request, res: Response) => {
    const departments = await departmentService.getAll();
    sendSuccess(res, "Departments retrieved", departments);
  },

  /** GET /api/departments/:id */
  getById: async (req: Request, res: Response) => {
    const department = await departmentService.getById(req.params.id as string);
    sendSuccess(res, "Department retrieved", department);
  },

  /** POST /api/departments */
  create: async (req: Request, res: Response) => {
    const department = await departmentService.create(req.body);

    await logActivity({
      userId: (req as any).user?.id,
      action: "create",
      module: "department",
      entityType: "Department",
      entityId: department.id,
      description: `Created department "${department.name}" (${department.code})`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    sendSuccess(res, "Department created", department, 201);
  },

  /** PUT /api/departments/:id */
  update: async (req: Request, res: Response) => {
    const department = await departmentService.update(req.params.id as string, req.body);

    await logActivity({
      userId: (req as any).user?.id,
      action: "update",
      module: "department",
      entityType: "Department",
      entityId: department.id,
      description: `Updated department "${department.name}"`,
      metadata: { changes: req.body },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    sendSuccess(res, "Department updated", department);
  },

  /** DELETE /api/departments/:id */
  delete: async (req: Request, res: Response) => {
    const department = await departmentService.delete(req.params.id as string);

    await logActivity({
      userId: (req as any).user?.id,
      action: "delete",
      module: "department",
      entityType: "Department",
      entityId: department.id,
      description: `Deleted department "${department.name}"`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    sendSuccess(res, "Department deleted");
  },
};
