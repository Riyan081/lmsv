import prisma from "@repo/db/client";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import type { CreateLeaveInput, UpdateLeaveStatusInput } from "@repo/common/schemas";

export const leaveService = {
  async create(userId: string, data: CreateLeaveInput) {
    return prisma.leaveApplication.create({
      data: {
        userId,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        attachmentUrl: data.attachmentUrl,
      },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
  },

  async getAll(filters: {
    userId?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20 } = filters;
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [records, total] = await Promise.all([
      prisma.leaveApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              enrollmentNo: true,
              employeeId: true,
              department: { select: { id: true, name: true, code: true } },
              batch: { select: { id: true, name: true } },
              section: { select: { id: true, name: true } },
            },
          },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leaveApplication.count({ where }),
    ]);

    return { records, total, page, limit };
  },

  async getById(id: string) {
    const leave = await prisma.leaveApplication.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, role: true, email: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    if (!leave) throw new NotFoundError("Leave application");
    return leave;
  },

  async updateStatus(id: string, approvedById: string, data: UpdateLeaveStatusInput) {
    const leave = await this.getById(id);
    if (leave.status !== "pending") {
      throw new ForbiddenError("Leave application has already been processed");
    }

    return prisma.leaveApplication.update({
      where: { id },
      data: {
        status: data.status,
        approvedById,
        approverNote: data.approverNote,
      },
      include: {
        user: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  },

  async getMyLeaves(userId: string, page = 1, limit = 20) {
    const [records, total] = await Promise.all([
      prisma.leaveApplication.findMany({
        where: { userId },
        include: { approvedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leaveApplication.count({ where: { userId } }),
    ]);
    return { records, total, page, limit };
  },
};
