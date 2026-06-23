/**
 * Re-export auth middleware from the shared auth package.
 *
 * This keeps imports clean within the https app:
 *   import { requireAuth, requireRole } from "../middleware";
 */
export { requireAuth, requireRole } from "@repo/auth/middleware";
