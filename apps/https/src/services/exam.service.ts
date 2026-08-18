import prisma from "@repo/db/client";
import { NotFoundError } from "../utils/errors.js";
import type { CreateExamInput, EnterMarksInput } from "@repo/common/schemas";

export const examService = {
  async create(data: CreateExamInput, createdById: string) {
    return prisma.exam.create({
      data: { ...data, date: new Date(data.date), createdById },
      include: { subject: { select: { name: true, code: true } } },
    });
  },

  async getAll(filters: { subjectId?: string; semesterId?: string; type?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filters;
    const where: any = {};
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.semesterId) where.semesterId = filters.semesterId;
    if (filters.type) where.type = filters.type;

    const [records, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true, code: true } },
          semester: { select: { number: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { results: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.exam.count({ where }),
    ]);
    return { records, total, page, limit };
  },

  async enterMarks(data: EnterMarksInput, createdById: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      include: { subject: true },
    });
    if (!exam) throw new NotFoundError("Exam");

    const results = await prisma.$transaction(
      data.results.map((r: { studentId: string; marksObtained: number; grade?: string }) =>
        prisma.result.upsert({
          where: { studentId_examId: { studentId: r.studentId, examId: data.examId } },
          create: {
            studentId: r.studentId,
            examId: data.examId,
            subjectId: exam.subjectId,
            semesterId: exam.semesterId,
            marksObtained: r.marksObtained,
            grade: (r.grade || this.calculateGrade(r.marksObtained, exam.totalMarks)) as any,
          },
          update: {
            marksObtained: r.marksObtained,
            grade: (r.grade || this.calculateGrade(r.marksObtained, exam.totalMarks)) as any,
          },
        })
      )
    );
    return { totalEntered: results.length, examId: data.examId };
  },

  async update(id: string, data: { name?: string; date?: string; totalMarks?: number }) {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundError("Exam");
    return prisma.exam.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.totalMarks && { totalMarks: data.totalMarks }),
      },
      include: { subject: { select: { name: true, code: true } } },
    });
  },

  async delete(id: string) {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundError("Exam");
    // Delete results first (cascade safety)
    await prisma.result.deleteMany({ where: { examId: id } });
    return prisma.exam.delete({ where: { id } });
  },

  calculateGrade(marks: number, total: number): string {
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  },

  async getStudentResults(studentId: string, semesterId?: string) {
    const where: any = { studentId };
    if (semesterId) where.semesterId = semesterId;

    const results = await prisma.result.findMany({
      where,
      include: {
        exam: { select: { name: true, type: true, totalMarks: true, date: true } },
        subject: { select: { name: true, code: true, credits: true } },
        semester: { select: { number: true } },
      },
      orderBy: [{ semester: { number: "asc" } }, { subject: { name: "asc" } }],
    });

    // Calculate SGPA per semester
    const semesters = new Map<number, { credits: number; gradePoints: number }>();
    for (const r of results) {
      const semNum = r.semester.number;
      if (!semesters.has(semNum)) semesters.set(semNum, { credits: 0, gradePoints: 0 });
      const sem = semesters.get(semNum)!;
      const gp = this.gradeToPoints(r.grade || "F");
      sem.credits += r.subject.credits;
      sem.gradePoints += gp * r.subject.credits;
    }

    const sgpaMap: Record<number, number> = {};
    let totalCredits = 0;
    let totalGradePoints = 0;
    for (const [semNum, data] of semesters) {
      sgpaMap[semNum] = data.credits > 0 ? Math.round((data.gradePoints / data.credits) * 100) / 100 : 0;
      totalCredits += data.credits;
      totalGradePoints += data.gradePoints;
    }

    const cgpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;

    return { results, sgpa: sgpaMap, cgpa };
  },

  gradeToPoints(grade: string): number {
    const map: Record<string, number> = { "A+": 10, A: 9, "B+": 8, B: 7, C: 6, D: 5, F: 0 };
    return map[grade] ?? 0;
  },
};
