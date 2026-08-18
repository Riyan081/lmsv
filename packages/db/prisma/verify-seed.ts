/**
 * COMPREHENSIVE seed verification — checks DB integrity + API endpoints
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const API = "http://localhost:3001/api";
let SESSION_TOKEN = "";

async function login(email: string, password: string) {
  const res = await fetch("http://localhost:3001/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json() as any;
  SESSION_TOKEN = data?.token || "";
  return data;
}

async function apiGet(path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${SESSION_TOKEN}`, Origin: "http://localhost:3000" },
  });
  return res.json() as any;
}

function check(label: string, ok: boolean, detail?: string) {
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function verify() {
  let pass = 0, fail = 0;
  const track = (ok: boolean) => ok ? pass++ : fail++;

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🔍 COMPREHENSIVE SEED VERIFICATION");
  console.log("═══════════════════════════════════════════════════════════\n");

  // ═══════════════════════════════════════════════════════════════
  // PART 1: DATABASE INTEGRITY CHECKS
  // ═══════════════════════════════════════════════════════════════
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  PART 1: DATABASE INTEGRITY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // --- Table counts ---
  console.log("📊 TABLE COUNTS:");
  const tables: [string, Promise<number>, number][] = [
    ["departments", prisma.department.count(), 5],
    ["programs", prisma.program.count(), 5],
    ["batches", prisma.batch.count(), 6],
    ["sections", prisma.section.count(), 7],
    ["semesters", prisma.semester.count(), 40],
    ["subjects", prisma.subject.count(), 24],
    ["users", prisma.user.count(), 48],
    ["accounts (auth)", prisma.account.count(), 48],
    ["facultySubjects", prisma.facultySubject.count(), 27],
    ["timetableSlots", prisma.timetableSlot.count(), 48],
    ["attendance", prisma.attendance.count(), 1056],
    ["leaveApplications", prisma.leaveApplication.count(), 16],
    ["exams", prisma.exam.count(), 16],
    ["results", prisma.result.count(), 78],
    ["hostels", prisma.hostel.count(), 4],
    ["hostelRooms", prisma.hostelRoom.count(), 60],
    ["hostelAllocations", prisma.hostelAllocation.count(), 32],
    ["gatePasses", prisma.gatePass.count(), 12],
    ["hostelComplaints", prisma.hostelComplaint.count(), 12],
    ["announcements", prisma.announcement.count(), 15],
    ["academicEvents", prisma.academicEvent.count(), 20],
    ["activityLogs", prisma.activityLog.count(), 35],
  ];
  for (const [name, countP, expected] of tables) {
    const actual = await countP;
    track(check(name.padEnd(22), actual >= expected, `${actual} (expected ≥ ${expected})`));
  }

  // --- User roles ---
  console.log("\n👥 USER ROLES:");
  const byRole = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  const roleMap: Record<string, number> = {};
  byRole.forEach(r => roleMap[r.role] = r._count._all);
  track(check("admins", roleMap["admin"] === 2, `${roleMap["admin"]}`));
  track(check("faculty", roleMap["faculty"] === 12, `${roleMap["faculty"]}`));
  track(check("students", roleMap["student"] === 32, `${roleMap["student"]}`));
  track(check("wardens", roleMap["warden"] === 2, `${roleMap["warden"]}`));

  // --- All students have dept+batch+section ---
  console.log("\n🔗 STUDENT RELATIONS:");
  const stuNoRelations = await prisma.user.findMany({
    where: { role: "student", OR: [{ departmentId: null }, { batchId: null }, { sectionId: null }] },
    select: { email: true, departmentId: true, batchId: true, sectionId: true },
  });
  track(check("All students have dept+batch+section", stuNoRelations.length === 0,
    stuNoRelations.length > 0 ? `MISSING: ${stuNoRelations.map(s => s.email).join(", ")}` : "32/32"));

  // All students have enrollmentNo
  const stuNoEnroll = await prisma.user.count({ where: { role: "student", enrollmentNo: null } });
  track(check("All students have enrollmentNo", stuNoEnroll === 0, `${32 - stuNoEnroll}/32`));

  // All students have guardianName
  const stuNoGuardian = await prisma.user.count({ where: { role: "student", guardianName: null } });
  track(check("All students have guardian info", stuNoGuardian === 0, `${32 - stuNoGuardian}/32`));

  // --- Faculty relations ---
  console.log("\n🔗 FACULTY RELATIONS:");
  const facNoDept = await prisma.user.count({ where: { role: "faculty", departmentId: null } });
  track(check("All faculty have department", facNoDept === 0, `${12 - facNoDept}/12`));

  const facNoEmpId = await prisma.user.count({ where: { role: "faculty", employeeId: null } });
  track(check("All faculty have employeeId", facNoEmpId === 0, `${12 - facNoEmpId}/12`));

  // --- All emails verified ---
  console.log("\n🔐 AUTH CHECKS:");
  const unverified = await prisma.user.count({ where: { emailVerified: false } });
  track(check("All emails verified", unverified === 0, `${48 - unverified}/48`));

  // All accounts have password hash
  const noPassword = await prisma.account.count({ where: { providerId: "credential", password: null } });
  track(check("All accounts have password", noPassword === 0, `${48 - noPassword}/48 have hash`));

  // --- Timetable relations ---
  console.log("\n🗓️ TIMETABLE RELATION CHECKS:");
  // All timetable slots have valid relations
  const ttSlots = await prisma.timetableSlot.findMany({
    include: { subject: { select: { code: true } }, faculty: { select: { email: true } }, section: { select: { name: true } }, semester: { select: { number: true } } },
  });
  const ttInvalid = ttSlots.filter(t => !t.subject || !t.faculty || !t.section || !t.semester);
  track(check("All slots have valid subject", ttInvalid.length === 0, `${48 - ttInvalid.length}/48`));
  
  // Check faculty teaching subjects are in their department
  const ttFaculty = await prisma.timetableSlot.findMany({
    include: {
      faculty: { select: { email: true, departmentId: true } },
      subject: { select: { code: true, departmentId: true } },
    },
  });
  const crossDept = ttFaculty.filter(t => t.faculty.departmentId !== t.subject.departmentId);
  track(check("Faculty teach in their dept", crossDept.length === 0,
    crossDept.length > 0 ? `CROSS-DEPT: ${crossDept.map(t => `${t.faculty.email}->${t.subject.code}`).join(", ")}` : "all matched"));

  // --- Attendance relation checks ---
  console.log("\n✅ ATTENDANCE RELATION CHECKS:");
  // All attendance records have valid student (role=student)
  const attWithRoles = await prisma.attendance.findMany({
    include: { student: { select: { role: true, email: true } } },
    take: 100,
  });
  const attNonStudent = attWithRoles.filter(a => a.student.role !== "student");
  track(check("Attendance students are role=student", attNonStudent.length === 0,
    attNonStudent.length > 0 ? `WRONG ROLE: ${attNonStudent.map(a => a.student.email).join(", ")}` : "100 sampled OK"));

  // All attendance markedBy is faculty
  const attWithMarkers = await prisma.attendance.findMany({
    include: { markedBy: { select: { role: true, email: true } } },
    take: 100,
  });
  const attNonFac = attWithMarkers.filter(a => a.markedBy.role !== "faculty");
  track(check("Attendance markedBy is faculty", attNonFac.length === 0,
    attNonFac.length > 0 ? `WRONG ROLE: ${attNonFac.map(a => a.markedBy.email).join(", ")}` : "100 sampled OK"));

  // --- Exam/Result relations ---
  console.log("\n📝 EXAM/RESULT CHECKS:");
  const results = await prisma.result.findMany({
    include: {
      student: { select: { role: true } },
      exam: { select: { totalMarks: true } },
    },
  });
  const resNonStudent = results.filter(r => r.student.role !== "student");
  track(check("Results are for students only", resNonStudent.length === 0, `${results.length} results checked`));

  const resOverMax = results.filter(r => r.marksObtained > r.exam.totalMarks);
  track(check("No marks exceed totalMarks", resOverMax.length === 0,
    resOverMax.length > 0 ? `${resOverMax.length} results exceed max` : `${results.length} results OK`));

  const resNegative = results.filter(r => r.marksObtained < 0);
  track(check("No negative marks", resNegative.length === 0, `${results.length} results OK`));

  const resNoGrade = results.filter(r => r.grade === null);
  track(check("All results have grades", resNoGrade.length === 0, `${results.length - resNoGrade.length}/${results.length}`));

  // --- Hostel relations ---
  console.log("\n🏠 HOSTEL CHECKS:");
  // Hostels have wardens
  const hostelsNoWarden = await prisma.hostel.count({ where: { wardenId: null } });
  track(check("All hostels have wardens", hostelsNoWarden === 0, `${4 - hostelsNoWarden}/4`));

  // All allocations reference valid students and rooms
  const allocations = await prisma.hostelAllocation.findMany({
    include: {
      student: { select: { role: true, gender: true, email: true } },
      room: { include: { hostel: { select: { type: true, name: true } } } },
    },
    where: { isActive: true },
  });
  const allocNonStudent = allocations.filter(a => a.student.role !== "student");
  track(check("Allocations are for students", allocNonStudent.length === 0, `${allocations.length} checked`));

  // Gender-hostel match
  const genderMismatch = allocations.filter(a => {
    if (a.student.gender === "male" && a.room.hostel.type !== "boys") return true;
    if (a.student.gender === "female" && a.room.hostel.type !== "girls") return true;
    return false;
  });
  track(check("Gender matches hostel type", genderMismatch.length === 0,
    genderMismatch.length > 0 ? `MISMATCH: ${genderMismatch.map(a => `${a.student.email} in ${a.room.hostel.name}`).join(", ")}` : `${allocations.length} allocations OK`));

  // Room capacity not exceeded
  const roomOccupancy = await prisma.hostelAllocation.groupBy({
    by: ["roomId"], _count: { _all: true }, where: { isActive: true },
  });
  const roomsData = await prisma.hostelRoom.findMany({ select: { id: true, capacity: true, roomNumber: true } });
  const roomCapMap: Record<string, { capacity: number; roomNumber: string }> = {};
  roomsData.forEach(r => roomCapMap[r.id] = { capacity: r.capacity, roomNumber: r.roomNumber });
  const overCapacity = roomOccupancy.filter(r => r._count._all > (roomCapMap[r.roomId]?.capacity || 0));
  track(check("No rooms over capacity", overCapacity.length === 0,
    overCapacity.length > 0 ? `OVER: ${overCapacity.map(r => `Room ${roomCapMap[r.roomId]?.roomNumber} (${r._count._all}/${roomCapMap[r.roomId]?.capacity})`).join(", ")}` : `all rooms OK`));

  // --- Gate pass relations ---
  console.log("\n🚶 GATE PASS CHECKS:");
  const gps = await prisma.gatePass.findMany({
    include: { student: { select: { role: true } }, approvedBy: { select: { role: true } } },
  });
  const gpNonStudent = gps.filter(g => g.student.role !== "student");
  track(check("Gate passes are for students", gpNonStudent.length === 0, `${gps.length} checked`));

  const gpApprovedNoApprover = gps.filter(g => g.status === "approved" && !g.approvedBy);
  track(check("Approved passes have approver", gpApprovedNoApprover.length === 0, `${gps.length} checked`));

  const gpPendingWithApprover = gps.filter(g => g.status === "pending" && g.approvedBy);
  track(check("Pending passes have no approver", gpPendingWithApprover.length === 0, `${gps.length} checked`));

  // --- Leave relations ---
  console.log("\n📋 LEAVE CHECKS:");
  const leaves = await prisma.leaveApplication.findMany({
    include: { user: { select: { role: true } }, approvedBy: { select: { role: true } } },
  });
  const leaveApprovedNoApprover = leaves.filter(l => l.status === "approved" && !l.approvedBy);
  track(check("Approved leaves have approver", leaveApprovedNoApprover.length === 0, `${leaves.length} checked`));

  const leaveDateInvalid = leaves.filter(l => l.startDate > l.endDate);
  track(check("Leave start ≤ end date", leaveDateInvalid.length === 0, `${leaves.length} checked`));

  // --- Announcement checks ---
  console.log("\n📢 ANNOUNCEMENT CHECKS:");
  const anns = await prisma.announcement.findMany({ include: { createdBy: { select: { role: true } } } });
  const annNoCreator = anns.filter(a => !a.createdBy);
  track(check("Announcements have creators", annNoCreator.length === 0, `${anns.length} checked`));

  const pinnedCount = anns.filter(a => a.isPinned).length;
  track(check("Has pinned announcements", pinnedCount > 0, `${pinnedCount} pinned`));

  // --- Faculty-Subject mapping consistency ---
  console.log("\n🔗 FACULTY-SUBJECT MAPPING CHECKS:");
  const fsMappings = await prisma.facultySubject.findMany({
    include: {
      faculty: { select: { email: true, departmentId: true, role: true } },
      subject: { select: { code: true, departmentId: true } },
    },
  });
  const fsNonFac = fsMappings.filter(fs => fs.faculty.role !== "faculty");
  track(check("All mappings use faculty role", fsNonFac.length === 0, `${fsMappings.length} checked`));

  const fsCrossDept = fsMappings.filter(fs => fs.faculty.departmentId !== fs.subject.departmentId);
  track(check("Faculty-subject dept consistency", fsCrossDept.length === 0,
    fsCrossDept.length > 0 ? `CROSS: ${fsCrossDept.map(fs => `${fs.faculty.email}->${fs.subject.code}`).join(", ")}` : `${fsMappings.length} OK`));

  // ═══════════════════════════════════════════════════════════════
  // PART 2: API ENDPOINT TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  PART 2: API ENDPOINT TESTS (via HTTP)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Login as admin
  console.log("🔐 LOGIN:");
  const loginRes = await login("admin@college.com", "password123");
  track(check("Admin login", !!SESSION_TOKEN, SESSION_TOKEN ? "token received" : "NO TOKEN"));

  if (SESSION_TOKEN) {
    // Test all GET endpoints
    console.log("\n📡 API GET ENDPOINTS:");

    const endpoints: [string, string, number][] = [
      ["/departments", "Departments", 5],
      ["/programs", "Programs", 5],
      ["/batches", "Batches", 6],
      ["/subjects", "Subjects", 24],
      ["/users?role=student", "Students", 32],
      ["/users?role=faculty", "Faculty", 12],
      ["/timetable", "Timetable", 48],
      ["/attendance", "Attendance", 10], // paginated, at least 10
      ["/leave", "Leave Apps", 10],
      ["/exams", "Exams", 16],
      ["/hostel", "Hostels", 4],
      ["/hostel/rooms", "Rooms", 10],
      ["/hostel/allocations", "Allocations", 10],
      ["/hostel/gate-pass", "Gate Passes", 10],
      ["/hostel/complaints", "Complaints", 10],
      ["/announcements", "Announcements", 10],
      ["/calendar", "Calendar Events", 10],
      ["/activity-log", "Activity Logs", 10],
    ];

    for (const [path, label, minCount] of endpoints) {
      try {
        const res = await apiGet(path);
        const data = res?.data || res;
        const count = Array.isArray(data) ? data.length : 0;
        const ok = count >= minCount;
        track(check(`GET ${path.padEnd(30)}`, ok, `${count} items (expected ≥ ${minCount})`));
        if (!ok && res?.message) console.log(`    ⚠️  API message: ${res.message}`);
      } catch (e: any) {
        track(check(`GET ${path.padEnd(30)}`, false, `ERROR: ${e.message}`));
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`  RESULTS: ${pass} passed, ${fail} failed, ${pass + fail} total`);
  console.log(fail === 0 ? "  ✅ ALL CHECKS PASSED!" : `  ❌ ${fail} CHECKS FAILED`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

verify()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
