import prisma from "@repo/db/client";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@repo/common/schemas";

/**
 * Department service — business logic for department CRUD.
 */
export const departmentService = {
  /** Get all departments with counts */
  async getAll() {
    return prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            programs: true,
            subjects: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  /** Get a single department by ID */
  async getById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        programs: {
          include: {
            batches: {
              include: {
                sections: true,
              },
            },
            semesters: {
              orderBy: { number: "asc" },
            },
          },
        },
        _count: {
          select: { users: true, subjects: true },
        },
      },
    });

    if (!department) throw new NotFoundError("Department");
    return department;
  },

  /** Create a new department */
  async create(data: CreateDepartmentInput) {
    const existing = await prisma.department.findUnique({
      where: { code: data.code },
    });
    if (existing) throw new ConflictError(`Department with code "${data.code}" already exists`);

    return prisma.department.create({ data });
  },

  /** Update a department */
  async update(id: string, data: UpdateDepartmentInput) {
    await this.getById(id); // Throws NotFoundError if missing
    return prisma.department.update({
      where: { id },
      data,
    });
  },

  /** Delete a department */
  async delete(id: string) {
    await this.getById(id);
    return prisma.department.delete({ where: { id } });
  },
};
