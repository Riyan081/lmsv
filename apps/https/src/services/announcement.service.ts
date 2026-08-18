import prisma from "@repo/db/client";
import { NotFoundError } from "../utils/errors.js";
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from "@repo/common/schemas";

export const announcementService = {
  async create(data: CreateAnnouncementInput, createdById: string) {
    return prisma.announcement.create({
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        createdById,
      },
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });
  },

  async getAll(filters: { type?: string; targetId?: string; isPinned?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filters;
    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.targetId) where.targetId = filters.targetId;
    if (filters.isPinned) where.isPinned = filters.isPinned === "true";

    // Don't show scheduled announcements that haven't been published yet
    where.OR = [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }];

    const [records, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: { createdBy: { select: { id: true, name: true, role: true } } },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.announcement.count({ where }),
    ]);
    return { records, total, page, limit };
  },

  async getForUser(userId: string, userRole: string, departmentId?: string, sectionId?: string, page = 1, limit = 20) {
    const conditions: any[] = [{ type: "global" }];
    if (departmentId) conditions.push({ type: "department", targetId: departmentId });
    if (sectionId) conditions.push({ type: "class", targetId: sectionId });

    const where: any = {
      OR: conditions,
      AND: [{ OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] }],
    };

    const [records, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.announcement.count({ where }),
    ]);
    return { records, total, page, limit };
  },

  async update(id: string, data: UpdateAnnouncementInput) {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Announcement");
    return prisma.announcement.update({
      where: { id },
      data: { ...data, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : data.scheduledAt },
    });
  },

  async delete(id: string) {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Announcement");
    return prisma.announcement.delete({ where: { id } });
  },
};
