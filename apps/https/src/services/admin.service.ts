import prisma from "@repo/db/client";

export const adminService = {
  /**
   * Get admin dashboard stats.
   */
  async getStats() {
    const [totalUsers, activeSessions] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
    ]);

    return { totalUsers, activeSessions };
  },
};
