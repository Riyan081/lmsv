import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler to automatically catch
 * errors and forward them to the error handling middleware.
 *
 * Eliminates the need for try-catch blocks in every controller.
 *
 * Usage:
 *   router.get("/users", asyncHandler(async (req, res) => {
 *     const users = await userService.getAll();
 *     res.json({ success: true, data: users });
 *   }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
