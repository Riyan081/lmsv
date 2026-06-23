// PSEUDOCODE PLAN:
// 1) Keep Prisma singleton logic unchanged.
// 2) Replace direct `Bun` reference with a safe `globalThis` lookup.
// 3) Read NODE_ENV from Bun (if present) or process (if present).
// 4) Reuse existing non-production guard for global Prisma caching.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

const nodeEnv =
  (globalThis as any).Bun?.env?.NODE_ENV ??
  (globalThis as any).process?.env?.NODE_ENV;

if (nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;