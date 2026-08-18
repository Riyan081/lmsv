import prisma from "@repo/db/client";
import { auth } from "@repo/auth/server";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors.js";

export const userManagementService = {
  /** List users by role, with optional filters */
  async listByRole(role: string, filters?: { sectionId?: string; batchId?: string }) {
    const where: any = { role };
    if (filters?.sectionId) where.sectionId = filters.sectionId;
    if (filters?.batchId) where.batchId = filters.batchId;
    return prisma.user.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        batch: { select: { id: true, name: true, program: { select: { name: true, code: true } } } },
        section: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  /** Get a single user */
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        batch: { include: { program: true } },
        section: true,
      },
    });
    if (!user) throw new NotFoundError("User");
    return user;
  },

  /**
   * Create a new user via Better Auth's signUpEmail API.
   * This ensures the password is hashed correctly.
   * Then update with LMS-specific fields.
   */
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    gender?: string;
    enrollmentNo?: string;
    employeeId?: string;
    guardianName?: string;
    guardianPhone?: string;
    departmentId?: string;
    batchId?: string;
    sectionId?: string;
  }) {
    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError(`User with email "${data.email}" already exists`);

    // Create via Better Auth API — handles password hashing
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    if (!result?.user) throw new BadRequestError("Failed to create user account");

    // Update with LMS fields
    const user = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: data.role,
        phone: data.phone || null,
        gender: data.gender as any || null,
        enrollmentNo: data.enrollmentNo || null,
        employeeId: data.employeeId || null,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        departmentId: data.departmentId || null,
        batchId: data.batchId || null,
        sectionId: data.sectionId || null,
        emailVerified: true,
      },
    });

    return user;
  },

  /** Update user profile fields */
  async updateUser(id: string, data: Record<string, any>) {
    await this.getById(id);
    // Strip fields that shouldn't be updated directly
    const { email, password, ...updateData } = data;
    return prisma.user.update({ where: { id }, data: updateData });
  },

  /** Delete a user and their accounts */
  async deleteUser(id: string) {
    await this.getById(id);
    // Delete accounts first (Better Auth records)
    await prisma.account.deleteMany({ where: { userId: id } });
    await prisma.session.deleteMany({ where: { userId: id } });
    return prisma.user.delete({ where: { id } });
  },
};
