import prisma from "@repo/db/client";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import type { CreateTimetableSlotInput, BulkCreateTimetableInput } from "@repo/common/schemas";

export const timetableService = {
  /** Admin: get all timetable slots */
  async getAll() {
    return prisma.timetableSlot.findMany({
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: { select: { id: true, name: true } },
        section: {
          select: {
            id: true, name: true,
            batch: { select: { name: true, program: { select: { name: true, code: true } } } },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  },

  async getBySection(sectionId: string, semesterId?: string) {
    const where: any = { sectionId };
    if (semesterId) where.semesterId = semesterId;
    return prisma.timetableSlot.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: { select: { id: true, name: true } },
        section: {
          select: {
            id: true,
            name: true,
            batch: { select: { name: true, program: { select: { name: true, code: true } } } },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  },

  async getByFaculty(facultyId: string, semesterId?: string) {
    const where: any = { facultyId };
    if (semesterId) where.semesterId = semesterId;

    return prisma.timetableSlot.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        section: {
          select: { id: true, name: true, batch: { select: { name: true, program: { select: { name: true } } } } },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  },

  async createSlot(data: CreateTimetableSlotInput) {
    // Check for faculty conflict
    const facultyConflict = await prisma.timetableSlot.findFirst({
      where: {
        facultyId: data.facultyId,
        semesterId: data.semesterId,
        dayOfWeek: data.dayOfWeek,
        OR: [
          { startTime: { lt: data.endTime }, endTime: { gt: data.startTime } },
        ],
      },
    });
    if (facultyConflict) throw new ConflictError("Faculty has a conflicting slot at this time");

    // Check for room conflict
    if (data.room) {
      const roomConflict = await prisma.timetableSlot.findFirst({
        where: {
          room: data.room,
          semesterId: data.semesterId,
          dayOfWeek: data.dayOfWeek,
          OR: [
            { startTime: { lt: data.endTime }, endTime: { gt: data.startTime } },
          ],
        },
      });
      if (roomConflict) throw new ConflictError(`Room "${data.room}" is already booked at this time`);
    }

    return prisma.timetableSlot.create({
      data,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: { select: { id: true, name: true } },
      },
    });
  },

  async bulkCreate(data: BulkCreateTimetableInput) {
    const results = [];
    for (const slot of data.slots) {
      const created = await this.createSlot({
        ...slot,
        sectionId: data.sectionId,
        semesterId: data.semesterId,
      });
      results.push(created);
    }
    return results;
  },

  async updateSlot(id: string, data: Partial<CreateTimetableSlotInput>) {
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundError("Timetable slot");
    return prisma.timetableSlot.update({ where: { id }, data });
  },

  async deleteSlot(id: string) {
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundError("Timetable slot");
    return prisma.timetableSlot.delete({ where: { id } });
  },

  async clearSection(sectionId: string, semesterId: string) {
    return prisma.timetableSlot.deleteMany({ where: { sectionId, semesterId } });
  },
};
