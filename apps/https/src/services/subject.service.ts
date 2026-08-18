import prisma from "@repo/db/client";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import type { CreateSubjectInput, UpdateSubjectInput } from "@repo/common/schemas";

export const subjectService = {
  async getAll() {
    return prisma.subject.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, number: true, program: { select: { name: true, code: true } } } },
        _count: { select: { facultySubjects: true } },
      },
      orderBy: [{ department: { name: "asc" } }, { code: "asc" }],
    });
  },

  async getById(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        department: true,
        semester: { include: { program: true } },
        facultySubjects: { include: { faculty: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!subject) throw new NotFoundError("Subject");
    return subject;
  },

  async create(data: CreateSubjectInput) {
    const existing = await prisma.subject.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictError(`Subject with code "${data.code}" already exists`);
    return prisma.subject.create({ data });
  },

  async update(id: string, data: UpdateSubjectInput) {
    await this.getById(id);
    return prisma.subject.update({ where: { id }, data });
  },

  async delete(id: string) {
    await this.getById(id);
    return prisma.subject.delete({ where: { id } });
  },
};
