import prisma from "@repo/db/client";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import type {
  CreateHostelInput, CreateRoomInput, AllocateRoomInput,
  CreateGatePassInput, CreateComplaintInput,
} from "@repo/common/schemas";

export const hostelService = {
  // ─── Hostel CRUD ──────────────────────────────────────────────
  async createHostel(data: CreateHostelInput) {
    return prisma.hostel.create({ data, include: { warden: { select: { id: true, name: true } } } });
  },

  async getAllHostels() {
    return prisma.hostel.findMany({
      include: {
        warden: { select: { id: true, name: true } },
        rooms: { select: { id: true, roomNumber: true, floor: true, capacity: true } },
        _count: { select: { rooms: true } },
      },
    });
  },

  // ─── Rooms ────────────────────────────────────────────────────
  async createRoom(data: CreateRoomInput) {
    return prisma.hostelRoom.create({ data });
  },

  async getRooms(hostelId: string) {
    return prisma.hostelRoom.findMany({
      where: { hostelId },
      include: {
        allocations: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                enrollmentNo: true,
                email: true,
                batch: { select: { id: true, name: true, startYear: true, endYear: true } },
                department: { select: { id: true, name: true, code: true } },
                section: { select: { id: true, name: true } },
              },
            },
          },
        },
        _count: { select: { allocations: { where: { isActive: true } } } },
      },
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
    });
  },

  // ─── Allocation ───────────────────────────────────────────────
  async allocateRoom(data: AllocateRoomInput) {
    const room = await prisma.hostelRoom.findUnique({
      where: { id: data.roomId },
      include: { _count: { select: { allocations: { where: { isActive: true } } } } },
    });
    if (!room) throw new NotFoundError("Room");
    if (room._count.allocations >= room.capacity) throw new BadRequestError("Room is at full capacity");

    // Find student by ID, enrollment number, or email
    const studentUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: data.studentId },
          { enrollmentNo: data.studentId },
          { email: data.studentId },
        ],
        role: "student",
      },
    });
    if (!studentUser) throw new NotFoundError("Student (enter a valid Student ID, Enrollment No, or Email)");

    // Check if student already has active allocation
    const existing = await prisma.hostelAllocation.findFirst({
      where: { studentId: studentUser.id, isActive: true },
    });
    if (existing) throw new BadRequestError("Student already has an active room allocation");

    return prisma.hostelAllocation.create({
      data: {
        roomId: data.roomId,
        studentId: studentUser.id,
        allocatedDate: new Date(data.allocatedDate),
      },
      include: { student: { select: { id: true, name: true, enrollmentNo: true } }, room: true },
    });
  },

  async vacateRoom(allocationId: string) {
    const allocation = await prisma.hostelAllocation.findUnique({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundError("Allocation");
    return prisma.hostelAllocation.update({
      where: { id: allocationId },
      data: { isActive: false, vacatedDate: new Date() },
    });
  },

  // ─── Gate Pass ────────────────────────────────────────────────
  async createGatePass(studentId: string, data: CreateGatePassInput) {
    return prisma.gatePass.create({
      data: {
        studentId,
        reason: data.reason,
        outDate: new Date(data.outDate),
        outTime: data.outTime,
        expectedReturnDate: new Date(data.expectedReturnDate),
      },
    });
  },

  async getGatePasses(filters: { studentId?: string; status?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filters;
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.status) where.status = filters.status;

    const [records, total] = await Promise.all([
      prisma.gatePass.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, enrollmentNo: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gatePass.count({ where }),
    ]);
    return { records, total, page, limit };
  },

  async updateGatePassStatus(id: string, status: string, approvedById: string) {
    const gatePass = await prisma.gatePass.findUnique({ where: { id } });
    if (!gatePass) throw new NotFoundError("Gate pass");
    return prisma.gatePass.update({
      where: { id },
      data: { status: status as any, approvedById },
      include: { student: { select: { id: true, name: true } } },
    });
  },

  // ─── Complaints ───────────────────────────────────────────────
  async createComplaint(studentId: string, data: CreateComplaintInput) {
    return prisma.hostelComplaint.create({ data: { ...data, studentId } });
  },

  async getComplaints(filters: { studentId?: string; status?: string; hostelId?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filters;
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.status) where.status = filters.status;
    if (filters.hostelId) where.room = { hostelId: filters.hostelId };

    const [records, total] = await Promise.all([
      prisma.hostelComplaint.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, enrollmentNo: true } },
          room: { select: { roomNumber: true, hostel: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.hostelComplaint.count({ where }),
    ]);
    return { records, total, page, limit };
  },

  async updateComplaintStatus(id: string, status: string) {
    const complaint = await prisma.hostelComplaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundError("Complaint");
    return prisma.hostelComplaint.update({ where: { id }, data: { status: status as any } });
  },
};
