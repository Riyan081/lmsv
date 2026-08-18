import prisma from "@repo/db/client";
import { NotFoundError } from "../utils/errors.js";
import type { CreateBatchInput, UpdateBatchInput } from "@repo/common/schemas";

export const batchService = {
  async getAll() {
    return prisma.batch.findMany({
      include: {
        program: { include: { department: { select: { id: true, name: true, code: true } } } },
        sections: { orderBy: { name: "asc" } },
        _count: { select: { sections: true } },
      },
      orderBy: [{ startYear: "desc" }, { program: { name: "asc" } }],
    });
  },

  async getById(id: string) {
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        program: { include: { department: true } },
        sections: { include: { _count: { select: { users: true } } }, orderBy: { name: "asc" } },
      },
    });
    if (!batch) throw new NotFoundError("Batch");
    return batch;
  },

  async create(data: CreateBatchInput) {
    return prisma.batch.create({ data });
  },

  async update(id: string, data: UpdateBatchInput) {
    await this.getById(id);
    return prisma.batch.update({ where: { id }, data });
  },

  async delete(id: string) {
    await this.getById(id);
    return prisma.batch.delete({ where: { id } });
  },

  async createSection(data: { name: string; batchId: string }) {
    return prisma.section.create({ data });
  },
};
