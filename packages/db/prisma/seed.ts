/**
 * ═══════════════════════════════════════════════════════════════════
 * UNIVERSITY LMS — FULL REALISTIC SEED
 * ═══════════════════════════════════════════════════════════════════
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
  ComplaintCategory,
  ComplaintStatus,
  ActivityAction,
  ActivityModule,
  Grade,
  Gender,
} from "@prisma/client";

// Use Better Auth's own API to create users — guarantees correct password hash
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
  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    // Use Better Auth's signUpEmail API — this creates user + account with proper hash
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: PASSWORD,
        name: data.name,
      },
    });

    if (!result?.user) {
      throw new Error(`Failed to create user: ${data.email}`);
    }

    // Update the user with all the extra LMS fields
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
  console.log("🌱 Seeding University LMS with realistic data...\n");

  // ═══════════════════════════════════════════════════════════════
  // 1. DEPARTMENTS
  // ═══════════════════════════════════════════════════════════════
  console.log("📚 Creating departments...");

  const deptData = [
    { id: "dept-cse", name: "Computer Science & Engineering",       code: "CSE", description: "Department of Computer Science & Engineering" },
    { id: "dept-me",  name: "Mechanical Engineering",               code: "ME",  description: "Department of Mechanical Engineering" },
    { id: "dept-ece", name: "Electronics & Communication Engineering", code: "ECE", description: "Department of Electronics & Communication" },
    { id: "dept-ce",  name: "Civil Engineering",                    code: "CE",  description: "Department of Civil Engineering" },
    { id: "dept-ee",  name: "Electrical Engineering",               code: "EE",  description: "Department of Electrical Engineering" },
  ];

  const depts: Record<string, any> = {};
  for (const d of deptData) {
    depts[d.code] = await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
    console.log(`  ✅ ${d.code} — ${d.name}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. PROGRAMS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🎓 Creating programs...");

  const progData = [
    { id: "prog-btech-cse", name: "B.Tech CSE", code: "BTECH-CSE", durationYears: 4, totalSemesters: 8, departmentId: depts.CSE.id },
    { id: "prog-btech-me",  name: "B.Tech ME",  code: "BTECH-ME",  durationYears: 4, totalSemesters: 8, departmentId: depts.ME.id },
    { id: "prog-btech-ece", name: "B.Tech ECE", code: "BTECH-ECE", durationYears: 4, totalSemesters: 8, departmentId: depts.ECE.id },
    { id: "prog-btech-ce",  name: "B.Tech CE",  code: "BTECH-CE",  durationYears: 4, totalSemesters: 8, departmentId: depts.CE.id },
    { id: "prog-btech-ee",  name: "B.Tech EE",  code: "BTECH-EE",  durationYears: 4, totalSemesters: 8, departmentId: depts.EE.id },
  ];

  const progs: Record<string, any> = {};
  for (const p of progData) {
    progs[p.code] = await prisma.program.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    console.log(`  ✅ ${p.name}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. BATCHES
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📅 Creating batches...");

  const batchData = [
    { id: "batch-cse-2023", name: "2023-2027", startYear: 2023, endYear: 2027, programId: progs["BTECH-CSE"].id },
    { id: "batch-cse-2024", name: "2024-2028", startYear: 2024, endYear: 2028, programId: progs["BTECH-CSE"].id },
    { id: "batch-me-2023",  name: "2023-2027", startYear: 2023, endYear: 2027, programId: progs["BTECH-ME"].id },
    { id: "batch-ece-2023", name: "2023-2027", startYear: 2023, endYear: 2027, programId: progs["BTECH-ECE"].id },
    { id: "batch-ce-2023",  name: "2023-2027", startYear: 2023, endYear: 2027, programId: progs["BTECH-CE"].id },
    { id: "batch-ee-2024",  name: "2024-2028", startYear: 2024, endYear: 2028, programId: progs["BTECH-EE"].id },
  ];

  const batches: Record<string, any> = {};
  for (const b of batchData) {
    batches[b.id] = await prisma.batch.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
    console.log(`  ✅ ${b.name} (${b.id})`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. SECTIONS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🏫 Creating sections...");

  const sectionData = [
    { id: "sec-cse23-A", name: "A", batchId: batches["batch-cse-2023"].id },
    { id: "sec-cse23-B", name: "B", batchId: batches["batch-cse-2023"].id },
    { id: "sec-cse24-A", name: "A", batchId: batches["batch-cse-2024"].id },
    { id: "sec-me23-A",  name: "A", batchId: batches["batch-me-2023"].id },
    { id: "sec-ece23-A", name: "A", batchId: batches["batch-ece-2023"].id },
    { id: "sec-ce23-A",  name: "A", batchId: batches["batch-ce-2023"].id },
    { id: "sec-ee24-A",  name: "A", batchId: batches["batch-ee-2024"].id },
  ];

  const sections: Record<string, any> = {};
  for (const s of sectionData) {
    sections[s.id] = await prisma.section.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
    console.log(`  ✅ Section ${s.name} (${s.id})`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. SEMESTERS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📖 Creating semesters...");

  const semesters: Record<string, any> = {};
  for (const prog of Object.values(progs)) {
    for (let i = 1; i <= 8; i++) {
      const key = `${prog.code}-sem${i}`;
      const existing = await prisma.semester.findFirst({
        where: { number: i, programId: prog.id },
      });
      semesters[key] = existing ?? await prisma.semester.create({
        data: { number: i, programId: prog.id, isCurrent: i === 5 },
      });
    }
  }
  console.log("  ✅ Semesters 1-8 for all programs (current: 5th)");

  // ═══════════════════════════════════════════════════════════════
  // 6. SUBJECTS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📝 Creating subjects...");

  const subjectData = [
    // CSE Semester 5
    { id: "sub-cs501", name: "Data Structures & Algorithms",       code: "CS501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    { id: "sub-cs502", name: "Operating Systems",                  code: "CS502", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    { id: "sub-cs503", name: "Database Management Systems",        code: "CS503", credits: 3, type: SubjectType.theory,    semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    { id: "sub-cs504", name: "Computer Networks",                  code: "CS504", credits: 3, type: SubjectType.theory,    semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    { id: "sub-cs505", name: "Software Engineering",               code: "CS505", credits: 3, type: SubjectType.theory,    semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    { id: "sub-cs591", name: "DSA Lab",                            code: "CS591", credits: 2, type: SubjectType.practical, semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    { id: "sub-cs592", name: "DBMS Lab",                           code: "CS592", credits: 2, type: SubjectType.practical, semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    { id: "sub-cs506", name: "Machine Learning Elective",          code: "CS506", credits: 3, type: SubjectType.elective,  semKey: "BTECH-CSE-sem5", deptCode: "CSE" },
    // ME Semester 5
    { id: "sub-me501", name: "Thermodynamics II",                  code: "ME501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-ME-sem5",  deptCode: "ME" },
    { id: "sub-me502", name: "Fluid Mechanics",                    code: "ME502", credits: 4, type: SubjectType.theory,    semKey: "BTECH-ME-sem5",  deptCode: "ME" },
    { id: "sub-me503", name: "Manufacturing Processes",            code: "ME503", credits: 3, type: SubjectType.theory,    semKey: "BTECH-ME-sem5",  deptCode: "ME" },
    { id: "sub-me504", name: "Theory of Machines",                 code: "ME504", credits: 3, type: SubjectType.theory,    semKey: "BTECH-ME-sem5",  deptCode: "ME" },
    { id: "sub-me591", name: "Thermal Lab",                        code: "ME591", credits: 2, type: SubjectType.practical, semKey: "BTECH-ME-sem5",  deptCode: "ME" },
    // ECE Semester 5
    { id: "sub-ec501", name: "Digital Signal Processing",          code: "EC501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-ECE-sem5", deptCode: "ECE" },
    { id: "sub-ec502", name: "VLSI Design",                       code: "EC502", credits: 4, type: SubjectType.theory,    semKey: "BTECH-ECE-sem5", deptCode: "ECE" },
    { id: "sub-ec503", name: "Microprocessors & Microcontrollers", code: "EC503", credits: 3, type: SubjectType.theory,    semKey: "BTECH-ECE-sem5", deptCode: "ECE" },
    { id: "sub-ec504", name: "Antenna & Wave Propagation",         code: "EC504", credits: 3, type: SubjectType.theory,    semKey: "BTECH-ECE-sem5", deptCode: "ECE" },
    { id: "sub-ec591", name: "DSP Lab",                            code: "EC591", credits: 2, type: SubjectType.practical, semKey: "BTECH-ECE-sem5", deptCode: "ECE" },
    // CE Semester 5
    { id: "sub-ce501", name: "Structural Analysis",                code: "CE501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-CE-sem5",  deptCode: "CE" },
    { id: "sub-ce502", name: "Geotechnical Engineering",           code: "CE502", credits: 3, type: SubjectType.theory,    semKey: "BTECH-CE-sem5",  deptCode: "CE" },
    { id: "sub-ce503", name: "Environmental Engineering",          code: "CE503", credits: 3, type: SubjectType.theory,    semKey: "BTECH-CE-sem5",  deptCode: "CE" },
    // EE Semester 5
    { id: "sub-ee501", name: "Power Systems",                     code: "EE501", credits: 4, type: SubjectType.theory,    semKey: "BTECH-EE-sem5",  deptCode: "EE" },
    { id: "sub-ee502", name: "Control Systems",                   code: "EE502", credits: 4, type: SubjectType.theory,    semKey: "BTECH-EE-sem5",  deptCode: "EE" },
    { id: "sub-ee503", name: "Electrical Machines",               code: "EE503", credits: 3, type: SubjectType.theory,    semKey: "BTECH-EE-sem5",  deptCode: "EE" },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectData) {
    subjects[s.code] = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: {
        id: s.id, name: s.name, code: s.code, credits: s.credits, type: s.type,
        semesterId: semesters[s.semKey].id, departmentId: depts[s.deptCode].id,
      },
    });
    console.log(`  ✅ ${s.code} — ${s.name}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 7. USERS — ADMINS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n👑 Creating admin accounts...");

  const admin1 = await createUser({ id: "user-admin-1", email: "admin@college.com", name: "Dr. Rajesh Kumar", role: "admin", phone: "9876543210", gender: Gender.male, employeeId: "ADM001", departmentId: depts.CSE.id });
  console.log(`  ✅ admin@college.com — Dr. Rajesh Kumar (Super Admin)`);

  const admin2 = await createUser({ id: "user-admin-2", email: "registrar@college.com", name: "Mrs. Priya Sharma", role: "admin", phone: "9876543211", gender: Gender.female, employeeId: "ADM002" });
  console.log(`  ✅ registrar@college.com — Mrs. Priya Sharma (Registrar)`);

  // ═══════════════════════════════════════════════════════════════
  // 8. USERS — FACULTY
  // ═══════════════════════════════════════════════════════════════
  console.log("\n👨‍🏫 Creating faculty accounts...");

  const facultyData = [
    { id: "user-fac-1", email: "amit.verma@college.com",     name: "Prof. Amit Verma",    phone: "9800000001", gender: Gender.male,   employeeId: "FAC001", deptCode: "CSE" },
    { id: "user-fac-2", email: "sneha.patil@college.com",    name: "Dr. Sneha Patil",     phone: "9800000002", gender: Gender.female, employeeId: "FAC002", deptCode: "CSE" },
    { id: "user-fac-3", email: "ravi.krishnan@college.com",  name: "Prof. Ravi Krishnan", phone: "9800000003", gender: Gender.male,   employeeId: "FAC003", deptCode: "CSE" },
    { id: "user-fac-4", email: "meena.iyer@college.com",     name: "Dr. Meena Iyer",      phone: "9800000004", gender: Gender.female, employeeId: "FAC004", deptCode: "ME" },
    { id: "user-fac-5", email: "suresh.reddy@college.com",   name: "Prof. Suresh Reddy",  phone: "9800000005", gender: Gender.male,   employeeId: "FAC005", deptCode: "ME" },
    { id: "user-fac-6", email: "anita.desai@college.com",    name: "Dr. Anita Desai",     phone: "9800000006", gender: Gender.female, employeeId: "FAC006", deptCode: "ECE" },
    { id: "user-fac-7", email: "kiran.joshi@college.com",    name: "Prof. Kiran Joshi",   phone: "9800000007", gender: Gender.male,   employeeId: "FAC007", deptCode: "ECE" },
    { id: "user-fac-8", email: "deepak.singh@college.com",   name: "Dr. Deepak Singh",    phone: "9800000008", gender: Gender.male,   employeeId: "FAC008", deptCode: "CE" },
    { id: "user-fac-9", email: "pooja.nair@college.com",     name: "Prof. Pooja Nair",    phone: "9800000009", gender: Gender.female, employeeId: "FAC009", deptCode: "EE" },
    { id: "user-fac-10", email: "vikas.gupta@college.com",   name: "Dr. Vikas Gupta",     phone: "9800000010", gender: Gender.male,   employeeId: "FAC010", deptCode: "CSE" },
    { id: "user-fac-11", email: "lakshmi.pillai@college.com", name: "Prof. Lakshmi Pillai", phone: "9800000011", gender: Gender.female, employeeId: "FAC011", deptCode: "CE" },
    { id: "user-fac-12", email: "manoj.tiwari@college.com",  name: "Prof. Manoj Tiwari",  phone: "9800000012", gender: Gender.male,   employeeId: "FAC012", deptCode: "EE" },
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

  // ═══════════════════════════════════════════════════════════════
  // 9. USERS — STUDENTS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n👨‍🎓 Creating student accounts...");

  const studentData = [
    // CSE 2023 Section A (6 students)
    { id: "user-stu-01", email: "rahul.sharma@student.com",    name: "Rahul Sharma",    gender: Gender.male,   enrollmentNo: "CSE2023001", guardianName: "Mr. Vijay Sharma",   guardianPhone: "9700000001", batchId: "batch-cse-2023", sectionId: "sec-cse23-A", deptCode: "CSE" },
    { id: "user-stu-02", email: "priya.singh@student.com",     name: "Priya Singh",     gender: Gender.female, enrollmentNo: "CSE2023002", guardianName: "Mr. Rakesh Singh",   guardianPhone: "9700000002", batchId: "batch-cse-2023", sectionId: "sec-cse23-A", deptCode: "CSE" },
    { id: "user-stu-03", email: "arjun.patel@student.com",     name: "Arjun Patel",     gender: Gender.male,   enrollmentNo: "CSE2023003", guardianName: "Mr. Sunil Patel",    guardianPhone: "9700000003", batchId: "batch-cse-2023", sectionId: "sec-cse23-A", deptCode: "CSE" },
    { id: "user-stu-04", email: "neha.gupta@student.com",      name: "Neha Gupta",      gender: Gender.female, enrollmentNo: "CSE2023004", guardianName: "Mr. Ashok Gupta",    guardianPhone: "9700000004", batchId: "batch-cse-2023", sectionId: "sec-cse23-A", deptCode: "CSE" },
    { id: "user-stu-05", email: "vikram.joshi@student.com",    name: "Vikram Joshi",    gender: Gender.male,   enrollmentNo: "CSE2023005", guardianName: "Mr. Ramesh Joshi",   guardianPhone: "9700000005", batchId: "batch-cse-2023", sectionId: "sec-cse23-A", deptCode: "CSE" },
    { id: "user-stu-06", email: "sana.khan@student.com",       name: "Sana Khan",       gender: Gender.female, enrollmentNo: "CSE2023006", guardianName: "Mr. Irfan Khan",     guardianPhone: "9700000006", batchId: "batch-cse-2023", sectionId: "sec-cse23-A", deptCode: "CSE" },
    // CSE 2023 Section B (6 students)
    { id: "user-stu-07", email: "ananya.mishra@student.com",   name: "Ananya Mishra",   gender: Gender.female, enrollmentNo: "CSE2023007", guardianName: "Mr. Sanjay Mishra",  guardianPhone: "9700000007", batchId: "batch-cse-2023", sectionId: "sec-cse23-B", deptCode: "CSE" },
    { id: "user-stu-08", email: "rohit.kumar@student.com",     name: "Rohit Kumar",     gender: Gender.male,   enrollmentNo: "CSE2023008", guardianName: "Mr. Dinesh Kumar",   guardianPhone: "9700000008", batchId: "batch-cse-2023", sectionId: "sec-cse23-B", deptCode: "CSE" },
    { id: "user-stu-09", email: "kavita.reddy@student.com",    name: "Kavita Reddy",    gender: Gender.female, enrollmentNo: "CSE2023009", guardianName: "Mr. Mohan Reddy",    guardianPhone: "9700000009", batchId: "batch-cse-2023", sectionId: "sec-cse23-B", deptCode: "CSE" },
    { id: "user-stu-10", email: "aditya.nair@student.com",     name: "Aditya Nair",     gender: Gender.male,   enrollmentNo: "CSE2023010", guardianName: "Mr. Gopal Nair",     guardianPhone: "9700000010", batchId: "batch-cse-2023", sectionId: "sec-cse23-B", deptCode: "CSE" },
    { id: "user-stu-11", email: "divya.iyer@student.com",      name: "Divya Iyer",      gender: Gender.female, enrollmentNo: "CSE2023011", guardianName: "Mr. Krishna Iyer",   guardianPhone: "9700000011", batchId: "batch-cse-2023", sectionId: "sec-cse23-B", deptCode: "CSE" },
    { id: "user-stu-12", email: "harsh.agarwal@student.com",   name: "Harsh Agarwal",   gender: Gender.male,   enrollmentNo: "CSE2023012", guardianName: "Mr. Pawan Agarwal",  guardianPhone: "9700000012", batchId: "batch-cse-2023", sectionId: "sec-cse23-B", deptCode: "CSE" },
    // CSE 2024 (4 students)
    { id: "user-stu-13", email: "siddharth.mehta@student.com", name: "Siddharth Mehta", gender: Gender.male,   enrollmentNo: "CSE2024001", guardianName: "Mr. Paresh Mehta",   guardianPhone: "9700000013", batchId: "batch-cse-2024", sectionId: "sec-cse24-A", deptCode: "CSE" },
    { id: "user-stu-14", email: "pooja.verma@student.com",     name: "Pooja Verma",     gender: Gender.female, enrollmentNo: "CSE2024002", guardianName: "Mr. Anil Verma",     guardianPhone: "9700000014", batchId: "batch-cse-2024", sectionId: "sec-cse24-A", deptCode: "CSE" },
    { id: "user-stu-15", email: "akash.rao@student.com",       name: "Akash Rao",       gender: Gender.male,   enrollmentNo: "CSE2024003", guardianName: "Mr. Venkat Rao",     guardianPhone: "9700000015", batchId: "batch-cse-2024", sectionId: "sec-cse24-A", deptCode: "CSE" },
    { id: "user-stu-16", email: "meera.pillai@student.com",    name: "Meera Pillai",    gender: Gender.female, enrollmentNo: "CSE2024004", guardianName: "Mr. Suresh Pillai",  guardianPhone: "9700000016", batchId: "batch-cse-2024", sectionId: "sec-cse24-A", deptCode: "CSE" },
    // ME (5 students)
    { id: "user-stu-17", email: "manish.tiwari@student.com",  name: "Manish Tiwari",   gender: Gender.male,   enrollmentNo: "ME2023001",  guardianName: "Mr. Suresh Tiwari",  guardianPhone: "9700000017", batchId: "batch-me-2023",  sectionId: "sec-me23-A",  deptCode: "ME" },
    { id: "user-stu-18", email: "swati.pandey@student.com",   name: "Swati Pandey",    gender: Gender.female, enrollmentNo: "ME2023002",  guardianName: "Mr. Rajiv Pandey",   guardianPhone: "9700000018", batchId: "batch-me-2023",  sectionId: "sec-me23-A",  deptCode: "ME" },
    { id: "user-stu-19", email: "rajat.saxena@student.com",   name: "Rajat Saxena",    gender: Gender.male,   enrollmentNo: "ME2023003",  guardianName: "Mr. Prakash Saxena", guardianPhone: "9700000019", batchId: "batch-me-2023",  sectionId: "sec-me23-A",  deptCode: "ME" },
    { id: "user-stu-20", email: "nisha.bhat@student.com",     name: "Nisha Bhat",      gender: Gender.female, enrollmentNo: "ME2023004",  guardianName: "Mr. Ganesh Bhat",    guardianPhone: "9700000020", batchId: "batch-me-2023",  sectionId: "sec-me23-A",  deptCode: "ME" },
    { id: "user-stu-21", email: "virat.thakur@student.com",   name: "Virat Thakur",    gender: Gender.male,   enrollmentNo: "ME2023005",  guardianName: "Mr. Rajan Thakur",   guardianPhone: "9700000021", batchId: "batch-me-2023",  sectionId: "sec-me23-A",  deptCode: "ME" },
    // ECE (5 students)
    { id: "user-stu-22", email: "megha.das@student.com",      name: "Megha Das",       gender: Gender.female, enrollmentNo: "ECE2023001", guardianName: "Mr. Tapan Das",      guardianPhone: "9700000022", batchId: "batch-ece-2023", sectionId: "sec-ece23-A", deptCode: "ECE" },
    { id: "user-stu-23", email: "aman.chauhan@student.com",   name: "Aman Chauhan",    gender: Gender.male,   enrollmentNo: "ECE2023002", guardianName: "Mr. Vikash Chauhan", guardianPhone: "9700000023", batchId: "batch-ece-2023", sectionId: "sec-ece23-A", deptCode: "ECE" },
    { id: "user-stu-24", email: "ritika.bose@student.com",    name: "Ritika Bose",     gender: Gender.female, enrollmentNo: "ECE2023003", guardianName: "Mr. Samir Bose",     guardianPhone: "9700000024", batchId: "batch-ece-2023", sectionId: "sec-ece23-A", deptCode: "ECE" },
    { id: "user-stu-25", email: "tanmay.sinha@student.com",   name: "Tanmay Sinha",    gender: Gender.male,   enrollmentNo: "ECE2023004", guardianName: "Mr. Pramod Sinha",   guardianPhone: "9700000025", batchId: "batch-ece-2023", sectionId: "sec-ece23-A", deptCode: "ECE" },
    { id: "user-stu-26", email: "shreya.menon@student.com",   name: "Shreya Menon",    gender: Gender.female, enrollmentNo: "ECE2023005", guardianName: "Mr. Ajay Menon",     guardianPhone: "9700000026", batchId: "batch-ece-2023", sectionId: "sec-ece23-A", deptCode: "ECE" },
    // CE (3 students)
    { id: "user-stu-27", email: "gaurav.choudhary@student.com", name: "Gaurav Choudhary", gender: Gender.male,   enrollmentNo: "CE2023001", guardianName: "Mr. Ram Choudhary", guardianPhone: "9700000027", batchId: "batch-ce-2023", sectionId: "sec-ce23-A", deptCode: "CE" },
    { id: "user-stu-28", email: "pallavi.jain@student.com",     name: "Pallavi Jain",     gender: Gender.female, enrollmentNo: "CE2023002", guardianName: "Mr. Deepak Jain",   guardianPhone: "9700000028", batchId: "batch-ce-2023", sectionId: "sec-ce23-A", deptCode: "CE" },
    { id: "user-stu-29", email: "nikhil.bhatt@student.com",     name: "Nikhil Bhatt",     gender: Gender.male,   enrollmentNo: "CE2023003", guardianName: "Mr. Rajesh Bhatt",  guardianPhone: "9700000029", batchId: "batch-ce-2023", sectionId: "sec-ce23-A", deptCode: "CE" },
    // EE (3 students)
    { id: "user-stu-30", email: "ritu.dey@student.com",      name: "Ritu Dey",       gender: Gender.female, enrollmentNo: "EE2024001", guardianName: "Mr. Partha Dey",    guardianPhone: "9700000030", batchId: "batch-ee-2024", sectionId: "sec-ee24-A", deptCode: "EE" },
    { id: "user-stu-31", email: "kunal.banerjee@student.com", name: "Kunal Banerjee", gender: Gender.male,   enrollmentNo: "EE2024002", guardianName: "Mr. Amit Banerjee", guardianPhone: "9700000031", batchId: "batch-ee-2024", sectionId: "sec-ee24-A", deptCode: "EE" },
    { id: "user-stu-32", email: "aparna.nambiar@student.com", name: "Aparna Nambiar", gender: Gender.female, enrollmentNo: "EE2024003", guardianName: "Mr. Vijay Nambiar", guardianPhone: "9700000032", batchId: "batch-ee-2024", sectionId: "sec-ee24-A", deptCode: "EE" },
  ];

  const students: Record<string, any> = {};
  for (const s of studentData) {
    students[s.id] = await createUser({
      id: s.id, email: s.email, name: s.name, role: "student",
      gender: s.gender, enrollmentNo: s.enrollmentNo,
      guardianName: s.guardianName, guardianPhone: s.guardianPhone,
      departmentId: depts[s.deptCode].id,
      batchId: batches[s.batchId].id,
      sectionId: sections[s.sectionId].id,
    });
    console.log(`  ✅ ${s.email} — ${s.name} (${s.deptCode} ${s.enrollmentNo})`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 10. USERS — WARDENS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🏠 Creating warden accounts...");

  const warden1 = await createUser({ id: "user-warden-1", email: "warden.boys@college.com", name: "Mr. Ramesh Yadav", role: "warden", phone: "9800100001", gender: Gender.male, employeeId: "WRD001" });
  console.log(`  ✅ warden.boys@college.com — Mr. Ramesh Yadav`);

  const warden2 = await createUser({ id: "user-warden-2", email: "warden.girls@college.com", name: "Mrs. Sunita Devi", role: "warden", phone: "9800100002", gender: Gender.female, employeeId: "WRD002" });
  console.log(`  ✅ warden.girls@college.com — Mrs. Sunita Devi`);

  // ═══════════════════════════════════════════════════════════════
  // 11. RESOLVE USER IDS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🔗 Resolving user IDs from database...");

  const allFaculty = await prisma.user.findMany({ where: { role: "faculty" } });
  const facByEmail: Record<string, string> = {};
  for (const f of allFaculty) facByEmail[f.email] = f.id;

  const allStudents = await prisma.user.findMany({ where: { role: "student" } });
  const stuByEmail: Record<string, string> = {};
  for (const s of allStudents) stuByEmail[s.email] = s.id;

  const allAdmins = await prisma.user.findMany({ where: { role: "admin" } });
  const adminByEmail: Record<string, string> = {};
  for (const a of allAdmins) adminByEmail[a.email] = a.id;

  const allWardens = await prisma.user.findMany({ where: { role: "warden" } });
  const wardenByEmail: Record<string, string> = {};
  for (const w of allWardens) wardenByEmail[w.email] = w.id;
  console.log(`  ✅ Resolved ${allFaculty.length} faculty, ${allStudents.length} students, ${allAdmins.length} admins, ${allWardens.length} wardens`);

  // ═══════════════════════════════════════════════════════════════
  // 12. FACULTY-SUBJECT MAPPINGS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🔗 Creating faculty-subject mappings...");

  const fsMappings = [
    // CSE Section A
    { facEmail: "amit.verma@college.com",    subjectCode: "CS501", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    { facEmail: "amit.verma@college.com",    subjectCode: "CS591", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    { facEmail: "sneha.patil@college.com",   subjectCode: "CS502", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    { facEmail: "sneha.patil@college.com",   subjectCode: "CS503", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    { facEmail: "ravi.krishnan@college.com", subjectCode: "CS504", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    { facEmail: "ravi.krishnan@college.com", subjectCode: "CS505", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    { facEmail: "vikas.gupta@college.com",   subjectCode: "CS506", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    { facEmail: "sneha.patil@college.com",   subjectCode: "CS592", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-A" },
    // CSE Section B
    { facEmail: "ravi.krishnan@college.com", subjectCode: "CS501", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-B" },
    { facEmail: "amit.verma@college.com",    subjectCode: "CS502", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-B" },
    { facEmail: "vikas.gupta@college.com",   subjectCode: "CS503", semKey: "BTECH-CSE-sem5", sectionId: "sec-cse23-B" },
    // ME
    { facEmail: "meena.iyer@college.com",    subjectCode: "ME501", semKey: "BTECH-ME-sem5",  sectionId: "sec-me23-A" },
    { facEmail: "meena.iyer@college.com",    subjectCode: "ME502", semKey: "BTECH-ME-sem5",  sectionId: "sec-me23-A" },
    { facEmail: "suresh.reddy@college.com",  subjectCode: "ME503", semKey: "BTECH-ME-sem5",  sectionId: "sec-me23-A" },
    { facEmail: "suresh.reddy@college.com",  subjectCode: "ME504", semKey: "BTECH-ME-sem5",  sectionId: "sec-me23-A" },
    { facEmail: "meena.iyer@college.com",    subjectCode: "ME591", semKey: "BTECH-ME-sem5",  sectionId: "sec-me23-A" },
    // ECE
    { facEmail: "anita.desai@college.com",   subjectCode: "EC501", semKey: "BTECH-ECE-sem5", sectionId: "sec-ece23-A" },
    { facEmail: "anita.desai@college.com",   subjectCode: "EC502", semKey: "BTECH-ECE-sem5", sectionId: "sec-ece23-A" },
    { facEmail: "kiran.joshi@college.com",   subjectCode: "EC503", semKey: "BTECH-ECE-sem5", sectionId: "sec-ece23-A" },
    { facEmail: "kiran.joshi@college.com",   subjectCode: "EC504", semKey: "BTECH-ECE-sem5", sectionId: "sec-ece23-A" },
    { facEmail: "anita.desai@college.com",   subjectCode: "EC591", semKey: "BTECH-ECE-sem5", sectionId: "sec-ece23-A" },
    // CE
    { facEmail: "deepak.singh@college.com",  subjectCode: "CE501", semKey: "BTECH-CE-sem5",  sectionId: "sec-ce23-A" },
    { facEmail: "deepak.singh@college.com",  subjectCode: "CE502", semKey: "BTECH-CE-sem5",  sectionId: "sec-ce23-A" },
    { facEmail: "lakshmi.pillai@college.com", subjectCode: "CE503", semKey: "BTECH-CE-sem5",  sectionId: "sec-ce23-A" },
    // EE
    { facEmail: "pooja.nair@college.com",    subjectCode: "EE501", semKey: "BTECH-EE-sem5",  sectionId: "sec-ee24-A" },
    { facEmail: "pooja.nair@college.com",    subjectCode: "EE502", semKey: "BTECH-EE-sem5",  sectionId: "sec-ee24-A" },
    { facEmail: "manoj.tiwari@college.com",  subjectCode: "EE503", semKey: "BTECH-EE-sem5",  sectionId: "sec-ee24-A" },
  ];

  for (const m of fsMappings) {
    const facId = facByEmail[m.facEmail]!;
    const sub = subjects[m.subjectCode];
    await prisma.facultySubject.upsert({
      where: {
        facultyId_subjectId_semesterId_sectionId: {
          facultyId: facId, subjectId: sub.id,
          semesterId: semesters[m.semKey].id, sectionId: sections[m.sectionId].id,
        },
      },
      update: {},
      create: {
        facultyId: facId, subjectId: sub.id,
        semesterId: semesters[m.semKey].id, sectionId: sections[m.sectionId].id,
      },
    });
  }
  console.log(`  ✅ ${fsMappings.length} faculty-subject mappings created`);

  // ═══════════════════════════════════════════════════════════════
  // 13. TIMETABLE
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🗓️ Creating timetable...");

  const ttSlots = [
    // CSE Section A — full week
    { day: 0, start: "09:00", end: "10:00", sub: "CS501", facEmail: "amit.verma@college.com",    sec: "sec-cse23-A", room: "Room 301" },
    { day: 0, start: "10:00", end: "11:00", sub: "CS502", facEmail: "sneha.patil@college.com",   sec: "sec-cse23-A", room: "Room 301" },
    { day: 0, start: "11:15", end: "12:15", sub: "CS503", facEmail: "sneha.patil@college.com",   sec: "sec-cse23-A", room: "Room 301" },
    { day: 0, start: "14:00", end: "15:00", sub: "CS504", facEmail: "ravi.krishnan@college.com", sec: "sec-cse23-A", room: "Room 302" },
    { day: 0, start: "15:00", end: "16:00", sub: "CS506", facEmail: "vikas.gupta@college.com",   sec: "sec-cse23-A", room: "Room 302" },
    { day: 1, start: "09:00", end: "10:00", sub: "CS505", facEmail: "ravi.krishnan@college.com", sec: "sec-cse23-A", room: "Room 301" },
    { day: 1, start: "10:00", end: "11:00", sub: "CS501", facEmail: "amit.verma@college.com",    sec: "sec-cse23-A", room: "Room 301" },
    { day: 1, start: "14:00", end: "16:00", sub: "CS591", facEmail: "amit.verma@college.com",    sec: "sec-cse23-A", room: "Lab A1" },
    { day: 2, start: "09:00", end: "10:00", sub: "CS502", facEmail: "sneha.patil@college.com",   sec: "sec-cse23-A", room: "Room 301" },
    { day: 2, start: "10:00", end: "11:00", sub: "CS504", facEmail: "ravi.krishnan@college.com", sec: "sec-cse23-A", room: "Room 301" },
    { day: 2, start: "14:00", end: "16:00", sub: "CS592", facEmail: "sneha.patil@college.com",   sec: "sec-cse23-A", room: "Lab A2" },
    { day: 3, start: "09:00", end: "10:00", sub: "CS503", facEmail: "sneha.patil@college.com",   sec: "sec-cse23-A", room: "Room 301" },
    { day: 3, start: "10:00", end: "11:00", sub: "CS505", facEmail: "ravi.krishnan@college.com", sec: "sec-cse23-A", room: "Room 301" },
    { day: 3, start: "11:15", end: "12:15", sub: "CS501", facEmail: "amit.verma@college.com",    sec: "sec-cse23-A", room: "Room 301" },
    { day: 4, start: "09:00", end: "10:00", sub: "CS504", facEmail: "ravi.krishnan@college.com", sec: "sec-cse23-A", room: "Room 302" },
    { day: 4, start: "10:00", end: "11:00", sub: "CS502", facEmail: "sneha.patil@college.com",   sec: "sec-cse23-A", room: "Room 301" },
    { day: 4, start: "11:15", end: "12:15", sub: "CS505", facEmail: "ravi.krishnan@college.com", sec: "sec-cse23-A", room: "Room 301" },
    { day: 4, start: "14:00", end: "15:00", sub: "CS506", facEmail: "vikas.gupta@college.com",   sec: "sec-cse23-A", room: "Room 303" },
    // ME Section A
    { day: 0, start: "09:00", end: "10:00", sub: "ME501", facEmail: "meena.iyer@college.com",    sec: "sec-me23-A",  room: "Room 201" },
    { day: 0, start: "10:00", end: "11:00", sub: "ME502", facEmail: "meena.iyer@college.com",    sec: "sec-me23-A",  room: "Room 201" },
    { day: 1, start: "09:00", end: "10:00", sub: "ME503", facEmail: "suresh.reddy@college.com",  sec: "sec-me23-A",  room: "Room 202" },
    { day: 1, start: "10:00", end: "11:00", sub: "ME504", facEmail: "suresh.reddy@college.com",  sec: "sec-me23-A",  room: "Room 202" },
    { day: 2, start: "09:00", end: "10:00", sub: "ME501", facEmail: "meena.iyer@college.com",    sec: "sec-me23-A",  room: "Room 201" },
    { day: 2, start: "14:00", end: "16:00", sub: "ME591", facEmail: "meena.iyer@college.com",    sec: "sec-me23-A",  room: "Thermal Lab" },
    { day: 3, start: "09:00", end: "10:00", sub: "ME502", facEmail: "meena.iyer@college.com",    sec: "sec-me23-A",  room: "Room 201" },
    { day: 3, start: "10:00", end: "11:00", sub: "ME503", facEmail: "suresh.reddy@college.com",  sec: "sec-me23-A",  room: "Room 202" },
    { day: 4, start: "09:00", end: "10:00", sub: "ME504", facEmail: "suresh.reddy@college.com",  sec: "sec-me23-A",  room: "Room 202" },
    // ECE Section A
    { day: 0, start: "09:00", end: "10:00", sub: "EC501", facEmail: "anita.desai@college.com",   sec: "sec-ece23-A", room: "Room 401" },
    { day: 0, start: "10:00", end: "11:00", sub: "EC502", facEmail: "anita.desai@college.com",   sec: "sec-ece23-A", room: "Room 401" },
    { day: 1, start: "09:00", end: "10:00", sub: "EC503", facEmail: "kiran.joshi@college.com",   sec: "sec-ece23-A", room: "Room 402" },
    { day: 1, start: "10:00", end: "11:00", sub: "EC504", facEmail: "kiran.joshi@college.com",   sec: "sec-ece23-A", room: "Room 402" },
    { day: 2, start: "09:00", end: "10:00", sub: "EC501", facEmail: "anita.desai@college.com",   sec: "sec-ece23-A", room: "Room 401" },
    { day: 2, start: "14:00", end: "16:00", sub: "EC591", facEmail: "anita.desai@college.com",   sec: "sec-ece23-A", room: "DSP Lab" },
    { day: 3, start: "09:00", end: "10:00", sub: "EC502", facEmail: "anita.desai@college.com",   sec: "sec-ece23-A", room: "Room 401" },
    { day: 3, start: "10:00", end: "11:00", sub: "EC503", facEmail: "kiran.joshi@college.com",   sec: "sec-ece23-A", room: "Room 402" },
    { day: 4, start: "09:00", end: "10:00", sub: "EC504", facEmail: "kiran.joshi@college.com",   sec: "sec-ece23-A", room: "Room 402" },
    // CE Section A
    { day: 0, start: "09:00", end: "10:00", sub: "CE501", facEmail: "deepak.singh@college.com",  sec: "sec-ce23-A",  room: "Room 501" },
    { day: 0, start: "10:00", end: "11:00", sub: "CE502", facEmail: "deepak.singh@college.com",  sec: "sec-ce23-A",  room: "Room 501" },
    { day: 1, start: "09:00", end: "10:00", sub: "CE503", facEmail: "lakshmi.pillai@college.com", sec: "sec-ce23-A",  room: "Room 502" },
    { day: 2, start: "09:00", end: "10:00", sub: "CE501", facEmail: "deepak.singh@college.com",  sec: "sec-ce23-A",  room: "Room 501" },
    { day: 3, start: "09:00", end: "10:00", sub: "CE502", facEmail: "deepak.singh@college.com",  sec: "sec-ce23-A",  room: "Room 501" },
    { day: 4, start: "09:00", end: "10:00", sub: "CE503", facEmail: "lakshmi.pillai@college.com", sec: "sec-ce23-A",  room: "Room 502" },
    // EE Section A
    { day: 0, start: "09:00", end: "10:00", sub: "EE501", facEmail: "pooja.nair@college.com",    sec: "sec-ee24-A",  room: "Room 601" },
    { day: 0, start: "10:00", end: "11:00", sub: "EE502", facEmail: "pooja.nair@college.com",    sec: "sec-ee24-A",  room: "Room 601" },
    { day: 1, start: "09:00", end: "10:00", sub: "EE503", facEmail: "manoj.tiwari@college.com",  sec: "sec-ee24-A",  room: "Room 602" },
    { day: 2, start: "09:00", end: "10:00", sub: "EE501", facEmail: "pooja.nair@college.com",    sec: "sec-ee24-A",  room: "Room 601" },
    { day: 3, start: "09:00", end: "10:00", sub: "EE502", facEmail: "pooja.nair@college.com",    sec: "sec-ee24-A",  room: "Room 601" },
    { day: 4, start: "09:00", end: "10:00", sub: "EE503", facEmail: "manoj.tiwari@college.com",  sec: "sec-ee24-A",  room: "Room 602" },
  ];

  for (const t of ttSlots) {
    const subPrefix = t.sub.slice(0, 2);
    const semKey = subPrefix === "CS" ? "BTECH-CSE-sem5" : subPrefix === "ME" ? "BTECH-ME-sem5" : subPrefix === "EC" ? "BTECH-ECE-sem5" : subPrefix === "CE" ? "BTECH-CE-sem5" : "BTECH-EE-sem5";
    await prisma.timetableSlot.create({
      data: {
        dayOfWeek: t.day, startTime: t.start, endTime: t.end, room: t.room,
        subjectId: subjects[t.sub].id, facultyId: facByEmail[t.facEmail]!,
        sectionId: sections[t.sec].id, semesterId: semesters[semKey].id,
      },
    });
  }
  console.log(`  ✅ ${ttSlots.length} timetable slots created across all departments`);

  // ═══════════════════════════════════════════════════════════════
  // 14. ATTENDANCE (realistic 15-day history for all departments)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n✅ Creating attendance records...");

  const sectionStudentMap: Record<string, string[]> = {};
  for (const s of studentData) {
    if (!sectionStudentMap[s.sectionId]) sectionStudentMap[s.sectionId] = [];
    sectionStudentMap[s.sectionId]!.push(s.email);
  }

  const attSubjectMap: { sectionId: string; subjects: string[]; facEmails: string[] }[] = [
    { sectionId: "sec-cse23-A", subjects: ["CS501", "CS502", "CS503", "CS504", "CS505"], facEmails: ["amit.verma@college.com", "sneha.patil@college.com", "sneha.patil@college.com", "ravi.krishnan@college.com", "ravi.krishnan@college.com"] },
    { sectionId: "sec-cse23-B", subjects: ["CS501", "CS502", "CS503"], facEmails: ["ravi.krishnan@college.com", "amit.verma@college.com", "vikas.gupta@college.com"] },
    { sectionId: "sec-me23-A",  subjects: ["ME501", "ME502", "ME503"], facEmails: ["meena.iyer@college.com", "meena.iyer@college.com", "suresh.reddy@college.com"] },
    { sectionId: "sec-ece23-A", subjects: ["EC501", "EC502", "EC503"], facEmails: ["anita.desai@college.com", "anita.desai@college.com", "kiran.joshi@college.com"] },
    { sectionId: "sec-ce23-A",  subjects: ["CE501", "CE502", "CE503"], facEmails: ["deepak.singh@college.com", "deepak.singh@college.com", "lakshmi.pillai@college.com"] },
    { sectionId: "sec-ee24-A",  subjects: ["EE501", "EE502", "EE503"], facEmails: ["pooja.nair@college.com", "pooja.nair@college.com", "manoj.tiwari@college.com"] },
  ];

  const statuses = [AttendanceStatus.present, AttendanceStatus.present, AttendanceStatus.present, AttendanceStatus.present, AttendanceStatus.absent, AttendanceStatus.late];
  let attCount = 0;

  for (let dayOffset = 1; dayOffset <= 15; dayOffset++) {
    const date = new Date(); date.setDate(date.getDate() - dayOffset);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

    for (const mapping of attSubjectMap) {
      const stuEmails = sectionStudentMap[mapping.sectionId] || [];
      for (let subIdx = 0; subIdx < mapping.subjects.length; subIdx++) {
        const subCode = mapping.subjects[subIdx]!;
        const facEmail = mapping.facEmails[subIdx]!;
        for (const stuEmail of stuEmails) {
          const status = statuses[Math.floor(Math.random() * statuses.length)]!;
          try {
            await prisma.attendance.create({
              data: {
                studentId: stuByEmail[stuEmail]!, subjectId: subjects[subCode]!.id,
                date, period: subIdx + 1,
                status, markedById: facByEmail[facEmail]!,
              },
            });
            attCount++;
          } catch { /* skip duplicates */ }
        }
      }
    }
  }
  console.log(`  ✅ ${attCount} attendance records created across all departments`);

  // ═══════════════════════════════════════════════════════════════
  // 15. LEAVE APPLICATIONS (diverse types and statuses)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📋 Creating leave applications...");

  const leaveData = [
    // Students
    { stuEmail: "rahul.sharma@student.com",  type: LeaveType.medical,   startOff: -5, endOff: -3, reason: "Fever and cold, need rest. Doctor prescribed 3 days bed rest.",              status: ApprovalStatus.approved, approverEmail: "amit.verma@college.com",  note: "Get well soon, take care." },
    { stuEmail: "priya.singh@student.com",   type: LeaveType.personal,  startOff: -2, endOff: -1, reason: "Family function — sister's wedding in hometown.",                           status: ApprovalStatus.approved, approverEmail: "amit.verma@college.com",  note: "Approved. Congratulations!" },
    { stuEmail: "arjun.patel@student.com",   type: LeaveType.emergency, startOff: -1, endOff: 0,  reason: "Grandmother hospitalized, need to visit immediately.",                       status: ApprovalStatus.pending,  approverEmail: null,                      note: null },
    { stuEmail: "neha.gupta@student.com",    type: LeaveType.personal,  startOff: 2,  endOff: 3,  reason: "Passport appointment at regional passport office.",                           status: ApprovalStatus.pending,  approverEmail: null,                      note: null },
    { stuEmail: "vikram.joshi@student.com",  type: LeaveType.medical,   startOff: -8, endOff: -6, reason: "Dental surgery, doctor advised rest for 3 days.",                             status: ApprovalStatus.approved, approverEmail: "sneha.patil@college.com", note: "Approved. Submit medical certificate." },
    { stuEmail: "ananya.mishra@student.com", type: LeaveType.other,     startOff: -3, endOff: -3, reason: "Participating in inter-college hackathon at IIT Delhi.",                      status: ApprovalStatus.rejected, approverEmail: "ravi.krishnan@college.com", note: "Cannot approve during exam week." },
    { stuEmail: "rohit.kumar@student.com",   type: LeaveType.personal,  startOff: 1,  endOff: 2,  reason: "Need to attend younger brother's school admission interview.",                status: ApprovalStatus.pending,  approverEmail: null,                      note: null },
    { stuEmail: "kavita.reddy@student.com",  type: LeaveType.medical,   startOff: -4, endOff: -3, reason: "Migraine issues, under medication.",                                         status: ApprovalStatus.approved, approverEmail: "ravi.krishnan@college.com", note: "Rest well." },
    { stuEmail: "manish.tiwari@student.com", type: LeaveType.medical,   startOff: -4, endOff: -2, reason: "Food poisoning, advised bed rest by hostel medical officer.",                 status: ApprovalStatus.approved, approverEmail: "meena.iyer@college.com",  note: "Approved." },
    { stuEmail: "swati.pandey@student.com",  type: LeaveType.emergency, startOff: -1, endOff: 0,  reason: "Father met with road accident, need to go home urgently.",                   status: ApprovalStatus.approved, approverEmail: "meena.iyer@college.com",  note: "Take care, keep us updated." },
    { stuEmail: "megha.das@student.com",     type: LeaveType.personal,  startOff: 3,  endOff: 5,  reason: "Durga Puja celebrations at home, pre-booked train tickets.",                  status: ApprovalStatus.pending,  approverEmail: null,                      note: null },
    { stuEmail: "aman.chauhan@student.com",  type: LeaveType.other,     startOff: -6, endOff: -6, reason: "Participating in university sports day as captain of cricket team.",          status: ApprovalStatus.approved, approverEmail: "kiran.joshi@college.com", note: "Approved. Best of luck!" },
    { stuEmail: "gaurav.choudhary@student.com", type: LeaveType.medical, startOff: -2, endOff: -1, reason: "Sprained ankle during football match, doctor advised rest.",                status: ApprovalStatus.approved, approverEmail: "deepak.singh@college.com", note: "Get well soon." },
    { stuEmail: "ritu.dey@student.com",      type: LeaveType.personal,  startOff: 4,  endOff: 6,  reason: "Elder brother's wedding in Kolkata.",                                        status: ApprovalStatus.pending,  approverEmail: null,                      note: null },
    // Faculty
    { stuEmail: "amit.verma@college.com",    type: LeaveType.personal,  startOff: 5,  endOff: 7,  reason: "Annual family vacation planned to Goa.",                                     status: ApprovalStatus.pending,  approverEmail: null,                      note: null },
    { stuEmail: "meena.iyer@college.com",    type: LeaveType.medical,   startOff: -3, endOff: -2, reason: "Routine health checkup and dental appointment.",                              status: ApprovalStatus.approved, approverEmail: "admin@college.com",       note: "Approved." },
  ];

  for (const l of leaveData) {
    const start = new Date(); start.setDate(start.getDate() + l.startOff);
    const end = new Date(); end.setDate(end.getDate() + l.endOff);
    const userId = stuByEmail[l.stuEmail] || facByEmail[l.stuEmail]!;
    const approverId = l.approverEmail ? (facByEmail[l.approverEmail] || adminByEmail[l.approverEmail]) : null;
    await prisma.leaveApplication.create({
      data: {
        userId, type: l.type, startDate: start, endDate: end,
        reason: l.reason, status: l.status,
        approvedById: approverId, approverNote: l.note,
      },
    });
  }
  console.log(`  ✅ ${leaveData.length} leave applications created`);

  // ═══════════════════════════════════════════════════════════════
  // 16. EXAMS & RESULTS (all departments)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📝 Creating exams & results...");

  const examData = [
    // CSE
    { id: "exam-cs501-mid", name: "DSA Mid-Term",           type: ExamType.midterm,  subCode: "CS501", total: 50, facEmail: "amit.verma@college.com",    dayOff: -15 },
    { id: "exam-cs501-int", name: "DSA Internal 1",         type: ExamType.internal, subCode: "CS501", total: 20, facEmail: "amit.verma@college.com",    dayOff: -30 },
    { id: "exam-cs502-mid", name: "OS Mid-Term",            type: ExamType.midterm,  subCode: "CS502", total: 50, facEmail: "sneha.patil@college.com",   dayOff: -14 },
    { id: "exam-cs503-mid", name: "DBMS Mid-Term",          type: ExamType.midterm,  subCode: "CS503", total: 50, facEmail: "sneha.patil@college.com",   dayOff: -13 },
    { id: "exam-cs504-int", name: "Networks Internal 1",    type: ExamType.internal, subCode: "CS504", total: 25, facEmail: "ravi.krishnan@college.com", dayOff: -25 },
    { id: "exam-cs505-mid", name: "SE Mid-Term",            type: ExamType.midterm,  subCode: "CS505", total: 50, facEmail: "ravi.krishnan@college.com", dayOff: -12 },
    // ME
    { id: "exam-me501-mid", name: "Thermo II Mid-Term",     type: ExamType.midterm,  subCode: "ME501", total: 50, facEmail: "meena.iyer@college.com",    dayOff: -12 },
    { id: "exam-me502-int", name: "Fluids Internal 1",      type: ExamType.internal, subCode: "ME502", total: 20, facEmail: "meena.iyer@college.com",    dayOff: -28 },
    { id: "exam-me503-mid", name: "Manufacturing Mid-Term", type: ExamType.midterm,  subCode: "ME503", total: 50, facEmail: "suresh.reddy@college.com",  dayOff: -11 },
    // ECE
    { id: "exam-ec501-mid", name: "DSP Mid-Term",           type: ExamType.midterm,  subCode: "EC501", total: 50, facEmail: "anita.desai@college.com",   dayOff: -11 },
    { id: "exam-ec502-int", name: "VLSI Internal 1",        type: ExamType.internal, subCode: "EC502", total: 25, facEmail: "anita.desai@college.com",   dayOff: -22 },
    { id: "exam-ec503-mid", name: "Microprocessor Mid-Term", type: ExamType.midterm, subCode: "EC503", total: 50, facEmail: "kiran.joshi@college.com",   dayOff: -10 },
    // CE
    { id: "exam-ce501-mid", name: "Structural Mid-Term",    type: ExamType.midterm,  subCode: "CE501", total: 50, facEmail: "deepak.singh@college.com",  dayOff: -14 },
    { id: "exam-ce502-int", name: "Geotech Internal 1",     type: ExamType.internal, subCode: "CE502", total: 20, facEmail: "deepak.singh@college.com",  dayOff: -26 },
    // EE
    { id: "exam-ee501-mid", name: "Power Systems Mid-Term", type: ExamType.midterm,  subCode: "EE501", total: 50, facEmail: "pooja.nair@college.com",    dayOff: -13 },
    { id: "exam-ee502-int", name: "Control Internal 1",     type: ExamType.internal, subCode: "EE502", total: 20, facEmail: "pooja.nair@college.com",    dayOff: -24 },
  ];

  const exams: Record<string, any> = {};
  for (const e of examData) {
    const d = new Date(); d.setDate(d.getDate() + e.dayOff);
    const subPrefix = e.subCode.slice(0, 2);
    const semKey = subPrefix === "CS" ? "BTECH-CSE-sem5" : subPrefix === "ME" ? "BTECH-ME-sem5" : subPrefix === "EC" ? "BTECH-ECE-sem5" : subPrefix === "CE" ? "BTECH-CE-sem5" : "BTECH-EE-sem5";
    exams[e.id] = await prisma.exam.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id, name: e.name, type: e.type,
        subjectId: subjects[e.subCode].id, semesterId: semesters[semKey].id,
        date: d, totalMarks: e.total, createdById: facByEmail[e.facEmail]!,
      },
    });
  }
  console.log(`  ✅ ${examData.length} exams created across all departments`);

  // Generate results for all exams
  const gradeMap = (pct: number): Grade => {
    if (pct >= 90) return Grade.A_PLUS;
    if (pct >= 80) return Grade.A;
    if (pct >= 70) return Grade.B_PLUS;
    if (pct >= 60) return Grade.B;
    if (pct >= 50) return Grade.C;
    if (pct >= 40) return Grade.D;
    return Grade.F;
  };

  // Map exams to the section of students who took them
  const examStudentMap: { examId: string; subCode: string; sectionStudents: string[] }[] = [
    // CSE exams — Section A students
    ...["exam-cs501-mid", "exam-cs501-int", "exam-cs502-mid", "exam-cs503-mid", "exam-cs504-int", "exam-cs505-mid"].map(eid => ({
      examId: eid, subCode: eid.includes("cs501") ? "CS501" : eid.includes("cs502") ? "CS502" : eid.includes("cs503") ? "CS503" : eid.includes("cs504") ? "CS504" : "CS505",
      sectionStudents: sectionStudentMap["sec-cse23-A"] || [],
    })),
    // ME exams
    ...["exam-me501-mid", "exam-me502-int", "exam-me503-mid"].map(eid => ({
      examId: eid, subCode: eid.includes("me501") ? "ME501" : eid.includes("me502") ? "ME502" : "ME503",
      sectionStudents: sectionStudentMap["sec-me23-A"] || [],
    })),
    // ECE exams
    ...["exam-ec501-mid", "exam-ec502-int", "exam-ec503-mid"].map(eid => ({
      examId: eid, subCode: eid.includes("ec501") ? "EC501" : eid.includes("ec502") ? "EC502" : "EC503",
      sectionStudents: sectionStudentMap["sec-ece23-A"] || [],
    })),
    // CE exams
    ...["exam-ce501-mid", "exam-ce502-int"].map(eid => ({
      examId: eid, subCode: eid.includes("ce501") ? "CE501" : "CE502",
      sectionStudents: sectionStudentMap["sec-ce23-A"] || [],
    })),
    // EE exams
    ...["exam-ee501-mid", "exam-ee502-int"].map(eid => ({
      examId: eid, subCode: eid.includes("ee501") ? "EE501" : "EE502",
      sectionStudents: sectionStudentMap["sec-ee24-A"] || [],
    })),
  ];

  let resCount = 0;
  for (const mapping of examStudentMap) {
    const exam = exams[mapping.examId];
    if (!exam) continue;
    const subPrefix = mapping.subCode.slice(0, 2);
    const semKey = subPrefix === "CS" ? "BTECH-CSE-sem5" : subPrefix === "ME" ? "BTECH-ME-sem5" : subPrefix === "EC" ? "BTECH-ECE-sem5" : subPrefix === "CE" ? "BTECH-CE-sem5" : "BTECH-EE-sem5";
    for (const stuEmail of mapping.sectionStudents) {
      const stuId = stuByEmail[stuEmail];
      if (!stuId) continue;
      const marks = Math.floor(Math.random() * (exam.totalMarks * 0.5)) + (exam.totalMarks * 0.4);
      try {
        await prisma.result.create({
          data: {
            studentId: stuId, examId: exam.id,
            subjectId: subjects[mapping.subCode].id,
            semesterId: semesters[semKey].id,
            marksObtained: marks, grade: gradeMap((marks / exam.totalMarks) * 100),
          },
        });
        resCount++;
      } catch { /* skip duplicates */ }
    }
  }
  console.log(`  ✅ ${resCount} results created across all departments`);

  // ═══════════════════════════════════════════════════════════════
  // 17. HOSTELS, ROOMS, ALLOCATIONS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🏠 Creating hostels...");

  const hostelData = [
    { id: "hostel-boys-a",  name: "Boys Hostel Block A",  type: HostelType.boys,  wardenEmail: "warden.boys@college.com",  totalRooms: 50 },
    { id: "hostel-boys-b",  name: "Boys Hostel Block B",  type: HostelType.boys,  wardenEmail: "warden.boys@college.com",  totalRooms: 40 },
    { id: "hostel-girls-a", name: "Girls Hostel Block A", type: HostelType.girls, wardenEmail: "warden.girls@college.com", totalRooms: 40 },
    { id: "hostel-girls-b", name: "Girls Hostel Block B", type: HostelType.girls, wardenEmail: "warden.girls@college.com", totalRooms: 30 },
  ];

  const hostels: Record<string, any> = {};
  for (const h of hostelData) {
    hostels[h.id] = await prisma.hostel.upsert({
      where: { id: h.id },
      update: {},
      create: { id: h.id, name: h.name, type: h.type, wardenId: wardenByEmail[h.wardenEmail]!, totalRooms: h.totalRooms },
    });
    console.log(`  ✅ ${h.name}`);
  }

  console.log("\n🚪 Creating rooms...");
  const rooms: Record<string, any> = {};
  const roomList = [
    ...Array.from({ length: 10 }, (_, i) => ({ hostelId: "hostel-boys-a", roomNumber: `${101 + i}`, floor: 1, capacity: 2 })),
    ...Array.from({ length: 10 }, (_, i) => ({ hostelId: "hostel-boys-a", roomNumber: `${201 + i}`, floor: 2, capacity: 2 })),
    ...Array.from({ length: 5 },  (_, i) => ({ hostelId: "hostel-boys-a", roomNumber: `${301 + i}`, floor: 3, capacity: 3 })),
    ...Array.from({ length: 10 }, (_, i) => ({ hostelId: "hostel-boys-b", roomNumber: `${101 + i}`, floor: 1, capacity: 2 })),
    ...Array.from({ length: 10 }, (_, i) => ({ hostelId: "hostel-girls-a", roomNumber: `${101 + i}`, floor: 1, capacity: 2 })),
    ...Array.from({ length: 10 }, (_, i) => ({ hostelId: "hostel-girls-a", roomNumber: `${201 + i}`, floor: 2, capacity: 2 })),
    ...Array.from({ length: 5 },  (_, i) => ({ hostelId: "hostel-girls-b", roomNumber: `${101 + i}`, floor: 1, capacity: 2 })),
  ];

  for (const r of roomList) {
    const existing = await prisma.hostelRoom.findFirst({ where: { hostelId: r.hostelId, roomNumber: r.roomNumber } });
    rooms[`${r.hostelId}-${r.roomNumber}`] = existing ?? await prisma.hostelRoom.create({ data: r });
  }
  console.log(`  ✅ ${roomList.length} rooms created`);

  console.log("\n🛏️ Allocating students...");
  const allocations = [
    // Boys Hostel A
    { stuEmail: "rahul.sharma@student.com",  roomKey: "hostel-boys-a-101" },
    { stuEmail: "arjun.patel@student.com",   roomKey: "hostel-boys-a-101" },
    { stuEmail: "vikram.joshi@student.com",  roomKey: "hostel-boys-a-102" },
    { stuEmail: "rohit.kumar@student.com",   roomKey: "hostel-boys-a-102" },
    { stuEmail: "aditya.nair@student.com",   roomKey: "hostel-boys-a-103" },
    { stuEmail: "harsh.agarwal@student.com", roomKey: "hostel-boys-a-103" },
    { stuEmail: "manish.tiwari@student.com", roomKey: "hostel-boys-a-201" },
    { stuEmail: "rajat.saxena@student.com",  roomKey: "hostel-boys-a-201" },
    { stuEmail: "virat.thakur@student.com",  roomKey: "hostel-boys-a-202" },
    { stuEmail: "aman.chauhan@student.com",  roomKey: "hostel-boys-a-202" },
    { stuEmail: "tanmay.sinha@student.com",  roomKey: "hostel-boys-a-203" },
    { stuEmail: "siddharth.mehta@student.com", roomKey: "hostel-boys-a-203" },
    // Boys Hostel B
    { stuEmail: "gaurav.choudhary@student.com", roomKey: "hostel-boys-b-101" },
    { stuEmail: "nikhil.bhatt@student.com",     roomKey: "hostel-boys-b-101" },
    { stuEmail: "kunal.banerjee@student.com",   roomKey: "hostel-boys-b-102" },
    { stuEmail: "akash.rao@student.com",        roomKey: "hostel-boys-b-102" },
    // Girls Hostel A
    { stuEmail: "priya.singh@student.com",   roomKey: "hostel-girls-a-101" },
    { stuEmail: "neha.gupta@student.com",    roomKey: "hostel-girls-a-101" },
    { stuEmail: "sana.khan@student.com",     roomKey: "hostel-girls-a-102" },
    { stuEmail: "ananya.mishra@student.com", roomKey: "hostel-girls-a-102" },
    { stuEmail: "divya.iyer@student.com",    roomKey: "hostel-girls-a-103" },
    { stuEmail: "kavita.reddy@student.com",  roomKey: "hostel-girls-a-103" },
    { stuEmail: "megha.das@student.com",     roomKey: "hostel-girls-a-201" },
    { stuEmail: "ritika.bose@student.com",   roomKey: "hostel-girls-a-201" },
    { stuEmail: "shreya.menon@student.com",  roomKey: "hostel-girls-a-202" },
    { stuEmail: "swati.pandey@student.com",  roomKey: "hostel-girls-a-202" },
    { stuEmail: "nisha.bhat@student.com",    roomKey: "hostel-girls-a-203" },
    // Girls Hostel B
    { stuEmail: "pooja.verma@student.com",   roomKey: "hostel-girls-b-101" },
    { stuEmail: "meera.pillai@student.com",  roomKey: "hostel-girls-b-101" },
    { stuEmail: "pallavi.jain@student.com",  roomKey: "hostel-girls-b-102" },
    { stuEmail: "ritu.dey@student.com",      roomKey: "hostel-girls-b-102" },
    { stuEmail: "aparna.nambiar@student.com", roomKey: "hostel-girls-b-103" },
  ];

  for (const a of allocations) {
    const room = rooms[a.roomKey];
    const stuId = stuByEmail[a.stuEmail]!;
    if (!room || !stuId) continue;
    const existing = await prisma.hostelAllocation.findFirst({ where: { studentId: stuId, isActive: true } });
    if (!existing) {
      await prisma.hostelAllocation.create({ data: { studentId: stuId, roomId: room.id, allocatedDate: new Date("2024-07-01"), isActive: true } });
    }
  }
  console.log(`  ✅ ${allocations.length} students allocated to hostel rooms`);

  // ═══════════════════════════════════════════════════════════════
  // 18. GATE PASSES
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🚶 Creating gate passes...");

  const gpData = [
    { stuEmail: "rahul.sharma@student.com",  reason: "Going to market for project supplies",      outOff: -2, retOff: -2, outTime: "14:00", retTime: "18:30", status: ApprovalStatus.approved, approverEmail: "warden.boys@college.com" },
    { stuEmail: "arjun.patel@student.com",   reason: "Medical checkup at city hospital",           outOff: -1, retOff: -1, outTime: "10:00", retTime: "15:00", status: ApprovalStatus.approved, approverEmail: "warden.boys@college.com" },
    { stuEmail: "vikram.joshi@student.com",  reason: "Going home for weekend",                     outOff: 0,  retOff: 2,  outTime: "16:00", retTime: null,    status: ApprovalStatus.pending,  approverEmail: null },
    { stuEmail: "priya.singh@student.com",   reason: "Shopping with friends at mall",               outOff: 0,  retOff: 0,  outTime: "15:00", retTime: null,    status: ApprovalStatus.pending,  approverEmail: null },
    { stuEmail: "rohit.kumar@student.com",   reason: "Want to go to a late night party",           outOff: -3, retOff: -3, outTime: "20:00", retTime: null,    status: ApprovalStatus.rejected, approverEmail: "warden.boys@college.com" },
    { stuEmail: "manish.tiwari@student.com", reason: "Library visit at central public library",    outOff: 1,  retOff: 1,  outTime: "09:00", retTime: null,    status: ApprovalStatus.pending,  approverEmail: null },
    { stuEmail: "neha.gupta@student.com",    reason: "Doctor appointment for eye checkup",          outOff: -1, retOff: -1, outTime: "11:00", retTime: "16:00", status: ApprovalStatus.approved, approverEmail: "warden.girls@college.com" },
    { stuEmail: "megha.das@student.com",     reason: "Going to post office for courier",           outOff: 0,  retOff: 0,  outTime: "10:00", retTime: null,    status: ApprovalStatus.pending,  approverEmail: null },
    { stuEmail: "aman.chauhan@student.com",  reason: "Cricket practice match at sports complex",   outOff: -2, retOff: -2, outTime: "06:00", retTime: "12:00", status: ApprovalStatus.approved, approverEmail: "warden.boys@college.com" },
    { stuEmail: "ritika.bose@student.com",   reason: "Visit relative admitted in hospital",        outOff: 1,  retOff: 1,  outTime: "14:00", retTime: null,    status: ApprovalStatus.pending,  approverEmail: null },
    { stuEmail: "gaurav.choudhary@student.com", reason: "Need to buy textbooks from bookstore",    outOff: -4, retOff: -4, outTime: "10:00", retTime: "14:00", status: ApprovalStatus.approved, approverEmail: "warden.boys@college.com" },
    { stuEmail: "divya.iyer@student.com",    reason: "Going for bank account opening",             outOff: 2,  retOff: 2,  outTime: "09:30", retTime: null,    status: ApprovalStatus.pending,  approverEmail: null },
  ];

  for (const g of gpData) {
    const out = new Date(); out.setDate(out.getDate() + g.outOff);
    const ret = new Date(); ret.setDate(ret.getDate() + g.retOff);
    await prisma.gatePass.create({
      data: {
        studentId: stuByEmail[g.stuEmail]!, reason: g.reason,
        outDate: out, outTime: g.outTime, expectedReturnDate: ret, returnTime: g.retTime,
        status: g.status, approvedById: g.approverEmail ? wardenByEmail[g.approverEmail] : null,
      },
    });
  }
  console.log(`  ✅ ${gpData.length} gate passes created`);

  // ═══════════════════════════════════════════════════════════════
  // 19. HOSTEL COMPLAINTS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n🔧 Creating hostel complaints...");

  const complaintData = [
    { stuEmail: "rahul.sharma@student.com",     roomKey: "hostel-boys-a-101",  category: ComplaintCategory.plumbing,   desc: "Bathroom tap leaking continuously, water wastage",         status: ComplaintStatus.open },
    { stuEmail: "arjun.patel@student.com",      roomKey: "hostel-boys-a-101",  category: ComplaintCategory.electrical, desc: "Ceiling fan not working, making grinding noise",           status: ComplaintStatus.in_progress },
    { stuEmail: "vikram.joshi@student.com",     roomKey: "hostel-boys-a-102",  category: ComplaintCategory.furniture,  desc: "Study table drawer is broken, cannot store books",         status: ComplaintStatus.resolved },
    { stuEmail: "priya.singh@student.com",      roomKey: "hostel-girls-a-101", category: ComplaintCategory.cleaning,   desc: "Common washroom not cleaned for 2 days",                   status: ComplaintStatus.open },
    { stuEmail: "megha.das@student.com",        roomKey: "hostel-girls-a-201", category: ComplaintCategory.electrical, desc: "Power socket sparking near the bed, safety hazard",        status: ComplaintStatus.open },
    { stuEmail: "manish.tiwari@student.com",    roomKey: "hostel-boys-a-201",  category: ComplaintCategory.other,      desc: "WiFi signal very weak on 2nd floor",                       status: ComplaintStatus.in_progress },
    { stuEmail: "neha.gupta@student.com",       roomKey: "hostel-girls-a-101", category: ComplaintCategory.plumbing,   desc: "Geyser not working in bathroom",                           status: ComplaintStatus.open },
    { stuEmail: "aman.chauhan@student.com",     roomKey: "hostel-boys-a-202",  category: ComplaintCategory.furniture,  desc: "Wardrobe door hinge is broken",                            status: ComplaintStatus.open },
    { stuEmail: "divya.iyer@student.com",       roomKey: "hostel-girls-a-103", category: ComplaintCategory.cleaning,   desc: "Dustbin not collected from corridor for 3 days",           status: ComplaintStatus.resolved },
    { stuEmail: "gaurav.choudhary@student.com", roomKey: "hostel-boys-b-101",  category: ComplaintCategory.electrical, desc: "Tube light flickering in the room, disturbing sleep",      status: ComplaintStatus.open },
    { stuEmail: "pallavi.jain@student.com",     roomKey: "hostel-girls-b-102", category: ComplaintCategory.plumbing,   desc: "Water pressure very low on first floor",                   status: ComplaintStatus.in_progress },
    { stuEmail: "sana.khan@student.com",        roomKey: "hostel-girls-a-102", category: ComplaintCategory.other,      desc: "Room window lock is broken, security concern",             status: ComplaintStatus.open },
  ];

  for (const c of complaintData) {
    const room = rooms[c.roomKey];
    if (!room) continue;
    await prisma.hostelComplaint.create({
      data: { studentId: stuByEmail[c.stuEmail]!, roomId: room.id, category: c.category, description: c.desc, status: c.status },
    });
  }
  console.log(`  ✅ ${complaintData.length} complaints created`);

  // ═══════════════════════════════════════════════════════════════
  // 20. ANNOUNCEMENTS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📢 Creating announcements...");

  const adminId = adminByEmail["admin@college.com"]!;
  const admin2Id = adminByEmail["registrar@college.com"]!;

  const announcements = [
    { id: "ann-01", title: "Welcome to Semester 5!",                 content: "Dear students, welcome back! Classes begin on August 1st. Please check your timetables on the LMS portal. All students must register on the portal within 3 days.", type: AnnouncementType.global, targetId: null, createdById: adminId, isPinned: true },
    { id: "ann-02", title: "Mid-Term Exam Schedule Released",        content: "Mid-term examinations will be held from August 20th to August 28th. Students with less than 75% attendance will not be allowed to sit for exams. Check your attendance dashboard.", type: AnnouncementType.global, targetId: null, createdById: adminId, isPinned: true },
    { id: "ann-03", title: "CSE Department Hackathon 2026",          content: "CSE Department is organizing a 24-hour hackathon on September 15th. Teams of 3-4 can register via the department portal. Prizes worth ₹50,000. Registration deadline: September 10th.", type: AnnouncementType.department, targetId: depts.CSE.id, createdById: facByEmail["amit.verma@college.com"]!, isPinned: false },
    { id: "ann-04", title: "DSA Extra Doubt Session",                content: "An extra doubt-clearing session for DSA (CS501) will be held on Saturday, 3 PM in Room 301. All students struggling with graph algorithms are encouraged to attend.", type: AnnouncementType.department, targetId: depts.CSE.id, createdById: facByEmail["amit.verma@college.com"]!, isPinned: false },
    { id: "ann-05", title: "Library Timing Extended",                content: "Central Library timing has been extended to 11 PM during exam period (August 15-30). Students can avail 24x7 reading room facility with valid ID card.", type: AnnouncementType.global, targetId: null, createdById: admin2Id, isPinned: true },
    { id: "ann-06", title: "Hostel Mess Menu Updated",               content: "The hostel mess menu has been revised based on student feedback. New menu is effective from this Monday. Special Sunday brunch has been added. Check notice board for details.", type: AnnouncementType.hostel, targetId: null, createdById: adminId, isPinned: false },
    { id: "ann-07", title: "Annual Sports Day Registration Open",    content: "Annual Sports Day will be held on October 5th. Events include athletics, cricket, football, badminton, table tennis, and chess. Register through your section representative by September 25th.", type: AnnouncementType.global, targetId: null, createdById: admin2Id, isPinned: false },
    { id: "ann-08", title: "ME Workshop on 3D Printing",             content: "Mechanical Engineering Dept. is conducting a hands-on workshop on 3D Printing and Additive Manufacturing on September 20th. Limited seats — register by Sep 18. Certificate will be provided.", type: AnnouncementType.department, targetId: depts.ME.id, createdById: facByEmail["meena.iyer@college.com"]!, isPinned: false },
    { id: "ann-09", title: "ECE Guest Lecture: 5G Technology",       content: "Guest lecture by Dr. Vikram Sharma from IIT Bombay on 'Future of 5G and Beyond' on September 22nd at 2 PM in Seminar Hall. Open to all ECE students.", type: AnnouncementType.department, targetId: depts.ECE.id, createdById: facByEmail["anita.desai@college.com"]!, isPinned: false },
    { id: "ann-10", title: "Scholarship Applications Open",          content: "Merit-based scholarships for academic year 2026-27 are now open for applications. Eligibility: CGPA above 8.0 with no backlogs. Apply through the registrar's office by September 30th.", type: AnnouncementType.global, targetId: null, createdById: admin2Id, isPinned: true },
    { id: "ann-11", title: "Anti-Ragging Cell Notice",               content: "Any form of ragging is a punishable offence. If you witness or experience ragging, report immediately to the Anti-Ragging Cell: antiragging@college.com or call helpline 1800-180-5522.", type: AnnouncementType.global, targetId: null, createdById: adminId, isPinned: true },
    { id: "ann-12", title: "CE Site Visit to Metro Construction",    content: "Civil Engineering Dept. has organized a site visit to the upcoming metro station construction site on September 25th. Transportation will be arranged. Prior registration mandatory.", type: AnnouncementType.department, targetId: depts.CE.id, createdById: facByEmail["deepak.singh@college.com"]!, isPinned: false },
    { id: "ann-13", title: "Placement Drive — TCS & Infosys",        content: "TCS and Infosys are visiting campus for placement drive on October 10-12. Eligible: Final year students with CGPA ≥ 6.5. Pre-placement talk on Oct 9 at 4 PM.", type: AnnouncementType.global, targetId: null, createdById: admin2Id, isPinned: false },
    { id: "ann-14", title: "Water Supply Disruption Notice",         content: "Due to maintenance work on the main pipeline, water supply to Boys Hostel Block A and B will be disrupted on Sunday 9 AM - 2 PM. Students are advised to store water in advance.", type: AnnouncementType.hostel, targetId: null, createdById: adminId, isPinned: false },
    { id: "ann-15", title: "DBMS Project Submission Extended",       content: "The deadline for DBMS (CS503) project submission has been extended to September 5th. Submit via the course portal. Late submissions will attract 10% penalty per day.", type: AnnouncementType.department, targetId: depts.CSE.id, createdById: facByEmail["sneha.patil@college.com"]!, isPinned: false },
  ];

  for (const a of announcements) {
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: {},
      create: a,
    });
  }
  console.log(`  ✅ ${announcements.length} announcements created`);

  // ═══════════════════════════════════════════════════════════════
  // 21. ACADEMIC CALENDAR EVENTS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📆 Creating academic calendar events...");

  const events = [
    { title: "Independence Day",               desc: "National holiday. College closed.",                                   start: "2026-08-15", end: "2026-08-15", type: AcademicEventType.holiday },
    { title: "Ganesh Chaturthi",               desc: "Festival holiday.",                                                   start: "2026-08-27", end: "2026-08-27", type: AcademicEventType.holiday },
    { title: "Mid-Term Examination Period",     desc: "Mid-term exams for all programs, Semester 5.",                        start: "2026-08-20", end: "2026-08-28", type: AcademicEventType.exam_period },
    { title: "Gandhi Jayanti",                 desc: "National holiday.",                                                   start: "2026-10-02", end: "2026-10-02", type: AcademicEventType.holiday },
    { title: "Dussehra",                       desc: "Festival holiday.",                                                   start: "2026-10-12", end: "2026-10-12", type: AcademicEventType.holiday },
    { title: "Diwali Break",                   desc: "Diwali festival holidays.",                                           start: "2026-10-20", end: "2026-10-24", type: AcademicEventType.holiday },
    { title: "End Semester Examination Period", desc: "End semester exams for all programs.",                                start: "2026-11-15", end: "2026-11-30", type: AcademicEventType.exam_period },
    { title: "Christmas & New Year",           desc: "Winter break.",                                                       start: "2026-12-24", end: "2027-01-02", type: AcademicEventType.holiday },
    { title: "Republic Day",                   desc: "National holiday. Flag hoisting ceremony at 8 AM.",                   start: "2027-01-26", end: "2027-01-26", type: AcademicEventType.holiday },
    { title: "CSE Hackathon 2026",             desc: "24-hour inter-college hackathon organized by CSE department.",        start: "2026-09-15", end: "2026-09-16", type: AcademicEventType.event,    deptId: depts.CSE.id },
    { title: "Annual Sports Day",              desc: "Inter-departmental sports competition.",                               start: "2026-10-05", end: "2026-10-05", type: AcademicEventType.sports },
    { title: "Guest Lecture: 5G Technology",    desc: "By Dr. Vikram Sharma, IIT Bombay. ECE students only.",               start: "2026-09-22", end: "2026-09-22", type: AcademicEventType.seminar,   deptId: depts.ECE.id },
    { title: "ME 3D Printing Workshop",        desc: "Hands-on workshop on additive manufacturing techniques.",              start: "2026-09-20", end: "2026-09-20", type: AcademicEventType.workshop,  deptId: depts.ME.id },
    { title: "Technical Symposium — TechFest", desc: "Annual technical symposium with paper presentations and project expo.", start: "2026-10-15", end: "2026-10-17", type: AcademicEventType.event },
    { title: "CE Site Visit — Metro Project",  desc: "Site visit to metro construction for CE students.",                    start: "2026-09-25", end: "2026-09-25", type: AcademicEventType.event,    deptId: depts.CE.id },
    { title: "Alumni Meet 2026",               desc: "Annual alumni gathering and networking event.",                        start: "2026-11-08", end: "2026-11-08", type: AcademicEventType.event },
    { title: "Placement Season Begins",        desc: "Campus placements for final year students.",                           start: "2026-10-10", end: "2026-12-15", type: AcademicEventType.event },
    { title: "EE Seminar: Smart Grids",        desc: "Seminar on smart grid technology by Prof. from IISc.",                start: "2026-09-28", end: "2026-09-28", type: AcademicEventType.seminar,  deptId: depts.EE.id },
    { title: "Makar Sankranti / Pongal",       desc: "Festival holiday.",                                                   start: "2027-01-14", end: "2027-01-14", type: AcademicEventType.holiday },
    { title: "Teachers' Day Celebration",       desc: "Special celebration for Teachers' Day. Half-day classes.",             start: "2026-09-05", end: "2026-09-05", type: AcademicEventType.event },
  ];

  for (const e of events) {
    await prisma.academicEvent.create({
      data: {
        title: e.title, description: e.desc,
        startDate: new Date(e.start), endDate: new Date(e.end),
        type: e.type,
        departmentId: (e as any).deptId || null,
        createdById: adminId,
      },
    });
  }
  console.log(`  ✅ ${events.length} calendar events created`);

  // ═══════════════════════════════════════════════════════════════
  // 22. ACTIVITY LOGS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n📊 Creating activity log entries...");

  const activityLogs = [
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.department, entityType: "Department", desc: "Dr. Rajesh Kumar (admin) created department 'Computer Science & Engineering'" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.department, entityType: "Department", desc: "Dr. Rajesh Kumar (admin) created department 'Mechanical Engineering'" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.department, entityType: "Department", desc: "Dr. Rajesh Kumar (admin) created department 'Electronics & Communication Engineering'" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.student, entityType: "User", desc: "Dr. Rajesh Kumar (admin) registered 32 new students for academic year 2026-27" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.faculty, entityType: "User", desc: "Dr. Rajesh Kumar (admin) registered 12 faculty members" },
    { userId: facByEmail["amit.verma@college.com"]!, action: ActivityAction.create, module: ActivityModule.attendance, entityType: "Attendance", desc: "Prof. Amit Verma marked attendance for CS501 — Section A (6 students present, 0 absent)" },
    { userId: facByEmail["sneha.patil@college.com"]!, action: ActivityAction.create, module: ActivityModule.attendance, entityType: "Attendance", desc: "Dr. Sneha Patil marked attendance for CS502 — Section A (5 present, 1 late)" },
    { userId: facByEmail["amit.verma@college.com"]!, action: ActivityAction.create, module: ActivityModule.exam, entityType: "Exam", desc: "Prof. Amit Verma created exam 'DSA Mid-Term' for CS501" },
    { userId: facByEmail["amit.verma@college.com"]!, action: ActivityAction.create, module: ActivityModule.exam, entityType: "Result", desc: "Prof. Amit Verma entered marks for 6 students — DSA Mid-Term" },
    { userId: facByEmail["sneha.patil@college.com"]!, action: ActivityAction.create, module: ActivityModule.exam, entityType: "Exam", desc: "Dr. Sneha Patil created exam 'OS Mid-Term' for CS502" },
    { userId: facByEmail["meena.iyer@college.com"]!, action: ActivityAction.create, module: ActivityModule.attendance, entityType: "Attendance", desc: "Dr. Meena Iyer marked attendance for ME501 — Section A" },
    { userId: facByEmail["anita.desai@college.com"]!, action: ActivityAction.create, module: ActivityModule.exam, entityType: "Exam", desc: "Dr. Anita Desai created exam 'DSP Mid-Term' for EC501" },
    { userId: facByEmail["amit.verma@college.com"]!, action: ActivityAction.approve, module: ActivityModule.leave, entityType: "LeaveApplication", desc: "Prof. Amit Verma approved leave for Rahul Sharma (medical)" },
    { userId: facByEmail["ravi.krishnan@college.com"]!, action: ActivityAction.reject, module: ActivityModule.leave, entityType: "LeaveApplication", desc: "Prof. Ravi Krishnan rejected leave for Ananya Mishra (cannot approve during exam week)" },
    { userId: wardenByEmail["warden.boys@college.com"]!, action: ActivityAction.approve, module: ActivityModule.hostel, entityType: "GatePass", desc: "Mr. Ramesh Yadav approved gate pass for Rahul Sharma" },
    { userId: wardenByEmail["warden.boys@college.com"]!, action: ActivityAction.reject, module: ActivityModule.hostel, entityType: "GatePass", desc: "Mr. Ramesh Yadav rejected gate pass for Rohit Kumar (late night party not allowed)" },
    { userId: wardenByEmail["warden.girls@college.com"]!, action: ActivityAction.approve, module: ActivityModule.hostel, entityType: "GatePass", desc: "Mrs. Sunita Devi approved gate pass for Neha Gupta (doctor appointment)" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.announcement, entityType: "Announcement", desc: "Dr. Rajesh Kumar (admin) created announcement 'Mid-Term Exam Schedule Released'" },
    { userId: admin2Id, action: ActivityAction.create, module: ActivityModule.announcement, entityType: "Announcement", desc: "Mrs. Priya Sharma (registrar) created announcement 'Scholarship Applications Open'" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.calendar, entityType: "AcademicEvent", desc: "Dr. Rajesh Kumar (admin) added 'Mid-Term Examination Period' to calendar" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.calendar, entityType: "AcademicEvent", desc: "Dr. Rajesh Kumar (admin) added 'Diwali Break' to calendar" },
    { userId: facByEmail["deepak.singh@college.com"]!, action: ActivityAction.create, module: ActivityModule.exam, entityType: "Exam", desc: "Dr. Deepak Singh created exam 'Structural Mid-Term' for CE501" },
    { userId: facByEmail["pooja.nair@college.com"]!, action: ActivityAction.create, module: ActivityModule.exam, entityType: "Exam", desc: "Prof. Pooja Nair created exam 'Power Systems Mid-Term' for EE501" },
    { userId: adminId, action: ActivityAction.update, module: ActivityModule.timetable, entityType: "TimetableSlot", desc: "Dr. Rajesh Kumar (admin) updated timetable — Room change for CS504 to Room 302" },
    { userId: facByEmail["sneha.patil@college.com"]!, action: ActivityAction.create, module: ActivityModule.announcement, entityType: "Announcement", desc: "Dr. Sneha Patil created announcement 'DBMS Project Submission Extended'" },
    { userId: adminId, action: ActivityAction.login, module: ActivityModule.auth, entityType: "Session", desc: "Dr. Rajesh Kumar (admin) logged in" },
    { userId: facByEmail["amit.verma@college.com"]!, action: ActivityAction.login, module: ActivityModule.auth, entityType: "Session", desc: "Prof. Amit Verma (faculty) logged in" },
    { userId: stuByEmail["rahul.sharma@student.com"]!, action: ActivityAction.login, module: ActivityModule.auth, entityType: "Session", desc: "Rahul Sharma (student) logged in" },
    { userId: wardenByEmail["warden.boys@college.com"]!, action: ActivityAction.login, module: ActivityModule.auth, entityType: "Session", desc: "Mr. Ramesh Yadav (warden) logged in" },
    { userId: admin2Id, action: ActivityAction.login, module: ActivityModule.auth, entityType: "Session", desc: "Mrs. Priya Sharma (admin) logged in" },
    { userId: facByEmail["meena.iyer@college.com"]!, action: ActivityAction.approve, module: ActivityModule.leave, entityType: "LeaveApplication", desc: "Dr. Meena Iyer approved leave for Manish Tiwari (food poisoning)" },
    { userId: facByEmail["meena.iyer@college.com"]!, action: ActivityAction.approve, module: ActivityModule.leave, entityType: "LeaveApplication", desc: "Dr. Meena Iyer approved leave for Swati Pandey (father's accident — emergency)" },
    { userId: facByEmail["kiran.joshi@college.com"]!, action: ActivityAction.approve, module: ActivityModule.leave, entityType: "LeaveApplication", desc: "Prof. Kiran Joshi approved leave for Aman Chauhan (university sports day)" },
    { userId: adminId, action: ActivityAction.create, module: ActivityModule.hostel, entityType: "Hostel", desc: "Dr. Rajesh Kumar (admin) created hostel 'Girls Hostel Block B'" },
    { userId: adminId, action: ActivityAction.update, module: ActivityModule.system, entityType: "System", desc: "System maintenance: database backup completed successfully" },
  ];

  for (let i = 0; i < activityLogs.length; i++) {
    const a = activityLogs[i]!;
    const created = new Date();
    created.setMinutes(created.getMinutes() - (activityLogs.length - i) * 45); // spread across time
    await prisma.activityLog.create({
      data: {
        userId: a.userId, action: a.action, module: a.module,
        entityType: a.entityType, description: a.desc,
        ipAddress: "192.168.1." + (10 + Math.floor(Math.random() * 240)),
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        createdAt: created,
      },
    });
  }
  console.log(`  ✅ ${activityLogs.length} activity log entries created`);

  // ═══════════════════════════════════════════════════════════════
  // DONE!
  // ═══════════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  🎉 SEEDING COMPLETE!");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\nCredentials (all use password: password123):");
  console.log("   admin@college.com         / password123");
  console.log("   registrar@college.com     / password123");
  console.log("   amit.verma@college.com    / password123  (CSE faculty)");
  console.log("   sneha.patil@college.com   / password123  (CSE faculty)");
  console.log("   meena.iyer@college.com    / password123  (ME faculty)");
  console.log("   anita.desai@college.com   / password123  (ECE faculty)");
  console.log("   deepak.singh@college.com  / password123  (CE faculty)");
  console.log("   pooja.nair@college.com    / password123  (EE faculty)");
  console.log("   warden.boys@college.com   / password123  (boys warden)");
  console.log("   warden.girls@college.com  / password123  (girls warden)");
  console.log("   rahul.sharma@student.com  / password123  (CSE student)");
  console.log("   priya.singh@student.com   / password123  (CSE student)");
  console.log("   manish.tiwari@student.com / password123  (ME student)");
  console.log("   megha.das@student.com     / password123  (ECE student)");
  console.log("   gaurav.choudhary@student.com / password123  (CE student)");
  console.log("   ritu.dey@student.com      / password123  (EE student)");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
