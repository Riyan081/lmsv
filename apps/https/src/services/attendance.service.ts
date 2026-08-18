import prisma from "@repo/db/client";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import type { MarkAttendanceInput } from "@repo/common/schemas";

/**
 * Attendance service — business logic for marking and querying attendance.
 */
export const attendanceService = {
  /** Mark attendance for a class (bulk) */
  async markAttendance(data: MarkAttendanceInput, markedById: string) {
    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject) throw new NotFoundError("Subject");

    const date = new Date(data.date);

    // Upsert each record (allows re-marking for corrections)
    const results = await prisma.$transaction(
      data.records.map((record: { studentId: string; status: string }) =>
        prisma.attendance.upsert({
          where: {
            studentId_subjectId_date_period: {
              studentId: record.studentId,
              subjectId: data.subjectId,
              date,
              period: data.period,
            },
          },
          create: {
            studentId: record.studentId,
            subjectId: data.subjectId,
            date,
            period: data.period,
            status: record.status as any,
            markedById,
          },
          update: {
            status: record.status as any,
            markedById,
          },
        })
      )
    );

    return {
      totalMarked: results.length,
      present: data.records.filter((r: { status: string }) => r.status === "present").length,
      absent: data.records.filter((r: { status: string }) => r.status === "absent").length,
      late: data.records.filter((r: { status: string }) => r.status === "late").length,
    };
  },

  /** Get attendance records with filters */
  async getAttendance(filters: {
    subjectId?: string;
    studentId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.status) where.status = filters.status;

    if (filters.date) {
      where.date = new Date(filters.date);
    } else if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, enrollmentNo: true } },
          subject: { select: { id: true, name: true, code: true } },
          markedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ date: "desc" }, { period: "asc" }],
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return { records, total, page, limit };
  },

  /** Get attendance summary for a student */
  async getStudentSummary(studentId: string, semesterId?: string) {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, sectionId: true },
    });
    if (!student) throw new NotFoundError("Student");

    // Get all subjects for the student (via their section → faculty_subject mapping)
    const subjectFilter: any = {};
    if (semesterId) {
      subjectFilter.semesterId = semesterId;
    }

    // Get attendance stats per subject
    const subjects = await prisma.subject.findMany({
      where: {
        ...subjectFilter,
        attendances: { some: { studentId } },
      },
      select: { id: true, name: true, code: true, credits: true },
    });

    const summary = await Promise.all(
      subjects.map(async (subject) => {
        const [totalClasses, presentCount, absentCount, lateCount] = await Promise.all([
          prisma.attendance.count({
            where: { studentId, subjectId: subject.id },
          }),
          prisma.attendance.count({
            where: { studentId, subjectId: subject.id, status: "present" },
          }),
          prisma.attendance.count({
            where: { studentId, subjectId: subject.id, status: "absent" },
          }),
          prisma.attendance.count({
            where: { studentId, subjectId: subject.id, status: "late" },
          }),
        ]);

        const percentage = totalClasses > 0
          ? Math.round(((presentCount + lateCount) / totalClasses) * 100 * 100) / 100
          : 0;

        return {
          subject: { id: subject.id, name: subject.name, code: subject.code, credits: subject.credits },
          totalClasses,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          percentage,
          isLow: percentage < 75,
        };
      })
    );

    // Overall
    const totalClasses = summary.reduce((sum, s) => sum + s.totalClasses, 0);
    const totalPresent = summary.reduce((sum, s) => sum + s.present + s.late, 0);
    const overallPercentage = totalClasses > 0
      ? Math.round((totalPresent / totalClasses) * 100 * 100) / 100
      : 0;

    return {
      student: { id: student.id, name: student.name },
      overallPercentage,
      totalClasses,
      totalPresent,
      subjects: summary,
    };
  },

  /** Get students with low attendance (< threshold) for a subject */
  async getLowAttendance(subjectId: string, threshold = 75) {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundError("Subject");

    // Get all students who have attendance for this subject
    const students = await prisma.attendance.groupBy({
      by: ["studentId"],
      where: { subjectId },
      _count: { _all: true },
    });

    const lowAttendance = [];

    for (const entry of students) {
      const presentCount = await prisma.attendance.count({
        where: {
          studentId: entry.studentId,
          subjectId,
          status: { in: ["present", "late"] },
        },
      });

      const percentage = entry._count._all > 0
        ? Math.round((presentCount / entry._count._all) * 100 * 100) / 100
        : 0;

      if (percentage < threshold) {
        const student = await prisma.user.findUnique({
          where: { id: entry.studentId },
          select: { id: true, name: true, enrollmentNo: true, email: true },
        });

        if (student) {
          lowAttendance.push({
            student,
            totalClasses: entry._count._all,
            present: presentCount,
            percentage,
          });
        }
      }
    }

    return lowAttendance.sort((a, b) => a.percentage - b.percentage);
  },
};
