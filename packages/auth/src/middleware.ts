/**
 * Auth middleware helpers for Express and Next.js.
 *
 * This file re-imports auth from the same package source.
 * Since the auth package is consumed as source (.ts) by the monorepo apps,
 * we import from the package itself rather than a relative path.
 */
import { auth } from "@repo/auth/server";
import { fromNodeHeaders } from "better-auth/node";

/**
 * Express middleware: require authenticated session.
 *
 * Attaches `req.user` and `req.session` on success.
 * Returns 401 if not authenticated.
 */
export async function requireAuth(
  req: any,
  res: any,
  next: any
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized — no valid session" });
      return;
    }

    // Attach session data to request for downstream handlers
    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    res.status(401).json({ error: "Unauthorized — session validation failed" });
  }
}

/**
 * Express middleware: require a specific role.
 *
 * Must be used AFTER `requireAuth`.
 *
 * Usage:
 *   app.get("/admin/users", requireAuth, requireRole("admin"), handler);
 *   app.get("/premium", requireAuth, requireRole("premium", "admin"), handler);
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: any, res: any, next: any): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Unauthorized — no user in request" });
      return;
    }

    const userRole = user.role || "user";

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Forbidden — requires one of: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
}

/**
 * Helper for Next.js Server Components / Route Handlers.
 *
 * Usage (in a server component or route handler):
 *   import { headers } from "next/headers";
 *   import { getServerSession } from "@repo/auth/middleware";
 *
 *   const session = await getServerSession(await headers());
 *   if (!session) redirect("/sign-in");
 */
export async function getServerSession(headers: Headers) {
  return auth.api.getSession({
    headers,
  });
}
