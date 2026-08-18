import prisma from "@repo/db/client";

/**
 * Activity log service — query and filter activity logs.
 */
export const activityLogService = {
  async getAll(filters: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 50 } = filters;
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.module) where.module = filters.module;
    if (filters.action) where.action = filters.action;
    if (filters.search) {
      where.description = { contains: filters.search, mode: "insensitive" };
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [records, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, role: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { records, total, page, limit };
  },

  async getRecent(count = 50) {
    return prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: count,
    });
  },

  async getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const [todayCount, weekCount, totalCount, moduleBreakdown] = await Promise.all([
      prisma.activityLog.count({ where: { createdAt: { gte: today } } }),
      prisma.activityLog.count({ where: { createdAt: { gte: thisWeek } } }),
      prisma.activityLog.count(),
      prisma.activityLog.groupBy({
        by: ["module"],
        _count: { _all: true },
        orderBy: { _count: { module: "desc" } },
      }),
    ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      total: totalCount,
      byModule: moduleBreakdown.map((m) => ({ module: m.module, count: m._count._all })),
    };
  },
};
