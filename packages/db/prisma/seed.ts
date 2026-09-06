/**
 * ═══════════════════════════════════════════════════════════════════
 * UNIVERSITY LMS — FULL REALISTIC SEED
 * ═══════════════════════════════════════════════════════════════════
 *
 * 3 Departments: Computer Engineering (CMPN), IT, AI & Data Science
 * Realistic Indian engineering college data
 *
 * Usage:
 *   $env:DATABASE_URL='postgresql://postgres:mysecretpassword@localhost:5432/postgres'
 *   $env:BETTER_AUTH_SECRET='supersecretkey123'
 *   bun run packages/db/prisma/seed.ts
 *
 * ALL ACCOUNTS USE PASSWORD: password123
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  PrismaClient,
  HostelType,
  AnnouncementType,
  SubjectType,
  AttendanceStatus,
  LeaveType,
  ApprovalStatus,
  ExamType,
  AcademicEventType,
  ActivityAction,
  ActivityModule,
  Grade,
  Gender,
} from "@prisma/client";

import { auth } from "../../auth/src/auth";

const prisma = new PrismaClient();
const PASSWORD = "password123";

// ─── Helper: create user via Better Auth API, then update profile ──
async function createUser(data: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  address?: string;
  enrollmentNo?: string;
  guardianName?: string;
  guardianPhone?: string;
  employeeId?: string;
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
}) {
  let user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    const result = await auth.api.signUpEmail({
      body: { email: data.email, password: PASSWORD, name: data.name },
    });
    if (!result?.user) throw new Error(`Failed to create user: ${data.email}`);

    user = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: data.role,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        enrollmentNo: data.enrollmentNo,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        employeeId: data.employeeId,
        departmentId: data.departmentId,
        batchId: data.batchId,
        sectionId: data.sectionId,
        emailVerified: true,
      },
    });
  }

  return user;
}

async function main() {
  console.log("🌱 Seeding University LMS — 3 Departments (CMPN, IT, AI)...\n");

  // ══════════════════════════════════════════════════════════════════
  // CLEAN — Delete all existing data in correct order
  // ══════════════════════════════════════════════════════════════════
  console.log("🗑️  Cleaning existing data...");
  await prisma.activityLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.hostelComplaint.deleteMany();
  await prisma.gatePass.deleteMany();
  await prisma.hostelAllocation.deleteMany();
  await prisma.hostelRoom.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.result.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveApplication.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.facultySubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicEvent.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.section.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.program.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  console.log("  ✅ All data cleared\n");

  // ══════════════════════════════════════════════════════════════════
  // 1. DEPARTMENTS
  // ══════════════════════════════════════════════════════════════════
  console.log("📚 Creating 3 departments...");

  const deptData = [
    { id: "dept-cmpn", name: "Computer Engineering",         code: "CMPN", description: "Department of Computer Engineering — Core CS, Systems, Software" },
    { id: "dept-it",   name: "Information Technology",        code: "IT",   description: "Department of Information Technology — Web, Cloud, Security" },
    { id: "dept-ai",   name: "AI & Data Science",            code: "AIDS", description: "Department of Artificial Intelligence & Data Science" },
  ];

  const depts: Record<string, any> = {};
  for (const d of deptData) {
    depts[d.code] = await prisma.department.create({ data: d });
    console.log(`  ✅ ${d.code} — ${d.name}`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. PROGRAMS (B.Tech 4yr for each dept)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n🎓 Creating programs...");

  const progData = [
    { id: "prog-btech-cmpn", name: "B.Tech Computer Engineering",  code: "BTECH-CMPN", durationYears: 4, totalSemesters: 8, departmentId: depts.CMPN.id },
    { id: "prog-btech-it",   name: "B.Tech Information Technology", code: "BTECH-IT",   durationYears: 4, totalSemesters: 8, departmentId: depts.IT.id },
    { id: "prog-btech-ai",   name: "B.Tech AI & Data Science",     code: "BTECH-AIDS", durationYears: 4, totalSemesters: 8, departmentId: depts.AIDS.id },
  ];

  const progs: Record<string, any> = {};
  for (const p of progData) {
    progs[p.code] = await prisma.program.create({ data: p });
    console.log(`  ✅ ${p.name}`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. BATCHES (2023-2027 and 2024-2028 for each)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📅 Creating batches...");

  const batchData = [
    { id: "batch-cmpn-23", name: "2023-2027", startYear: 2023, endYear: 2027, programId: progs["BTECH-CMPN"].id },
    { id: "batch-cmpn-24", name: "2024-2028", startYear: 2024, endYear: 2028, programId: progs["BTECH-CMPN"].id },
    { id: "batch-it-23",   name: "2023-2027", startYear: 2023, endYear: 2027, programId: progs["BTECH-IT"].id },
    { id: "batch-it-24",   name: "2024-2028", startYear: 2024, endYear: 2028, programId: progs["BTECH-IT"].id },
    { id: "batch-ai-23",   name: "2023-2027", startYear: 2023, endYear: 2027, programId: progs["BTECH-AIDS"].id },
    { id: "batch-ai-24",   name: "2024-2028", startYear: 2024, endYear: 2028, programId: progs["BTECH-AIDS"].id },
  ];

  const batches: Record<string, any> = {};
  for (const b of batchData) {
    batches[b.id] = await prisma.batch.create({ data: b });
    console.log(`  ✅ ${b.name} (${b.id})`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. SECTIONS (A and B per batch)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n🏫 Creating sections...");

  const sectionData = [
    { id: "sec-cmpn23-A", name: "A", batchId: batches["batch-cmpn-23"].id },
    { id: "sec-cmpn23-B", name: "B", batchId: batches["batch-cmpn-23"].id },
    { id: "sec-cmpn24-A", name: "A", batchId: batches["batch-cmpn-24"].id },
    { id: "sec-it23-A",   name: "A", batchId: batches["batch-it-23"].id },
    { id: "sec-it23-B",   name: "B", batchId: batches["batch-it-23"].id },
    { id: "sec-it24-A",   name: "A", batchId: batches["batch-it-24"].id },
    { id: "sec-ai23-A",   name: "A", batchId: batches["batch-ai-23"].id },
    { id: "sec-ai24-A",   name: "A", batchId: batches["batch-ai-24"].id },
  ];

  const sections: Record<string, any> = {};
  for (const s of sectionData) {
    sections[s.id] = await prisma.section.create({ data: s });
    console.log(`  ✅ Section ${s.name} (${s.id})`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. SEMESTERS (1-8 for each program, current = 5)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📖 Creating semesters...");

  const semesters: Record<string, any> = {};
  for (const prog of Object.values(progs)) {
    for (let i = 1; i <= 8; i++) {
      const key = `${prog.code}-sem${i}`;
      semesters[key] = await prisma.semester.create({
        data: { number: i, programId: prog.id, isCurrent: i === 5 },
      });
    }
  }
  console.log("  ✅ Semesters 1-8 for all 3 programs (current: Sem 5)");

  // ══════════════════════════════════════════════════════════════════
  // 6. SUBJECTS — Realistic Mumbai Univ style subjects
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📝 Creating subjects...");

  const subjectData = [
    // ── CMPN Semester 5 (3rd year, Sem 1) ──
    { id: "sub-cmpn501", name: "Data Structures & Algorithms",  code: "CMPN501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem5", deptCode: "CMPN" },
    { id: "sub-cmpn502", name: "Operating Systems",             code: "CMPN502", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem5", deptCode: "CMPN" },
    { id: "sub-cmpn503", name: "Database Management Systems",   code: "CMPN503", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem5", deptCode: "CMPN" },
    { id: "sub-cmpn504", name: "Computer Networks",             code: "CMPN504", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem5", deptCode: "CMPN" },
    { id: "sub-cmpn505", name: "Software Engineering",          code: "CMPN505", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem5", deptCode: "CMPN" },
    { id: "sub-cmpn591", name: "DSA Lab",                       code: "CMPN591", credits: 2, type: SubjectType.practical, semKey: "BTECH-CMPN-sem5", deptCode: "CMPN" },
    { id: "sub-cmpn592", name: "DBMS Lab",                      code: "CMPN592", credits: 2, type: SubjectType.practical, semKey: "BTECH-CMPN-sem5", deptCode: "CMPN" },

    // ── CMPN Semester 3 (2nd year, Sem 1) — for 2024 batch ──
    { id: "sub-cmpn301", name: "Engineering Mathematics III",    code: "CMPN301", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem3", deptCode: "CMPN" },
    { id: "sub-cmpn302", name: "Digital Logic Design",           code: "CMPN302", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem3", deptCode: "CMPN" },
    { id: "sub-cmpn303", name: "Discrete Mathematics",           code: "CMPN303", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem3", deptCode: "CMPN" },
    { id: "sub-cmpn304", name: "Electronic Devices & Circuits",  code: "CMPN304", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem3", deptCode: "CMPN" },
    { id: "sub-cmpn305", name: "Data Structures",                code: "CMPN305", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CMPN-sem3", deptCode: "CMPN" },
    { id: "sub-cmpn391", name: "Digital Logic Lab",              code: "CMPN391", credits: 2, type: SubjectType.practical, semKey: "BTECH-CMPN-sem3", deptCode: "CMPN" },
    { id: "sub-cmpn392", name: "DS Lab",                         code: "CMPN392", credits: 2, type: SubjectType.practical, semKey: "BTECH-CMPN-sem3", deptCode: "CMPN" },

    // ── IT Semester 5 ──
    { id: "sub-it501", name: "Web Development",                 code: "IT501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem5", deptCode: "IT" },
    { id: "sub-it502", name: "Information Security",            code: "IT502", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem5", deptCode: "IT" },
    { id: "sub-it503", name: "Cloud Computing",                 code: "IT503", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem5", deptCode: "IT" },
    { id: "sub-it504", name: "Data Warehousing & Mining",       code: "IT504", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem5", deptCode: "IT" },
    { id: "sub-it505", name: "Mobile Application Development",  code: "IT505", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem5", deptCode: "IT" },
    { id: "sub-it591", name: "Web Dev Lab",                     code: "IT591", credits: 2, type: SubjectType.practical, semKey: "BTECH-IT-sem5", deptCode: "IT" },

    // ── IT Semester 3 (2nd year, Sem 1) — for 2024 batch ──
    { id: "sub-it301", name: "Engineering Mathematics III",      code: "IT301", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem3", deptCode: "IT" },
    { id: "sub-it302", name: "Data Structures",                  code: "IT302", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem3", deptCode: "IT" },
    { id: "sub-it303", name: "Digital Logic Design",             code: "IT303", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem3", deptCode: "IT" },
    { id: "sub-it304", name: "Discrete Mathematics",             code: "IT304", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem3", deptCode: "IT" },
    { id: "sub-it305", name: "Computer Organization",            code: "IT305", credits: 4, type: SubjectType.theory,    semKey: "BTECH-IT-sem3", deptCode: "IT" },
    { id: "sub-it391", name: "DS Lab",                           code: "IT391", credits: 2, type: SubjectType.practical, semKey: "BTECH-IT-sem3", deptCode: "IT" },
    { id: "sub-it392", name: "Digital Logic Lab",                code: "IT392", credits: 2, type: SubjectType.practical, semKey: "BTECH-IT-sem3", deptCode: "IT" },

    // ── AI & DS Semester 5 ──
    { id: "sub-ai501", name: "Machine Learning",                code: "AI501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem5", deptCode: "AIDS" },
    { id: "sub-ai502", name: "Natural Language Processing",     code: "AI502", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem5", deptCode: "AIDS" },
    { id: "sub-ai503", name: "Deep Learning",                   code: "AI503", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem5", deptCode: "AIDS" },
    { id: "sub-ai504", name: "Big Data Analytics",              code: "AI504", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem5", deptCode: "AIDS" },
    { id: "sub-ai505", name: "Computer Vision",                 code: "AI505", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem5", deptCode: "AIDS" },
    { id: "sub-ai591", name: "ML Lab",                          code: "AI591", credits: 2, type: SubjectType.practical, semKey: "BTECH-AIDS-sem5", deptCode: "AIDS" },

    // ── AI & DS Semester 3 (2nd year, Sem 1) — for 2024 batch ──
    { id: "sub-ai301", name: "Engineering Mathematics III",      code: "AI301", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem3", deptCode: "AIDS" },
    { id: "sub-ai302", name: "Data Structures & Algorithms",     code: "AI302", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem3", deptCode: "AIDS" },
    { id: "sub-ai303", name: "Probability & Statistics",         code: "AI303", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem3", deptCode: "AIDS" },
    { id: "sub-ai304", name: "Digital Logic Design",             code: "AI304", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem3", deptCode: "AIDS" },
    { id: "sub-ai305", name: "Python Programming",              code: "AI305", credits: 4, type: SubjectType.theory,    semKey: "BTECH-AIDS-sem3", deptCode: "AIDS" },
    { id: "sub-ai391", name: "Python Lab",                       code: "AI391", credits: 2, type: SubjectType.practical, semKey: "BTECH-AIDS-sem3", deptCode: "AIDS" },
    { id: "sub-ai392", name: "DS Lab",                           code: "AI392", credits: 2, type: SubjectType.practical, semKey: "BTECH-AIDS-sem3", deptCode: "AIDS" },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectData) {
    subjects[s.code] = await prisma.subject.create({
      data: {
        id: s.id, name: s.name, code: s.code, credits: s.credits, type: s.type,
        semesterId: semesters[s.semKey].id, departmentId: depts[s.deptCode].id,
      },
    });
    console.log(`  ✅ ${s.code} — ${s.name} (${s.credits} cr)`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 7. USERS — ADMIN
  // ══════════════════════════════════════════════════════════════════
  console.log("\n👑 Creating admin...");
  const admin = await createUser({ id: "user-admin-1", email: "admin@college.com", name: "Dr. Rajesh Kumar", role: "admin", phone: "9876543210", gender: Gender.male, employeeId: "ADM001", departmentId: depts.CMPN.id });
  console.log("  ✅ admin@college.com — Dr. Rajesh Kumar");

  // ══════════════════════════════════════════════════════════════════
  // 8. USERS — FACULTY (6 per dept = 18 total)
  //    4 senior (existing) + 2 junior per dept for realistic coverage
  // ══════════════════════════════════════════════════════════════════
  console.log("\n👨‍🏫 Creating faculty (18)...");

  const facultyData = [
    // CMPN Faculty (6)
    { id: "fac-cmpn-1", email: "amit.verma@college.com",     name: "Prof. Amit Verma",     phone: "9800000001", gender: Gender.male,   employeeId: "FAC001", deptCode: "CMPN" },
    { id: "fac-cmpn-2", email: "sneha.patil@college.com",    name: "Dr. Sneha Patil",      phone: "9800000002", gender: Gender.female, employeeId: "FAC002", deptCode: "CMPN" },
    { id: "fac-cmpn-3", email: "ravi.krishnan@college.com",  name: "Prof. Ravi Krishnan",  phone: "9800000003", gender: Gender.male,   employeeId: "FAC003", deptCode: "CMPN" },
    { id: "fac-cmpn-4", email: "vikas.gupta@college.com",    name: "Dr. Vikas Gupta",      phone: "9800000004", gender: Gender.male,   employeeId: "FAC004", deptCode: "CMPN" },
    { id: "fac-cmpn-5", email: "neeraj.sharma@college.com",  name: "Prof. Neeraj Sharma",  phone: "9800000013", gender: Gender.male,   employeeId: "FAC013", deptCode: "CMPN" },
    { id: "fac-cmpn-6", email: "priyanka.more@college.com",  name: "Dr. Priyanka More",    phone: "9800000014", gender: Gender.female, employeeId: "FAC014", deptCode: "CMPN" },
    // IT Faculty (6)
    { id: "fac-it-1",   email: "anita.desai@college.com",    name: "Dr. Anita Desai",      phone: "9800000005", gender: Gender.female, employeeId: "FAC005", deptCode: "IT" },
    { id: "fac-it-2",   email: "kiran.joshi@college.com",    name: "Prof. Kiran Joshi",    phone: "9800000006", gender: Gender.male,   employeeId: "FAC006", deptCode: "IT" },
    { id: "fac-it-3",   email: "meena.iyer@college.com",     name: "Dr. Meena Iyer",       phone: "9800000007", gender: Gender.female, employeeId: "FAC007", deptCode: "IT" },
    { id: "fac-it-4",   email: "suresh.reddy@college.com",   name: "Prof. Suresh Reddy",   phone: "9800000008", gender: Gender.male,   employeeId: "FAC008", deptCode: "IT" },
    { id: "fac-it-5",   email: "rahul.kulkarni@college.com", name: "Prof. Rahul Kulkarni", phone: "9800000015", gender: Gender.male,   employeeId: "FAC015", deptCode: "IT" },
    { id: "fac-it-6",   email: "swati.chavan@college.com",   name: "Dr. Swati Chavan",     phone: "9800000016", gender: Gender.female, employeeId: "FAC016", deptCode: "IT" },
    // AI Faculty (6)
    { id: "fac-ai-1",   email: "deepak.singh@college.com",   name: "Dr. Deepak Singh",     phone: "9800000009", gender: Gender.male,   employeeId: "FAC009", deptCode: "AIDS" },
    { id: "fac-ai-2",   email: "pooja.nair@college.com",     name: "Prof. Pooja Nair",     phone: "9800000010", gender: Gender.female, employeeId: "FAC010", deptCode: "AIDS" },
    { id: "fac-ai-3",   email: "lakshmi.pillai@college.com", name: "Dr. Lakshmi Pillai",   phone: "9800000011", gender: Gender.female, employeeId: "FAC011", deptCode: "AIDS" },
    { id: "fac-ai-4",   email: "manoj.tiwari@college.com",   name: "Prof. Manoj Tiwari",   phone: "9800000012", gender: Gender.male,   employeeId: "FAC012", deptCode: "AIDS" },
    { id: "fac-ai-5",   email: "arvind.menon@college.com",   name: "Prof. Arvind Menon",   phone: "9800000017", gender: Gender.male,   employeeId: "FAC017", deptCode: "AIDS" },
    { id: "fac-ai-6",   email: "kavita.rao@college.com",     name: "Dr. Kavita Rao",       phone: "9800000018", gender: Gender.female, employeeId: "FAC018", deptCode: "AIDS" },
  ];

  const faculty: Record<string, any> = {};
  for (const f of facultyData) {
    faculty[f.id] = await createUser({
      id: f.id, email: f.email, name: f.name, role: "faculty",
      phone: f.phone, gender: f.gender, employeeId: f.employeeId,
      departmentId: depts[f.deptCode].id,
    });
    console.log(`  ✅ ${f.email} — ${f.name} (${f.deptCode})`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 9. USERS — STUDENTS (6 per section × 8 sections = 48 total)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n🎒 Creating students (48)...");

  const studentNames = [
    { name: "Aarav Sharma",    gender: Gender.male },
    { name: "Priya Patel",     gender: Gender.female },
    { name: "Rohan Mehta",     gender: Gender.male },
    { name: "Ananya Singh",    gender: Gender.female },
    { name: "Vivaan Kulkarni", gender: Gender.male },
    { name: "Isha Deshmukh",   gender: Gender.female },
    { name: "Arjun Gupta",     gender: Gender.male },
    { name: "Kavya Jain",      gender: Gender.female },
    { name: "Dev Rajput",      gender: Gender.male },
    { name: "Riya Chopra",     gender: Gender.female },
    { name: "Siddharth More",  gender: Gender.male },
    { name: "Tanvi Bhatt",     gender: Gender.female },
    { name: "Kartik Thakur",   gender: Gender.male },
    { name: "Neha Pawar",      gender: Gender.female },
    { name: "Yash Wagh",       gender: Gender.male },
    { name: "Sakshi Rane",     gender: Gender.female },
    { name: "Mihir Deshpande", gender: Gender.male },
    { name: "Aditi Kale",      gender: Gender.female },
    { name: "Pranav Sawant",   gender: Gender.male },
    { name: "Shreya Mane",     gender: Gender.female },
    { name: "Aditya Shetty",   gender: Gender.male },
    { name: "Diya Nair",       gender: Gender.female },
    { name: "Harsh Pandey",    gender: Gender.male },
    { name: "Mira Gaikwad",    gender: Gender.female },
    { name: "Raj Prabhu",      gender: Gender.male },
    { name: "Swati Kamble",    gender: Gender.female },
    { name: "Nikhil Jadhav",   gender: Gender.male },
    { name: "Pooja Shinde",    gender: Gender.female },
    { name: "Varun Chavan",    gender: Gender.male },
    { name: "Ritika Sonawane", gender: Gender.female },
    { name: "Aniket Ghadge",   gender: Gender.male },
    { name: "Pallavi Ingale",  gender: Gender.female },
    { name: "Omkar Bhosale",   gender: Gender.male },
    { name: "Mansi Nalawade",  gender: Gender.female },
    { name: "Tushar Nikam",    gender: Gender.male },
    { name: "Ankita Suryawanshi", gender: Gender.female },
    // Extra students for IT-2024 and AI-2024 sections
    { name: "Sahil Patil",     gender: Gender.male },
    { name: "Nikita Joshi",    gender: Gender.female },
    { name: "Kunal Desai",     gender: Gender.male },
    { name: "Rashmi Kulkarni", gender: Gender.female },
    { name: "Akash Parab",     gender: Gender.male },
    { name: "Snehal Gadkari",  gender: Gender.female },
    { name: "Tejas Dongre",    gender: Gender.male },
    { name: "Vrushali Pathak", gender: Gender.female },
    { name: "Gaurav Naik",     gender: Gender.male },
    { name: "Aparna Shirke",   gender: Gender.female },
    { name: "Rohit Bendre",    gender: Gender.male },
    { name: "Megha Phadke",    gender: Gender.female },
  ];

  // Assign students to sections (all 8 sections get students)
  const studentSections = [
    { sectionId: "sec-cmpn23-A", batchId: "batch-cmpn-23", deptCode: "CMPN", prefix: "CMPN23A", start: 0, count: 6 },
    { sectionId: "sec-cmpn23-B", batchId: "batch-cmpn-23", deptCode: "CMPN", prefix: "CMPN23B", start: 6, count: 6 },
    { sectionId: "sec-it23-A",   batchId: "batch-it-23",   deptCode: "IT",   prefix: "IT23A",   start: 12, count: 6 },
    { sectionId: "sec-it23-B",   batchId: "batch-it-23",   deptCode: "IT",   prefix: "IT23B",   start: 18, count: 6 },
    { sectionId: "sec-ai23-A",   batchId: "batch-ai-23",   deptCode: "AIDS", prefix: "AIDS23A", start: 24, count: 6 },
    { sectionId: "sec-cmpn24-A", batchId: "batch-cmpn-24", deptCode: "CMPN", prefix: "CMPN24A", start: 30, count: 6 },
    { sectionId: "sec-it24-A",   batchId: "batch-it-24",   deptCode: "IT",   prefix: "IT24A",   start: 36, count: 6 },
    { sectionId: "sec-ai24-A",   batchId: "batch-ai-24",   deptCode: "AIDS", prefix: "AIDS24A", start: 42, count: 6 },
  ];

  const students: any[] = [];
  let studentIdx = 1;
  for (const sec of studentSections) {
    for (let i = 0; i < sec.count; i++) {
      const s = studentNames[sec.start + i]!;
      const emailName = s.name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
      const student = await createUser({
        id: `stu-${studentIdx}`,
        email: `${emailName}@student.college.com`,
        name: s.name,
        role: "student",
        gender: s.gender,
        phone: `98${String(70000000 + studentIdx).padStart(8, "0")}`,
        enrollmentNo: `${sec.prefix}${String(i + 1).padStart(3, "0")}`,
        guardianName: `Mr. ${s.name.split(" ")[1]}`,
        guardianPhone: `98${String(60000000 + studentIdx).padStart(8, "0")}`,
        departmentId: depts[sec.deptCode].id,
        batchId: batches[sec.batchId].id,
        sectionId: sections[sec.sectionId].id,
      });
      students.push(student);
      studentIdx++;
    }
    console.log(`  ✅ 6 students in ${sec.sectionId}`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 10. FACULTY-SUBJECT ASSIGNMENTS (critical for timetable!)
  //     Every section must have assignments for its semester's subjects.
  //     Sem5 = 2023 batch (3rd year), Sem3 = 2024 batch (2nd year)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n🔗 Assigning faculty to subjects...");

  const sem5Cmpn = semesters["BTECH-CMPN-sem5"].id;
  const sem5It   = semesters["BTECH-IT-sem5"].id;
  const sem5Ai   = semesters["BTECH-AIDS-sem5"].id;
  const sem3Cmpn = semesters["BTECH-CMPN-sem3"].id;
  const sem3It   = semesters["BTECH-IT-sem3"].id;
  const sem3Ai   = semesters["BTECH-AIDS-sem3"].id;

  const fsData = [
    // ────────────────────────────────────────────────────────────────
    // CMPN Section A (Sem 5) — 7 subjects, 4 faculty
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-cmpn-1"].id, subjectId: subjects["CMPN501"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-A"].id },
    { facultyId: faculty["fac-cmpn-1"].id, subjectId: subjects["CMPN591"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-A"].id },
    { facultyId: faculty["fac-cmpn-2"].id, subjectId: subjects["CMPN502"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-A"].id },
    { facultyId: faculty["fac-cmpn-3"].id, subjectId: subjects["CMPN503"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-A"].id },
    { facultyId: faculty["fac-cmpn-3"].id, subjectId: subjects["CMPN592"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-A"].id },
    { facultyId: faculty["fac-cmpn-4"].id, subjectId: subjects["CMPN504"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-A"].id },
    { facultyId: faculty["fac-cmpn-2"].id, subjectId: subjects["CMPN505"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-A"].id },

    // ────────────────────────────────────────────────────────────────
    // CMPN Section B (Sem 5) — SHARED faculty (cross-section conflict test!)
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-cmpn-1"].id, subjectId: subjects["CMPN501"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-B"].id },
    { facultyId: faculty["fac-cmpn-1"].id, subjectId: subjects["CMPN591"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-B"].id },
    { facultyId: faculty["fac-cmpn-2"].id, subjectId: subjects["CMPN502"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-B"].id },
    { facultyId: faculty["fac-cmpn-3"].id, subjectId: subjects["CMPN503"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-B"].id },
    { facultyId: faculty["fac-cmpn-3"].id, subjectId: subjects["CMPN592"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-B"].id },
    { facultyId: faculty["fac-cmpn-4"].id, subjectId: subjects["CMPN504"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-B"].id },
    { facultyId: faculty["fac-cmpn-4"].id, subjectId: subjects["CMPN505"].id, semesterId: sem5Cmpn, sectionId: sections["sec-cmpn23-B"].id },

    // ────────────────────────────────────────────────────────────────
    // CMPN 2024-A (Sem 3) — junior faculty (5,6) + some senior faculty
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-cmpn-5"].id, subjectId: subjects["CMPN301"].id, semesterId: sem3Cmpn, sectionId: sections["sec-cmpn24-A"].id },
    { facultyId: faculty["fac-cmpn-6"].id, subjectId: subjects["CMPN302"].id, semesterId: sem3Cmpn, sectionId: sections["sec-cmpn24-A"].id },
    { facultyId: faculty["fac-cmpn-5"].id, subjectId: subjects["CMPN303"].id, semesterId: sem3Cmpn, sectionId: sections["sec-cmpn24-A"].id },
    { facultyId: faculty["fac-cmpn-6"].id, subjectId: subjects["CMPN304"].id, semesterId: sem3Cmpn, sectionId: sections["sec-cmpn24-A"].id },
    { facultyId: faculty["fac-cmpn-4"].id, subjectId: subjects["CMPN305"].id, semesterId: sem3Cmpn, sectionId: sections["sec-cmpn24-A"].id },
    { facultyId: faculty["fac-cmpn-6"].id, subjectId: subjects["CMPN391"].id, semesterId: sem3Cmpn, sectionId: sections["sec-cmpn24-A"].id },
    { facultyId: faculty["fac-cmpn-4"].id, subjectId: subjects["CMPN392"].id, semesterId: sem3Cmpn, sectionId: sections["sec-cmpn24-A"].id },

    // ────────────────────────────────────────────────────────────────
    // IT Section A (Sem 5)
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-it-1"].id,   subjectId: subjects["IT501"].id,  semesterId: sem5It, sectionId: sections["sec-it23-A"].id },
    { facultyId: faculty["fac-it-1"].id,   subjectId: subjects["IT591"].id,  semesterId: sem5It, sectionId: sections["sec-it23-A"].id },
    { facultyId: faculty["fac-it-2"].id,   subjectId: subjects["IT502"].id,  semesterId: sem5It, sectionId: sections["sec-it23-A"].id },
    { facultyId: faculty["fac-it-3"].id,   subjectId: subjects["IT503"].id,  semesterId: sem5It, sectionId: sections["sec-it23-A"].id },
    { facultyId: faculty["fac-it-4"].id,   subjectId: subjects["IT504"].id,  semesterId: sem5It, sectionId: sections["sec-it23-A"].id },
    { facultyId: faculty["fac-it-2"].id,   subjectId: subjects["IT505"].id,  semesterId: sem5It, sectionId: sections["sec-it23-A"].id },

    // ────────────────────────────────────────────────────────────────
    // IT Section B (Sem 5) — SHARED faculty with IT-A (cross-section!)
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-it-1"].id,   subjectId: subjects["IT501"].id,  semesterId: sem5It, sectionId: sections["sec-it23-B"].id },
    { facultyId: faculty["fac-it-1"].id,   subjectId: subjects["IT591"].id,  semesterId: sem5It, sectionId: sections["sec-it23-B"].id },
    { facultyId: faculty["fac-it-2"].id,   subjectId: subjects["IT502"].id,  semesterId: sem5It, sectionId: sections["sec-it23-B"].id },
    { facultyId: faculty["fac-it-3"].id,   subjectId: subjects["IT503"].id,  semesterId: sem5It, sectionId: sections["sec-it23-B"].id },
    { facultyId: faculty["fac-it-4"].id,   subjectId: subjects["IT504"].id,  semesterId: sem5It, sectionId: sections["sec-it23-B"].id },
    { facultyId: faculty["fac-it-4"].id,   subjectId: subjects["IT505"].id,  semesterId: sem5It, sectionId: sections["sec-it23-B"].id },

    // ────────────────────────────────────────────────────────────────
    // IT 2024-A (Sem 3) — junior IT faculty (5,6) + some senior
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-it-5"].id,   subjectId: subjects["IT301"].id,  semesterId: sem3It, sectionId: sections["sec-it24-A"].id },
    { facultyId: faculty["fac-it-6"].id,   subjectId: subjects["IT302"].id,  semesterId: sem3It, sectionId: sections["sec-it24-A"].id },
    { facultyId: faculty["fac-it-5"].id,   subjectId: subjects["IT303"].id,  semesterId: sem3It, sectionId: sections["sec-it24-A"].id },
    { facultyId: faculty["fac-it-6"].id,   subjectId: subjects["IT304"].id,  semesterId: sem3It, sectionId: sections["sec-it24-A"].id },
    { facultyId: faculty["fac-it-3"].id,   subjectId: subjects["IT305"].id,  semesterId: sem3It, sectionId: sections["sec-it24-A"].id },
    { facultyId: faculty["fac-it-6"].id,   subjectId: subjects["IT391"].id,  semesterId: sem3It, sectionId: sections["sec-it24-A"].id },
    { facultyId: faculty["fac-it-5"].id,   subjectId: subjects["IT392"].id,  semesterId: sem3It, sectionId: sections["sec-it24-A"].id },

    // ────────────────────────────────────────────────────────────────
    // AI Section A (Sem 5)
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-ai-1"].id,   subjectId: subjects["AI501"].id,  semesterId: sem5Ai, sectionId: sections["sec-ai23-A"].id },
    { facultyId: faculty["fac-ai-1"].id,   subjectId: subjects["AI591"].id,  semesterId: sem5Ai, sectionId: sections["sec-ai23-A"].id },
    { facultyId: faculty["fac-ai-2"].id,   subjectId: subjects["AI502"].id,  semesterId: sem5Ai, sectionId: sections["sec-ai23-A"].id },
    { facultyId: faculty["fac-ai-3"].id,   subjectId: subjects["AI503"].id,  semesterId: sem5Ai, sectionId: sections["sec-ai23-A"].id },
    { facultyId: faculty["fac-ai-4"].id,   subjectId: subjects["AI504"].id,  semesterId: sem5Ai, sectionId: sections["sec-ai23-A"].id },
    { facultyId: faculty["fac-ai-3"].id,   subjectId: subjects["AI505"].id,  semesterId: sem5Ai, sectionId: sections["sec-ai23-A"].id },

    // ────────────────────────────────────────────────────────────────
    // AI 2024-A (Sem 3) — junior AI faculty (5,6) + some senior
    // ────────────────────────────────────────────────────────────────
    { facultyId: faculty["fac-ai-5"].id,   subjectId: subjects["AI301"].id,  semesterId: sem3Ai, sectionId: sections["sec-ai24-A"].id },
    { facultyId: faculty["fac-ai-6"].id,   subjectId: subjects["AI302"].id,  semesterId: sem3Ai, sectionId: sections["sec-ai24-A"].id },
    { facultyId: faculty["fac-ai-5"].id,   subjectId: subjects["AI303"].id,  semesterId: sem3Ai, sectionId: sections["sec-ai24-A"].id },
    { facultyId: faculty["fac-ai-6"].id,   subjectId: subjects["AI304"].id,  semesterId: sem3Ai, sectionId: sections["sec-ai24-A"].id },
    { facultyId: faculty["fac-ai-4"].id,   subjectId: subjects["AI305"].id,  semesterId: sem3Ai, sectionId: sections["sec-ai24-A"].id },
    { facultyId: faculty["fac-ai-6"].id,   subjectId: subjects["AI391"].id,  semesterId: sem3Ai, sectionId: sections["sec-ai24-A"].id },
    { facultyId: faculty["fac-ai-5"].id,   subjectId: subjects["AI392"].id,  semesterId: sem3Ai, sectionId: sections["sec-ai24-A"].id },
  ];

  for (const fs of fsData) {
    await prisma.facultySubject.create({ data: fs });
  }
  console.log(`  ✅ ${fsData.length} faculty-subject assignments created`);
  console.log("  📌 CMPN-A & CMPN-B share faculty, IT-A & IT-B share faculty (cross-section conflict test!)");
  console.log("  📌 2024 batch sections (sem3) have dedicated junior faculty");

  // ══════════════════════════════════════════════════════════════════
  // 11. ATTENDANCE (last 2 weeks for CMPN-A students)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n✅ Creating attendance records...");

  const cmpnAStudents = students.filter((_, i) => i < 6); // first 6 = CMPN-A
  const attendanceSubjects = [subjects["CMPN501"], subjects["CMPN502"], subjects["CMPN503"]];
  const statuses: AttendanceStatus[] = [AttendanceStatus.present, AttendanceStatus.present, AttendanceStatus.present, AttendanceStatus.absent, AttendanceStatus.late];

  let attCount = 0;
  for (let dayBack = 1; dayBack <= 10; dayBack++) {
    const date = new Date();
    date.setDate(date.getDate() - dayBack);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

    for (const sub of attendanceSubjects) {
      for (const stu of cmpnAStudents) {
        const status = statuses[Math.floor(Math.random() * statuses.length)]!;
        await prisma.attendance.create({
          data: {
            studentId: stu.id,
            subjectId: sub.id,
            date,
            period: (dayBack % 3) + 1,
            status,
            markedById: faculty["fac-cmpn-1"].id,
          },
        });
        attCount++;
      }
    }
  }
  console.log(`  ✅ ${attCount} attendance records (CMPN-A, last 2 weeks)`);

  // ══════════════════════════════════════════════════════════════════
  // 12. EXAMS & RESULTS
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📝 Creating exams & results...");

  const examData = [
    { name: "DSA Mid-Term",   type: ExamType.midterm,   subjectCode: "CMPN501", totalMarks: 30, date: new Date("2026-08-15") },
    { name: "OS Mid-Term",    type: ExamType.midterm,   subjectCode: "CMPN502", totalMarks: 30, date: new Date("2026-08-16") },
    { name: "DBMS Internal",  type: ExamType.internal,  subjectCode: "CMPN503", totalMarks: 20, date: new Date("2026-08-20") },
    { name: "ML Mid-Term",    type: ExamType.midterm,   subjectCode: "AI501",   totalMarks: 30, date: new Date("2026-08-18") },
    { name: "Web Dev Quiz 1", type: ExamType.internal,  subjectCode: "IT501",   totalMarks: 20, date: new Date("2026-08-10") },
  ];

  for (const e of examData) {
    const semId = e.subjectCode.startsWith("CMPN") ? sem5Cmpn : e.subjectCode.startsWith("AI") ? sem5Ai : sem5It;
    const exam = await prisma.exam.create({
      data: {
        name: e.name, type: e.type, totalMarks: e.totalMarks, date: e.date,
        subjectId: subjects[e.subjectCode].id,
        semesterId: semId,
        createdById: admin.id,
      },
    });

    // Add results for relevant students
    const examStudents = e.subjectCode.startsWith("CMPN") ? cmpnAStudents : students.slice(e.subjectCode.startsWith("AI") ? 24 : 12, e.subjectCode.startsWith("AI") ? 30 : 18);
    for (const stu of examStudents) {
      const marks = Math.floor(Math.random() * (e.totalMarks * 0.4)) + Math.floor(e.totalMarks * 0.5);
      const pct = marks / e.totalMarks;
      const grade = pct >= 0.9 ? Grade.A_PLUS : pct >= 0.8 ? Grade.A : pct >= 0.7 ? Grade.B_PLUS : pct >= 0.6 ? Grade.B : pct >= 0.5 ? Grade.C : Grade.D;
      await prisma.result.create({
        data: {
          examId: exam.id,
          studentId: stu.id,
          subjectId: subjects[e.subjectCode].id,
          semesterId: semId,
          marksObtained: marks,
          grade,
        },
      });
    }
    console.log(`  ✅ ${e.name} — ${examStudents.length} results`);
  }

  // ══════════════════════════════════════════════════════════════════
  // 13. LEAVE APPLICATIONS
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📋 Creating leave applications...");

  const leaveData = [
    { userId: students[0]!.id, type: LeaveType.medical,    startDate: "2026-09-01", endDate: "2026-09-02", reason: "Fever and cold — doctor advised rest", status: ApprovalStatus.approved, approvedById: faculty["fac-cmpn-1"].id },
    { userId: students[1]!.id, type: LeaveType.personal,   startDate: "2026-09-05", endDate: "2026-09-05", reason: "Family function at hometown",         status: ApprovalStatus.pending },
    { userId: students[2]!.id, type: LeaveType.medical,    startDate: "2026-08-28", endDate: "2026-08-30", reason: "Dental surgery scheduled",             status: ApprovalStatus.approved, approvedById: faculty["fac-cmpn-2"].id },
    { userId: faculty["fac-it-1"].id, type: LeaveType.personal, startDate: "2026-09-10", endDate: "2026-09-10", reason: "Personal work", status: ApprovalStatus.pending },
    { userId: students[12]!.id, type: LeaveType.emergency, startDate: "2026-09-03", endDate: "2026-09-04", reason: "Food poisoning",                      status: ApprovalStatus.rejected },
  ];

  for (const l of leaveData) {
    await prisma.leaveApplication.create({
      data: {
        userId: l.userId, type: l.type, startDate: new Date(l.startDate), endDate: new Date(l.endDate),
        reason: l.reason, status: l.status, approvedById: l.approvedById,
      },
    });
  }
  console.log(`  ✅ ${leaveData.length} leave applications`);

  // ══════════════════════════════════════════════════════════════════
  // 14. ACADEMIC CALENDAR EVENTS
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📆 Creating academic calendar...");

  // Valid AcademicEventType: holiday, exam_period, event, seminar, workshop, sports
  const calendarData = [
    { title: "Independence Day",           startDate: "2026-08-15", endDate: "2026-08-15", type: AcademicEventType.holiday },
    { title: "Mid-Term Examinations",      startDate: "2026-08-25", endDate: "2026-09-05", type: AcademicEventType.exam_period },
    { title: "Ganesh Chaturthi",           startDate: "2026-09-07", endDate: "2026-09-07", type: AcademicEventType.holiday },
    { title: "Guest Lecture: AI in India", startDate: "2026-09-15", endDate: "2026-09-15", type: AcademicEventType.seminar },
    { title: "TechFest 2026",             startDate: "2026-10-01", endDate: "2026-10-03", type: AcademicEventType.event },
    { title: "Diwali Break",              startDate: "2026-10-20", endDate: "2026-10-25", type: AcademicEventType.holiday },
    { title: "Coding Workshop",           startDate: "2026-10-28", endDate: "2026-10-28", type: AcademicEventType.workshop },
    { title: "Sports Day",                startDate: "2026-11-05", endDate: "2026-11-06", type: AcademicEventType.sports },
    { title: "End-Sem Examinations",      startDate: "2026-11-15", endDate: "2026-11-30", type: AcademicEventType.exam_period },
  ];

  for (const e of calendarData) {
    await prisma.academicEvent.create({
      data: {
        title: e.title,
        startDate: new Date(e.startDate),
        endDate: new Date(e.endDate),
        type: e.type,
        description: e.title,
        createdById: admin.id,
      },
    });
  }
  console.log(`  ✅ ${calendarData.length} academic events`);

  // ══════════════════════════════════════════════════════════════════
  // 15. HOSTEL + ROOMS + ALLOCATIONS
  // ══════════════════════════════════════════════════════════════════
  console.log("\n🏠 Creating hostels...");

  // Hostel model: id, name, type, wardenId?, totalRooms
  const hostelBoys = await prisma.hostel.create({
    data: { id: "hostel-boys", name: "Vidyarthi Boys Hostel", type: HostelType.boys, totalRooms: 50 },
  });
  const hostelGirls = await prisma.hostel.create({
    data: { id: "hostel-girls", name: "Saraswati Girls Hostel", type: HostelType.girls, totalRooms: 40 },
  });

  // Rooms
  for (let floor = 1; floor <= 3; floor++) {
    for (let room = 1; room <= 5; room++) {
      const roomNo = `${floor}0${room}`;
      await prisma.hostelRoom.create({ data: { roomNumber: `B-${roomNo}`, floor, capacity: 3, hostelId: hostelBoys.id } });
      await prisma.hostelRoom.create({ data: { roomNumber: `G-${roomNo}`, floor, capacity: 2, hostelId: hostelGirls.id } });
    }
  }
  console.log("  ✅ 2 hostels, 30 rooms");

  // Allocate a few students (allocatedDate, not startDate)
  const boysRoom = await prisma.hostelRoom.findFirst({ where: { hostelId: hostelBoys.id } });
  const girlsRoom = await prisma.hostelRoom.findFirst({ where: { hostelId: hostelGirls.id } });
  if (boysRoom) {
    await prisma.hostelAllocation.create({ data: { studentId: students[0]!.id, roomId: boysRoom.id, allocatedDate: new Date("2026-07-15") } });
    await prisma.hostelAllocation.create({ data: { studentId: students[2]!.id, roomId: boysRoom.id, allocatedDate: new Date("2026-07-15") } });
  }
  if (girlsRoom) {
    await prisma.hostelAllocation.create({ data: { studentId: students[1]!.id, roomId: girlsRoom.id, allocatedDate: new Date("2026-07-15") } });
  }
  console.log("  ✅ 3 hostel allocations");

  // ══════════════════════════════════════════════════════════════════
  // 16. ANNOUNCEMENTS
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📢 Creating announcements...");

  // AnnouncementType: global, department, class, hostel
  // Announcement fields: title, content, type, targetId?, createdById, scheduledAt?, isPinned?
  const announcements = [
    { title: "Mid-Term Exam Schedule Released",      content: "The mid-term examination schedule for Sem 5 has been published. Please check the exam section for dates.", type: AnnouncementType.global },
    { title: "TechFest 2026 Registrations Open",     content: "Register for TechFest 2026 — Hackathon, Paper Presentation, Coding Contest, and more! Last date: Sep 25.", type: AnnouncementType.global, isPinned: true },
    { title: "Library Timing Extended",              content: "Library will remain open until 10 PM during exam period (Aug 25 - Sep 5).",                                type: AnnouncementType.global },
    { title: "Placement Drive — Infosys",            content: "Infosys campus placement drive on Oct 10. Eligible: CMPN, IT, AI students with 60%+ aggregate.",          type: AnnouncementType.global, isPinned: true },
    { title: "Sports Day — Oct 15",                  content: "Annual sports day on Oct 15. Events: Cricket, Football, Badminton, Athletics. Register with your class rep.", type: AnnouncementType.global },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({
      data: { title: a.title, content: a.content, type: a.type, isPinned: a.isPinned ?? false, createdById: admin.id },
    });
  }
  console.log(`  ✅ ${announcements.length} announcements`);

  // ══════════════════════════════════════════════════════════════════
  // 17. ACTIVITY LOG (recent activity for dashboard)
  // ══════════════════════════════════════════════════════════════════
  console.log("\n📊 Creating activity log...");

  const activityData = [
    { userId: admin.id,              action: ActivityAction.create, module: ActivityModule.department, description: "Created department: Computer Engineering" },
    { userId: admin.id,              action: ActivityAction.create, module: ActivityModule.department, description: "Created department: Information Technology" },
    { userId: admin.id,              action: ActivityAction.create, module: ActivityModule.department, description: "Created department: AI & Data Science" },
    { userId: faculty["fac-cmpn-1"].id, action: ActivityAction.create, module: ActivityModule.attendance, description: "Marked attendance for CMPN501 — Section A" },
    { userId: faculty["fac-it-1"].id,   action: ActivityAction.create, module: ActivityModule.attendance, description: "Marked attendance for IT501 — Section A" },
    { userId: admin.id,              action: ActivityAction.create, module: ActivityModule.exam,       description: "Created exam: DSA Mid-Term" },
    { userId: students[0]!.id,       action: ActivityAction.create, module: ActivityModule.leave,      description: "Applied for medical leave (Sep 1-2)" },
    { userId: admin.id,              action: ActivityAction.update, module: ActivityModule.student,    description: "Updated student records" },
  ];

  for (const a of activityData) {
    await prisma.activityLog.create({ data: a });
  }
  console.log(`  ✅ ${activityData.length} activity log entries`);

  // ══════════════════════════════════════════════════════════════════
  // DONE
  // ══════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("🎉 SEED COMPLETE!");
  console.log("═".repeat(60));
  console.log("\n📊 Summary:");
  console.log("  • 3 Departments: CMPN, IT, AIDS");
  console.log("  • 3 Programs (B.Tech, 4yr each)");
  console.log("  • 6 Batches, 8 Sections");
  console.log("  • 24 Semesters (1-8 per program)");
  console.log("  • 40 Subjects (14 CMPN + 13 IT + 13 AI — Sem 3 & Sem 5)");
  console.log("  • 1 Admin, 18 Faculty, 48 Students");
  console.log(`  • ${fsData.length} Faculty-Subject assignments (timetable ready!)`);
  console.log(`  • ${attCount} Attendance records`);
  console.log("  • 5 Exams with results");
  console.log("  • 5 Leave applications");
  console.log("  • 9 Academic calendar events");
  console.log("  • 2 Hostels, 30 rooms, 3 allocations");
  console.log("  • 5 Announcements");
  console.log("\n🔑 Login Credentials:");
  console.log("  Admin:   admin@college.com / password123");
  console.log("  Faculty: amit.verma@college.com / password123");
  console.log("  Student: aarav.sharma@student.college.com / password123");
  console.log("\n🤖 Timetable Auto-Generate:");
  console.log("  Ready! All 8 sections can auto-generate timetables:");
  console.log("  • 2023 batch → Sem 5 (CMPN-A, CMPN-B, IT-A, IT-B, AI-A)");
  console.log("  • 2024 batch → Sem 3 (CMPN-24A, IT-24A, AI-24A)");
  console.log("  CMPN-A & CMPN-B, IT-A & IT-B share faculty = cross-section conflict test!\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
