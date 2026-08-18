import type { Request, Response, NextFunction } from "express";
import prisma from "@repo/db/client";
import { Prisma } from "@prisma/client";

/**
 * Activity logger — records user actions to the activity_log table.
 *
 * Can be used as:
 * 1. Middleware: Automatically logs all mutating requests (POST, PUT, PATCH, DELETE)
 * 2. Direct call: logActivity() for manual logging in services
 */

export interface LogActivityParams {
  userId?: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Directly log an activity to the database.
 * Use this in services for fine-grained control.
 *
 * Usage:
 *   await logActivity({
 *     userId: req.user.id,
 *     action: "create",
 *     module: "department",
 *     entityType: "Department",
 *     entityId: department.id,
 *     description: `Created department "${department.name}"`,
 *   });
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId || null,
        action: params.action as any,
        module: params.module as any,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        description: params.description,
        metadata: params.metadata !== undefined
          ? (params.metadata as Prisma.InputJsonValue)
          : Prisma.DbNull,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    // Activity logging should never break the main flow
    console.error("[ActivityLog] Failed to log activity:", error);
  }
}

/**
 * Express middleware that automatically logs mutating requests.
 * Attach AFTER auth middleware so req.user is available.
 *
 * Usage:
 *   router.use(activityLoggerMiddleware);
 */
export function activityLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only log mutating requests
  const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!mutatingMethods.includes(req.method)) {
    next();
    return;
  }

  // Log after response is sent (non-blocking)
  const originalSend = res.json.bind(res);
  res.json = function (body: any) {
    // Only log successful mutations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const user = (req as any).user;
      const module = extractModule(req.path);
      const action = methodToAction(req.method);

      logActivity({
        userId: user?.id,
        action,
        module,
        description: `${req.method} ${req.path}`,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        },
        ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString(),
        userAgent: req.headers["user-agent"],
      });
    }

    return originalSend(body);
  };

  next();
}

/** Extract module name from route path */
function extractModule(path: string): string {
  const segments = path.split("/").filter(Boolean);
  // Skip "api" prefix: /api/departments → "department"
  const moduleSegment = segments[0] === "api" ? segments[1] : segments[0];

  const moduleMap: Record<string, string> = {
    departments: "department",
    students: "student",
    faculty: "faculty",
    attendance: "attendance",
    leave: "leave",
    exams: "exam",
    results: "exam",
    calendar: "calendar",
    hostel: "hostel",
    announcements: "announcement",
    timetable: "timetable",
    dashboard: "system",
  };

  return moduleMap[moduleSegment || ""] || "system";
}

/** Map HTTP method to action verb */
function methodToAction(method: string): string {
  switch (method) {
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "create";
  }
}
