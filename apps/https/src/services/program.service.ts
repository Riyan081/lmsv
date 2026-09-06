import prisma from "@repo/db/client";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import type { CreateProgramInput, UpdateProgramInput } from "@repo/common/schemas";

export const programService = {
  async getAll() {
    return prisma.program.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        semesters: { select: { id: true, number: true }, orderBy: { number: "asc" } },
        _count: { select: { batches: true, semesters: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  async getById(id: string) {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        department: true,
        batches: { include: { sections: true }, orderBy: { startYear: "desc" } },
        semesters: { orderBy: { number: "asc" } },
      },
    });
    if (!program) throw new NotFoundError("Program");
    return program;
  },

  async create(data: CreateProgramInput) {
    const existing = await prisma.program.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictError(`Program with code "${data.code}" already exists`);
    return prisma.program.create({ data });
  },

  async update(id: string, data: UpdateProgramInput) {
    await this.getById(id);
    return prisma.program.update({ where: { id }, data });
  },

  async delete(id: string) {
    await this.getById(id);
    return prisma.program.delete({ where: { id } });
  },
};
