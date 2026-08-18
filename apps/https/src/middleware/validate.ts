import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Express middleware factory that validates request body, query,
 * or params against a Zod schema.
 *
 * Usage:
 *   router.post("/departments", validate(createDepartmentSchema), handler);
 *   router.get("/students", validate(listQuerySchema, "query"), handler);
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") || "_root";
        if (!details[path]) details[path] = [];
        details[path].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    // Replace the source with parsed (and potentially transformed) data
    (req as any)[source] = result.data;
    next();
  };
}
