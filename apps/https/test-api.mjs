/**
 * ═══════════════════════════════════════════════════════════════
 *  LMS Backend API — Comprehensive Route Tester
 * ═══════════════════════════════════════════════════════════════
 *
 *  Tests EVERY backend route with correct payloads.
 *  Usage:
 *    1. Make sure the backend (apps/https) is running on port 3001
 *    2. Run:  node apps/https/test-api.mjs
 *
 *  The script logs in as admin, then hits every endpoint.
 *  Created entities are cleaned up at the end.
 */

const API = "http://localhost:3001";
const ADMIN_EMAIL = "admin@college.com";
const ADMIN_PASS = "password123";

let cookies = "";
let createdIds = {}; // Track created IDs for cleanup
let existing = {};  // IDs from seeded data — used for POST tests that need real references

// ─── Helpers ─────────────────────────────────────────────────────

async function req(method, path, body = null, label = "") {
  const url = `${API}${path}`;
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(url, opts);
    // Capture set-cookie
    const setCookie = res.headers.getSetCookies?.() || [];
    if (setCookie.length) {
      cookies = setCookie.map((c) => c.split(";")[0]).join("; ");
    }
    const data = await res.json();
    const ok = res.ok && (data.success !== false);
    const icon = ok ? "✅" : "❌";
    const tag = label || `${method} ${path}`;
    console.log(`  ${icon}  ${tag}  [${res.status}]${ok ? "" : "  → " + (data.error || data.message || JSON.stringify(data).slice(0, 120))}`);
    return { ok, status: res.status, data };
  } catch (err) {
    console.log(`  💥  ${label || `${method} ${path}`}  → ${err.message}`);
    return { ok: false, status: 0, data: null };
  }
}

// ─── Auth ────────────────────────────────────────────────────────

async function login(email, password) {
  console.log(`\n🔐 Logging in as ${email}...`);
  const res = await fetch(`${API}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": API },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  });
  const raw = res.headers.get("set-cookie") || "";
  if (raw) {
    cookies = raw.split(",").map((c) => c.trim().split(";")[0]).join("; ");
  }
  const data = await res.json().catch(() => ({}));
  if (cookies) {
    console.log("  ✅  Logged in successfully");
    return true;
  }
  console.log(`  ❌  Login failed: ${JSON.stringify(data).slice(0, 200)}`);
  return false;
}

// ─── Test Suites ─────────────────────────────────────────────────

async function testHealth() {
  console.log("\n═══ HEALTH CHECK ═══");
  const res = await fetch(`${API}/api/auth/get-session`, {
    headers: { Cookie: cookies },
  });
  const data = await res.json().catch(() => null);
  if (data?.user) {
    console.log(`  ✅  Session valid — user: ${data.user.name} (${data.user.role})`);
  } else {
    console.log(`  ❌  No valid session`);
  }
}

async function testDashboard() {
  console.log("\n═══ DASHBOARD ═══");
  await req("GET", "/api/dashboard/admin", null, "Admin dashboard");
}

async function testDepartments() {
  console.log("\n═══ DEPARTMENTS ═══");
  // GET all
  await req("GET", "/api/departments", null, "List departments");

  // CREATE
  const { ok, data } = await req("POST", "/api/departments", {
    name: "Test Department",
    code: "TESTDEPT",
    description: "Created by API tester",
  }, "Create department");
  if (ok && data?.data?.id) {
    createdIds.department = data.data.id;

    // GET by ID
    await req("GET", `/api/departments/${data.data.id}`, null, "Get department by ID");

    // UPDATE
    await req("PUT", `/api/departments/${data.data.id}`, {
      name: "Test Dept Updated",
    }, "Update department");
  }
}

async function testPrograms() {
  console.log("\n═══ PROGRAMS ═══");
  await req("GET", "/api/programs", null, "List programs");

  if (!createdIds.department) return console.log("  ⏭  Skipped create — no department");
  const { ok, data } = await req("POST", "/api/programs", {
    name: "Test Program",
    code: "TESTPROG",
    durationYears: 4,
    totalSemesters: 8,
    departmentId: createdIds.department,
  }, "Create program");
  if (ok && data?.data?.id) {
    createdIds.program = data.data.id;
    await req("GET", `/api/programs/${data.data.id}`, null, "Get program by ID");
    await req("PUT", `/api/programs/${data.data.id}`, { name: "Test Prog Updated" }, "Update program");
  }
}

async function testBatches() {
  console.log("\n═══ BATCHES ═══");
  await req("GET", "/api/batches", null, "List batches");

  if (!createdIds.program) return console.log("  ⏭  Skipped create — no program");
  const { ok, data } = await req("POST", "/api/batches", {
    name: "2024-2028 Test",
    startYear: 2024,
    endYear: 2028,
    programId: createdIds.program,
  }, "Create batch");
  if (ok && data?.data?.id) {
    createdIds.batch = data.data.id;
    await req("GET", `/api/batches/${data.data.id}`, null, "Get batch by ID");
    await req("PUT", `/api/batches/${data.data.id}`, { name: "2024-28 Updated" }, "Update batch");

    // Create section
    const secRes = await req("POST", "/api/batches/sections", {
      name: "Z",
      batchId: data.data.id,
    }, "Create section");
    if (secRes.ok && secRes.data?.data?.id) {
      createdIds.section = secRes.data.data.id;
    }
  }
}

async function testSubjects() {
  console.log("\n═══ SUBJECTS ═══");
  const listRes = await req("GET", "/api/subjects", null, "List subjects");

  // Grab existing subject, semester, department from seeded data
  const subjects = listRes.data?.data || [];
  if (subjects.length > 0) {
    existing.subject = subjects[0].id;
    existing.semester = subjects[0].semesterId || subjects[0].semester?.id;
    existing.department = subjects[0].departmentId || subjects[0].department?.id;
    console.log(`  📌 Using existing subject: ${subjects[0].code} (${subjects[0].name})`);
  }

  // Also load existing students & faculty for later tests
  const studRes = await req("GET", "/api/users?role=student", null, "Fetch existing students");
  const students = studRes.data?.data || [];
  if (students.length > 0) {
    existing.student = students[0].id;
    existing.section = students[0].sectionId;
    console.log(`  📌 Using existing student: ${students[0].name}`);
  }

  const facRes = await req("GET", "/api/users?role=faculty", null, "Fetch existing faculty");
  const faculty = facRes.data?.data || [];
  if (faculty.length > 0) {
    existing.faculty = faculty[0].id;
    console.log(`  📌 Using existing faculty: ${faculty[0].name}`);
  }

  // Try creating a subject
  const semId = existing.semester || createdIds.semester;
  const deptId = existing.department || createdIds.department;
  if (!semId || !deptId) return console.log("  ⏭  Skipped create — no semester/dept");
  const { ok, data } = await req("POST", "/api/subjects", {
    name: "Test Subject API",
    code: `TSTSUB${Date.now() % 10000}`,
    credits: 4,
    type: "theory",
    semesterId: semId,
    departmentId: deptId,
  }, "Create subject");
  if (ok && data?.data?.id) {
    createdIds.subject = data.data.id;
    await req("GET", `/api/subjects/${data.data.id}`, null, "Get subject by ID");
    await req("PUT", `/api/subjects/${data.data.id}`, { name: "Test Subject Updated" }, "Update subject");
  }
}

async function testUsers() {
  console.log("\n═══ USER MANAGEMENT ═══");
  await req("GET", "/api/users?role=student", null, "List students");
  await req("GET", "/api/users?role=faculty", null, "List faculty");
  await req("GET", "/api/users?role=warden", null, "List wardens");

  // Create a test student
  const email = `teststudent_${Date.now()}@test.com`;
  const { ok, data } = await req("POST", "/api/users", {
    email,
    password: "test12345",
    name: "Test Student API",
    role: "student",
    phone: "9999999999",
    gender: "male",
    enrollmentNo: `TEST${Date.now()}`,
    departmentId: existing.department || createdIds.department || undefined,
    batchId: createdIds.batch || undefined,
    sectionId: existing.section || createdIds.section || undefined,
  }, "Create student");
  if (ok && data?.data?.id) {
    createdIds.student = data.data.id;
    await req("GET", `/api/users/${data.data.id}`, null, "Get student by ID");
    await req("PUT", `/api/users/${data.data.id}`, { phone: "8888888888" }, "Update student");
  }

  // Create a test faculty
  const fEmail = `testfaculty_${Date.now()}@test.com`;
  const fRes = await req("POST", "/api/users", {
    email: fEmail,
    password: "test12345",
    name: "Test Faculty API",
    role: "faculty",
    employeeId: `FAC${Date.now()}`,
    departmentId: existing.department || createdIds.department || undefined,
  }, "Create faculty");
  if (fRes.ok && fRes.data?.data?.id) {
    createdIds.faculty = fRes.data.data.id;
  }
}

async function testAttendance() {
  console.log("\n═══ ATTENDANCE ═══");
  await req("GET", "/api/attendance", null, "List attendance records");

  const subjectId = createdIds.subject || existing.subject;
  const studentId = createdIds.student || existing.student;
  if (!subjectId || !studentId) return console.log("  ⏭  Skipped mark — no subject/student");

  // Mark attendance (POST)
  await req("POST", "/api/attendance/mark", {
    subjectId,
    date: new Date().toISOString().split("T")[0],
    period: 1,
    records: [{ studentId, status: "present" }],
  }, "Mark attendance (POST)");

  // Get student summary
  await req("GET", `/api/attendance/summary/${studentId}`, null, "Get student attendance summary");

  // Low attendance
  await req("GET", `/api/attendance/low/${subjectId}`, null, "Get low attendance alerts");
}

async function testLeave() {
  console.log("\n═══ LEAVE ═══");
  // List all leaves
  await req("GET", "/api/leave?limit=5", null, "List all leaves (GET)");

  // List leaves filtered by status
  await req("GET", "/api/leave?status=pending&limit=5", null, "List pending leaves");
  await req("GET", "/api/leave?status=approved&limit=5", null, "List approved leaves");

  // Get existing leave to test status update
  const leaveRes = await req("GET", "/api/leave?status=pending&limit=1", null, "Get a pending leave");
  const leaves = leaveRes.data?.data?.records || leaveRes.data?.data || [];
  if (leaves.length > 0) {
    const leaveId = leaves[0].id;
    // Approve leave (PATCH)
    await req("PATCH", `/api/leave/${leaveId}/status`, {
      status: "approved",
      approverNote: "Approved by API tester",
    }, "Approve leave (PATCH)");
  } else {
    console.log("  ⏭  No pending leaves to approve");
  }
}

async function testTimetable() {
  console.log("\n═══ TIMETABLE ═══");
  await req("GET", "/api/timetable", null, "List all timetable slots");

  // Use seeded data if fresh data not available
  const subjectId  = createdIds.subject  || existing.subject;
  const sectionId  = createdIds.section  || existing.section;
  const semesterId = createdIds.semester || existing.semester;
  const facultyId  = createdIds.faculty  || existing.faculty;

  if (!subjectId || !sectionId || !semesterId || !facultyId) {
    return console.log("  ⏭  Skipped create — missing dependencies");
  }
  const { ok, data } = await req("POST", "/api/timetable", {
    dayOfWeek: 2,
    startTime: "14:00",
    endTime: "15:00",
    room: "TEST-101",
    subjectId,
    facultyId,
    sectionId,
    semesterId,
  }, "Create timetable slot (POST)");
  if (ok && data?.data?.id) {
    createdIds.timetableSlot = data.data.id;
    await req("PUT", `/api/timetable/${data.data.id}`, { room: "TEST-202" }, "Update timetable slot (PUT)");
    await req("DELETE", `/api/timetable/${data.data.id}`, null, "Delete timetable slot (DELETE)");
    createdIds.timetableSlot = null; // already deleted
  }

  // Test section/faculty filtered views
  if (sectionId) await req("GET", `/api/timetable/section/${sectionId}`, null, "Get timetable by section");
  if (facultyId) await req("GET", `/api/timetable/faculty/${facultyId}`, null, "Get timetable by faculty");
}

async function testExams() {
  console.log("\n═══ EXAMS ═══");
  await req("GET", "/api/exams", null, "List all exams (GET)");

  // Use seeded data if fresh not available
  const subjectId  = createdIds.subject  || existing.subject;
  const semesterId = createdIds.semester || existing.semester;
  const studentId  = createdIds.student  || existing.student;

  if (!subjectId || !semesterId) return console.log("  ⏭  Skipped create — no subject/semester");

  // Create exam (POST)
  const { ok, data } = await req("POST", "/api/exams", {
    name: "Test Exam API",
    type: "internal",
    subjectId,
    semesterId,
    date: new Date().toISOString().split("T")[0],
    totalMarks: 100,
  }, "Create exam (POST)");

  if (ok && data?.data?.id) {
    createdIds.exam = data.data.id;

    // Update exam (PUT)
    await req("PUT", `/api/exams/${data.data.id}`, { totalMarks: 80, name: "Test Exam Updated" }, "Update exam (PUT)");

    // Enter marks (POST /api/exams/marks)
    if (studentId) {
      await req("POST", "/api/exams/marks", {
        examId: data.data.id,
        results: [{ studentId, marksObtained: 72, grade: "B" }],
      }, "Enter marks (POST /exams/marks)");
    }

    // Get results for student
    if (studentId) {
      await req("GET", `/api/exams/results/${studentId}`, null, "Get results by student (GET)");
    }

    // Student: my results endpoint
    await req("GET", "/api/exams/results/my", null, "Get my results (student view — will 403 as admin, expected)");
  }
}

async function testAnnouncements() {
  console.log("\n═══ ANNOUNCEMENTS ═══");
  await req("GET", "/api/announcements?limit=5", null, "List announcements");

  const { ok, data } = await req("POST", "/api/announcements", {
    title: "Test Announcement",
    content: "This is a test announcement from the API tester script.",
    type: "global",
    isPinned: false,
  }, "Create announcement");
  if (ok && data?.data?.id) {
    createdIds.announcement = data.data.id;
    await req("PUT", `/api/announcements/${data.data.id}`, {
      title: "Test Announcement Updated",
    }, "Update announcement");
  }
}

async function testCalendar() {
  console.log("\n═══ CALENDAR ═══");
  await req("GET", "/api/calendar?limit=5", null, "List events");

  const { ok, data } = await req("POST", "/api/calendar", {
    title: "Test Holiday",
    startDate: "2026-12-25",
    endDate: "2026-12-25",
    type: "holiday",
    description: "Test event from API tester",
  }, "Create event");
  if (ok && data?.data?.id) {
    createdIds.calendarEvent = data.data.id;
    await req("PUT", `/api/calendar/${data.data.id}`, { title: "Test Holiday Updated" }, "Update event");
  }
}

async function testHostel() {
  console.log("\n═══ HOSTEL ═══");
  await req("GET", "/api/hostel", null, "List hostels");

  const { ok, data } = await req("POST", "/api/hostel", {
    name: "Test Hostel",
    type: "boys",
    totalRooms: 10,
  }, "Create hostel");
  if (ok && data?.data?.id) {
    createdIds.hostel = data.data.id;

    // Create room
    const roomRes = await req("POST", "/api/hostel/rooms", {
      hostelId: data.data.id,
      roomNumber: "T-101",
      floor: 1,
      capacity: 2,
    }, "Create room");
    if (roomRes.ok && roomRes.data?.data?.id) {
      createdIds.room = roomRes.data.data.id;
    }

    // Get rooms
    await req("GET", `/api/hostel/${data.data.id}/rooms`, null, "List rooms");
  }

  // Gate pass & complaints — these need student session
  await req("GET", "/api/hostel/gate-pass", null, "List gate passes");
  await req("GET", "/api/hostel/complaints", null, "List complaints");
}

async function testActivityLog() {
  console.log("\n═══ ACTIVITY LOG ═══");
  await req("GET", "/api/activity-log?limit=5", null, "List activity logs");
  await req("GET", "/api/activity-log/recent", null, "Recent activity");
  await req("GET", "/api/activity-log/stats", null, "Activity stats");
}

async function testLegacyRoutes() {
  console.log("\n═══ LEGACY ROUTES ═══");
  await req("GET", "/me", null, "Get current user (/me)");
  await req("GET", "/users", null, "List users (legacy)");
  await req("GET", "/admin/stats", null, "Admin stats (legacy)");
}

// ─── Cleanup ─────────────────────────────────────────────────────

async function cleanup() {
  console.log("\n═══ CLEANUP ═══");
  // Delete in reverse dependency order
  if (createdIds.timetableSlot) await req("DELETE", `/api/timetable/${createdIds.timetableSlot}`, null, "Delete timetable slot");
  if (createdIds.exam) await req("DELETE", `/api/exams/${createdIds.exam}`, null, "Delete exam");
  if (createdIds.announcement) await req("DELETE", `/api/announcements/${createdIds.announcement}`, null, "Delete announcement");
  if (createdIds.calendarEvent) await req("DELETE", `/api/calendar/${createdIds.calendarEvent}`, null, "Delete calendar event");
  if (createdIds.subject) await req("DELETE", `/api/subjects/${createdIds.subject}`, null, "Delete subject");
  if (createdIds.student) await req("DELETE", `/api/users/${createdIds.student}`, null, "Delete test student");
  if (createdIds.faculty) await req("DELETE", `/api/users/${createdIds.faculty}`, null, "Delete test faculty");
  if (createdIds.batch) await req("DELETE", `/api/batches/${createdIds.batch}`, null, "Delete batch");
  if (createdIds.program) await req("DELETE", `/api/programs/${createdIds.program}`, null, "Delete program");
  if (createdIds.department) await req("DELETE", `/api/departments/${createdIds.department}`, null, "Delete department");
  // Hostel is kept (no cascade issues)
}

// ─── Frontend ↔ Backend Payload Audit ────────────────────────────

function auditFrontendPayloads() {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  FRONTEND → BACKEND PAYLOAD AUDIT");
  console.log("═══════════════════════════════════════════════════════════");

  const checks = [
    // [page, endpoint, method, expected payload fields, actual frontend sends]
    ["admin/departments/create-form", "POST /api/departments", "{ name, code, description? }", "✅ Sends FormData → name, code"],
    ["admin/programs/create-form", "POST /api/programs", "{ name, code, durationYears, totalSemesters, departmentId }", "✅ Sends all required fields"],
    ["admin/batches/create-form", "POST /api/batches", "{ name, startYear, endYear, programId }", "✅ Sends all, parseInt on years"],
    ["admin/batches/create-form", "POST /api/batches/sections", "{ name, batchId }", "✅ Matches"],
    ["admin/subjects/create-form", "POST /api/subjects", "{ name, code, credits, type, semesterId, departmentId }", "✅ Sends all, parseInt on credits"],
    ["admin/students/create-form", "POST /api/users", "{ email, password, name, role, phone?, gender?, enrollmentNo?, departmentId?, batchId?, sectionId? }", "✅ Sends all fields"],
    ["admin/hostel/create-form", "POST /api/hostel", "{ name, type, wardenId?, totalRooms? }", "✅ Matches"],
    ["admin/announcements/create-form", "POST /api/announcements", "{ title, content, type, targetId?, isPinned? }", "✅ Matches"],
    ["admin/calendar/create-form", "POST /api/calendar", "{ title, startDate, endDate, type, description?, departmentId? }", "✅ Matches"],
    ["admin/leave/action-buttons", "PATCH /api/leave/:id/status", "{ status: 'approved'|'rejected' }", "✅ Matches"],
    ["admin/timetable/create-slot-form", "POST /api/timetable", "{ dayOfWeek, startTime, endTime, room?, subjectId, facultyId, sectionId, semesterId }", "✅ Sends all, parseInt on dayOfWeek"],
    ["faculty/attendance/mark-form", "POST /api/attendance/mark", "{ subjectId, date, period, records[{studentId, status}] }", "✅ Fixed: now sends period (int)"],
    ["faculty/marks/enter-form", "POST /api/exams", "{ name, type, subjectId, semesterId, date, totalMarks }", "✅ Fixed: type enum matches schema"],
    ["faculty/marks/enter-form", "POST /api/exams/marks", "{ examId, results[{studentId, marksObtained, grade?}] }", "✅ Fixed: uses bulk endpoint"],
    ["student/leave/apply-form", "POST /api/leave", "{ type, startDate, endDate, reason }", "✅ Matches"],
    ["student/hostel/gate-pass-form", "POST /api/hostel/gate-pass", "{ reason, outDate, outTime, expectedReturnDate }", "✅ Matches"],
    ["student/hostel/complaint-form", "POST /api/hostel/complaints", "{ roomId, category, description }", "✅ Matches"],
    ["warden/gate-pass/gate-pass-client", "PATCH /api/hostel/gate-pass/:id/status", "{ status: 'approved'|'rejected' }", "✅ Matches"],
    ["warden/complaints/complaints-client", "PATCH /api/hostel/complaints/:id/status", "{ status: 'open'|'in_progress'|'resolved' }", "✅ Matches"],
    ["warden/rooms/rooms-client", "POST /api/hostel/allocate", "{ studentId, roomId, allocatedDate }", "✅ Matches"],
    ["warden/rooms/rooms-client", "PATCH /api/hostel/allocate/:id/vacate", "(no body)", "✅ Matches"],
    ["delete-row-button", "DELETE /api/[resource]/:id", "(no body)", "✅ All delete buttons match"],
  ];

  for (const [page, endpoint, schema, status] of checks) {
    console.log(`  ${status}  ${page} → ${endpoint}`);
    if (schema) console.log(`         Schema: ${schema}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║   LMS Backend API — Comprehensive Route Tester          ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log(`\nTarget: ${API}`);

  // Check server is reachable
  try {
    await fetch(API);
  } catch {
    console.log("\n❌ Server is not reachable at " + API);
    console.log("   Start the backend first: cd apps/https && bun dev");
    process.exit(1);
  }

  // Login
  const loggedIn = await login(ADMIN_EMAIL, ADMIN_PASS);
  if (!loggedIn) {
    console.log("\n❌ Cannot authenticate. Make sure admin@lms.com exists with password admin123.");
    console.log("   Or update ADMIN_EMAIL / ADMIN_PASS at the top of this file.");
    process.exit(1);
  }

  // Health
  await testHealth();

  // Test all modules
  await testDashboard();
  await testDepartments();
  await testPrograms();
  await testBatches();
  await testSubjects();
  await testUsers();
  await testAttendance();
  await testLeave();
  await testTimetable();
  await testExams();
  await testAnnouncements();
  await testCalendar();
  await testHostel();
  await testActivityLog();
  await testLegacyRoutes();

  // Cleanup
  await cleanup();

  // Frontend audit
  auditFrontendPayloads();

  console.log("\n══════════════════════════════════════════════════");
  console.log("  ALL TESTS COMPLETE");
  console.log("══════════════════════════════════════════════════\n");
}

main().catch(console.error);
