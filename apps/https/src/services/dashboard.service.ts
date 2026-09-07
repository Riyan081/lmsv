import prisma from "@repo/db/client";

/**
 * Dashboard service — aggregated stats for admin, faculty, and student dashboards.
 */
export const dashboardService = {
  async getAdminDashboard() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalStudents, totalFaculty, totalDepartments, totalSubjects,
      pendingLeaves, todayAttendanceCount, totalAttendanceToday,
      recentActivity, upcomingEvents, announcements,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "faculty" } }),
      prisma.department.count(),
      prisma.subject.count(),
      prisma.leaveApplication.count({ where: { status: "pending" } }),
      prisma.attendance.count({ where: { date: today, status: { in: ["present", "late"] } } }),
      prisma.attendance.count({ where: { date: today } }),
      prisma.activityLog.findMany({
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.academicEvent.findMany({
        where: { startDate: { gte: today } },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
      prisma.announcement.findMany({
        where: { type: "global" },
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const todayAttendancePercent = totalAttendanceToday > 0
      ? Math.round((todayAttendanceCount / totalAttendanceToday) * 100)
      : 0;

    return {
      stats: {
        totalStudents, totalFaculty, totalDepartments, totalSubjects,
        pendingLeaves, todayAttendancePercent,
      },
      recentActivity,
      upcomingEvents,
      announcements,
    };
  },

  async getFacultyDashboard(facultyId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = (now.getDay() + 6) % 7; // Convert to Mon=0

    const [todaySchedule, mySubjects, pendingLeaves, myActivity] = await Promise.all([
      prisma.timetableSlot.findMany({
        where: { facultyId, dayOfWeek },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          section: {
            select: {
              id: true,
              name: true,
              batch: { select: { id: true, name: true, program: { select: { code: true } } } },
            },
          },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.facultySubject.findMany({
        where: { facultyId },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          section: {
            select: {
              id: true,
              name: true,
              batch: { select: { id: true, name: true, program: { select: { code: true } } } },
            },
          },
          semester: { select: { id: true, number: true } },
        },
      }),
      prisma.leaveApplication.count({
        where: { status: "pending" },
      }),
      prisma.activityLog.findMany({
        where: { userId: facultyId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return { todaySchedule, mySubjects, pendingLeaves, myActivity };
  },

  async getStudentDashboard(studentId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { sectionId: true, departmentId: true },
    });

    const dayOfWeek = (now.getDay() + 6) % 7;

    const [todaySchedule, myLeaves, recentResults, announcements] = await Promise.all([
      student?.sectionId
        ? prisma.timetableSlot.findMany({
            where: { sectionId: student.sectionId, dayOfWeek },
            include: {
              subject: { select: { name: true, code: true } },
              faculty: { select: { name: true } },
            },
            orderBy: { startTime: "asc" },
          })
        : [],
      prisma.leaveApplication.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.result.findMany({
        where: { studentId },
        include: {
          exam: { select: { name: true, totalMarks: true } },
          subject: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.announcement.findMany({
        where: {
          OR: [
            { type: "global" },
            ...(student?.departmentId ? [{ type: "department" as const, targetId: student.departmentId }] : []),
            ...(student?.sectionId ? [{ type: "class" as const, targetId: student.sectionId }] : []),
          ],
        },
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return { todaySchedule, myLeaves, recentResults, announcements };
  },

  async getWardenDashboard(wardenId: string) {
    const [
      myHostels,
      pendingGatePasses,
      openComplaints,
      recentComplaints,
      recentGatePasses,
    ] = await Promise.all([
      prisma.hostel.findMany({
        where: { wardenId },
        include: {
          _count: { select: { rooms: true } },
        },
      }),
      prisma.gatePass.count({ where: { status: "pending" } }),
      prisma.hostelComplaint.count({ where: { status: { in: ["open", "in_progress"] } } }),
      prisma.hostelComplaint.findMany({
        where: { status: { in: ["open", "in_progress"] } },
        include: {
          student: { select: { name: true, enrollmentNo: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.gatePass.findMany({
        where: { status: "pending" },
        include: {
          student: { select: { name: true, enrollmentNo: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const totalRooms = myHostels.reduce((sum, h) => sum + h._count.rooms, 0);

    return {
      stats: {
        totalHostels: myHostels.length,
        totalRooms,
        pendingGatePasses,
        openComplaints,
      },
      myHostels,
      recentComplaints,
      recentGatePasses,
    };
  },
};
