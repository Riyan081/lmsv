import prisma from "@repo/db/client";
import { NotFoundError } from "../utils/errors.js";
import type { CreateEventInput, UpdateEventInput } from "@repo/common/schemas";

export const calendarService = {
  async create(data: CreateEventInput, createdById: string) {
    return prisma.academicEvent.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdById,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  },

  async getAll(filters: {
    startDate?: string; endDate?: string; type?: string;
    departmentId?: string; month?: string; page?: number; limit?: number;
  }) {
    const { page = 1, limit = 50 } = filters;
    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.departmentId) {
      where.OR = [{ departmentId: filters.departmentId }, { departmentId: null }];
    }

    if (filters.month) {
      const [year, monthNum] = filters.month.split("-").map(Number);
      where.startDate = { lte: new Date(year!, monthNum!, 0) };
      where.endDate = { gte: new Date(year!, monthNum! - 1, 1) };
    } else if (filters.startDate || filters.endDate) {
      if (filters.startDate) where.endDate = { gte: new Date(filters.startDate) };
      if (filters.endDate) where.startDate = { lte: new Date(filters.endDate) };
    }

    const [records, total] = await Promise.all([
      prisma.academicEvent.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { startDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.academicEvent.count({ where }),
    ]);
    return { records, total, page, limit };
  },

  async update(id: string, data: UpdateEventInput) {
    const event = await prisma.academicEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundError("Academic event");

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return prisma.academicEvent.update({ where: { id }, data: updateData });
  },

  async delete(id: string) {
    const event = await prisma.academicEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundError("Academic event");
    return prisma.academicEvent.delete({ where: { id } });
  },
};
