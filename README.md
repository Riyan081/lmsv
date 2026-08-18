 - docker run -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres
 - bunx prisma migrate dev --name init
 - bunx prisma generate
 - bun run apps/ws-server/src/index.ts

 created docker files 

 - docker build --build-arg DATABASE_URL=${DATABASE_URL} -t todo-app-frontend:dev -f docker/Dockerfile.frontend .
 - docker build -t todo-app-backend:dev -f docker/Dockerfile.backend .
 - docker build -t todo-app-ws:dev -f docker/Dockerfile.ws .
 

# 🧪 University LMS — Complete Testing Walkthrough

> **App URL**: [http://localhost:3000](http://localhost:3000)  
> **API Server**: [http://localhost:3001](http://localhost:3001)  
> **All passwords**: `password123`

> [!IMPORTANT]
> Test in this exact order (Admin → Faculty → Student → Warden) to avoid redundant logins. Each role has its own sidebar, so you'll see different pages for each.

---

## 🔐 Master Credentials Reference

### Admins
| Email | Name | Notes |
|---|---|---|
| `admin@college.com` | Dr. Rajesh Kumar | Super Admin, CSE dept |
| `registrar@college.com` | Mrs. Priya Sharma | Registrar |

### Faculty (12 total — use these key ones)
| Email | Name | Department | Subjects |
|---|---|---|---|
| `amit.verma@college.com` | Prof. Amit Verma | CSE | DSA (CS501), DSA Lab (CS591) |
| `sneha.patil@college.com` | Dr. Sneha Patil | CSE | OS (CS502), DBMS (CS503), DBMS Lab (CS592) |
| `ravi.krishnan@college.com` | Prof. Ravi Krishnan | CSE | Networks (CS504), SE (CS505) |
| `meena.iyer@college.com` | Dr. Meena Iyer | ME | Thermo II (ME501), Fluids (ME502) |
| `anita.desai@college.com` | Dr. Anita Desai | ECE | DSP (EC501), VLSI (EC502) |
| `deepak.singh@college.com` | Dr. Deepak Singh | CE | Structural (CE501), Geotech (CE502) |
| `pooja.nair@college.com` | Prof. Pooja Nair | EE | Power Systems (EE501), Control (EE502) |

### Students (32 total — use these key ones)
| Email | Name | Department | Section | Hostel |
|---|---|---|---|---|
| `rahul.sharma@student.com` | Rahul Sharma | CSE | 2023/A | Boys A - Room 101 |
| `priya.singh@student.com` | Priya Singh | CSE | 2023/A | Girls A - Room 101 |
| `ananya.mishra@student.com` | Ananya Mishra | CSE | 2023/B | Girls A - Room 102 |
| `manish.tiwari@student.com` | Manish Tiwari | ME | 2023/A | Boys A - Room 201 |
| `megha.das@student.com` | Megha Das | ECE | 2023/A | Girls A - Room 201 |
| `gaurav.choudhary@student.com` | Gaurav Choudhary | CE | 2023/A | Boys B - Room 101 |
| `ritu.dey@student.com` | Ritu Dey | EE | 2024/A | Girls B - Room 102 |

### Wardens
| Email | Name | Manages |
|---|---|---|
| `warden.boys@college.com` | Mr. Ramesh Yadav | Boys Hostel A & B |
| `warden.girls@college.com` | Mrs. Sunita Devi | Girls Hostel A & B |

---

## Phase 1: 👑 Admin Testing

> **Login with**: `admin@college.com` / `password123`

### Step 1.1 — Sign In & Dashboard
1. Go to [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
2. Enter `admin@college.com` and `password123`
3. Click Sign In → Should redirect to `/dashboard`
4. **Verify dashboard shows**:
   - ✅ Welcome message: "Welcome back, Dr. Rajesh Kumar! 👋"
   - ✅ Stats grid: Total Students (32), Total Faculty (12), Departments (5), Subjects, Pending Leaves, Today's Attendance %
   - ✅ Activity Feed section (left column)
   - ✅ Upcoming Events section (right column)
   - ✅ Recent Announcements section

### Step 1.2 — Activity Log
1. Click **📋 Activity Log** in sidebar → `/admin/activity-log`
2. **Verify**: Table shows ~32 activity entries (login, create dept, mark attendance, approve/reject leaves, etc.)

### Step 1.3 — Academic Structure
Go through these pages sequentially via the sidebar:

| Sidebar Item | URL | What to verify |
|---|---|---|
| **🏛️ Departments** | `/admin/departments` | 5 departments: CSE, ME, ECE, CE, EE with codes and descriptions |
| **📚 Programs** | `/admin/programs` | 5 programs: B.Tech CSE/ME/ECE/CE/EE, all 4-year, 8 semesters |
| **👥 Batches** | `/admin/batches` | 6 batches: CSE 2023-2027, CSE 2024-2028, ME 2023, ECE 2023, CE 2023, EE 2024 |
| **📖 Subjects** | `/admin/subjects` | ~24 subjects across depts (CS501-CS592, ME501-ME591, EC501-EC591, CE501-CE503, EE501-EE503) |
| **🗓️ Timetable** | `/admin/timetable` | Timetable slots with day, time, room, faculty, section info |

### Step 1.4 — People Management
| Sidebar Item | URL | What to verify |
|---|---|---|
| **🎓 Students** | `/admin/students` | 32 students listed with name, email, enrollment no, batch, section, department |
| **👨‍🏫 Faculty** | `/admin/faculty` | 12 faculty listed with name, email, employee ID, department |

### Step 1.5 — Operations Management
| Sidebar Item | URL | What to verify |
|---|---|---|
| **✅ Attendance** | `/admin/attendance` | Attendance records across all departments (15 days history seeded) |
| **📝 Leave** | `/admin/leave` | ~16 leave applications: mix of approved, pending, rejected across students and faculty |
| **📝 Exams** | `/admin/exams` | ~16 exams: mid-terms and internals across all depts. Results with grades (A+ to F) |
| **📅 Calendar** | `/admin/calendar` | ~20 events: holidays (Independence Day, Diwali), exam periods, hackathon, sports day, workshops |
| **📢 Announcements** | `/admin/announcements` | 15 announcements: global, department-specific, hostel notices. Some pinned |
| **🏠 Hostel** | `/admin/hostel` | 4 hostels (Boys A&B, Girls A&B), rooms, allocations, gate passes, complaints |

### Step 1.6 — Sign Out
- Sign out before moving to the next role

---

## Phase 2: 👨‍🏫 Faculty Testing

> **Login with**: `amit.verma@college.com` / `password123` (CSE faculty — most data)

### Step 2.1 — Dashboard
1. Sign in at `/sign-in`
2. **Verify dashboard shows**:
   - ✅ "Welcome back, Prof. Amit Verma! 👋"
   - ✅ Stats: My Subjects count, Today's Classes count, Pending Leaves count
   - ✅ Today's Schedule (if today is Mon-Fri, should show CS501/CS502/CS591 classes)

### Step 2.2 — Teaching Features
| Sidebar Item | URL | What to verify |
|---|---|---|
| **🗓️ My Timetable** | `/faculty/timetable` | Shows Prof. Amit Verma's classes: CS501 (DSA) and CS591 (DSA Lab) for sections A & B |
| **✅ Mark Attendance** | `/faculty/attendance` | Can select subject → section → see student list → mark present/absent/late |
| **📝 Enter Marks** | `/faculty/marks` | Can select exam → see students → enter marks and grades |

### Step 2.3 — Management Features
| Sidebar Item | URL | What to verify |
|---|---|---|
| **📋 Leave** | `/faculty/leave` | Shows leave applications from students in assigned sections. Also shows own leave (Amit has a pending personal leave) |
| **📅 Calendar** | `/calendar` | Academic calendar with upcoming events |
| **📢 Announcements** | `/announcements` | Can see global + CSE department announcements |

### Step 2.4 — Sign Out

> [!TIP]
> **Optional extra test**: Sign in as `meena.iyer@college.com` to verify ME faculty sees different subjects (ME501, ME502, ME591) and different students.

---

## Phase 3: 🎓 Student Testing

> **Login with**: `rahul.sharma@student.com` / `password123` (CSE 2023, Section A — most data)

### Step 3.1 — Dashboard
1. Sign in at `/sign-in`
2. **Verify dashboard shows**:
   - ✅ "Welcome back, Rahul Sharma! 👋"
   - ✅ Stats: Today's Classes, My Leaves, Recent Results
   - ✅ Today's schedule (if weekday — DSA, OS, DBMS, etc.)
   - ✅ Announcements section

### Step 3.2 — Academic Features
| Sidebar Item | URL | What to verify |
|---|---|---|
| **🗓️ My Timetable** | `/student/timetable` | Shows Rahul's classes: CS501-CS506, CS591-CS592 across Mon-Fri with rooms & faculty names |
| **✅ My Attendance** | `/student/attendance` | Attendance summary for each subject with present/absent/late counts (15 days of data) |
| **📊 My Results** | `/student/results` | Exam results: DSA Mid-Term, DSA Internal 1, OS Mid-Term, DBMS Mid-Term, Networks Internal, SE Mid-Term — each with marks and grade |

### Step 3.3 — Services
| Sidebar Item | URL | What to verify |
|---|---|---|
| **📝 Apply Leave** | `/student/leave` | Can see past leaves: Rahul has 1 approved medical leave ("Fever and cold"). Can apply for new leave |
| **🏠 Hostel** | `/student/hostel` | Shows allocation: Boys Hostel Block A, Room 101. Can see complaints and gate passes |
| **📅 Calendar** | `/calendar` | Academic events visible |
| **📢 Announcements** | `/announcements` | Global + CSE department announcements visible |

### Step 3.4 — Sign Out

> [!TIP]
> **Optional extra tests**:
> - `priya.singh@student.com` — CSE female student in Girls Hostel A, Room 101. Has approved personal leave.
> - `manish.tiwari@student.com` — ME student, different subjects (ME501-ME591), Boys Hostel A, Room 201.
> - `ananya.mishra@student.com` — CSE Section B student, had a **rejected** leave. Good to check that "rejected" status displays.

---

## Phase 4: 🏠 Warden Testing

> **Login with**: `warden.boys@college.com` / `password123`

### Step 4.1 — Dashboard
1. Sign in at `/sign-in`
2. **Verify dashboard shows**:
   - ✅ "Welcome back, Mr. Ramesh Yadav! 👋"
   - ✅ Stats: My Hostels (2), Total Rooms, Pending Gate Passes, Open Complaints
   - ✅ Pending Gate Passes list (Vikram Joshi, Manish Tiwari should show as pending)
   - ✅ Open Complaints list

### Step 4.2 — Hostel Management
| Sidebar Item | URL | What to verify |
|---|---|---|
| **🚪 Rooms** | `/warden/rooms` | Boys Hostel A: 25 rooms (floors 1-3), Boys Hostel B: 10 rooms. Shows occupancy |
| **🎫 Gate Pass** | `/warden/gate-pass` | 12 gate passes total. Boys warden sees: Rahul (approved), Arjun (approved), Vikram (pending), Rohit (rejected), Manish (pending), Aman (approved), Gaurav (approved) |
| **📋 Complaints** | `/warden/complaints` | Complaints from boys hostels: plumbing, electrical, furniture, WiFi issues with open/in-progress/resolved statuses |
| **📢 Announcements** | `/announcements` | Can see hostel-specific + global announcements |

### Step 4.3 — Sign Out

> [!TIP]
> **Optional**: Login as `warden.girls@college.com` to verify Girls Hostel data: gate passes for Priya Singh, Neha Gupta, Megha Das. Complaints from girls hostels.

---

## Phase 5: 🌐 Public/General Pages

Test these pages **without logging in** (sign out first):

| URL | What to verify |
|---|---|
| [http://localhost:3000](http://localhost:3000) | Landing/home page loads |
| [http://localhost:3000/sign-in](http://localhost:3000/sign-in) | Sign-in form with email + password fields |
| [http://localhost:3000/sign-up](http://localhost:3000/sign-up) | Sign-up form (if public registration is enabled) |

---

## ✅ Quick Smoke Test Checklist

If you're short on time, just test these critical paths:

| # | Action | Expected |
|---|---|---|
| 1 | Login as `admin@college.com` | Dashboard with 6 stat cards, activity feed |
| 2 | Visit `/admin/students` | 32 students listed |
| 3 | Visit `/admin/exams` | 16 exams with results |
| 4 | Sign out, login as `amit.verma@college.com` | Faculty dashboard with subjects and schedule |
| 5 | Visit `/faculty/attendance` | Can see student list for attendance marking |
| 6 | Sign out, login as `rahul.sharma@student.com` | Student dashboard with classes, leaves, results |
| 7 | Visit `/student/results` | Shows exam marks and grades |
| 8 | Visit `/student/hostel` | Shows Boys Hostel A, Room 101 |
| 9 | Sign out, login as `warden.boys@college.com` | Warden dashboard with hostels, gate passes, complaints |
| 10 | Visit `/warden/gate-pass` | Gate passes with approve/reject/pending statuses |

---

## 🐛 Known Issues to Check

| Issue | Where to look |
|---|---|
| Hydration mismatch warning | Browser console — minor, caused by date formatting differences between server/client |
| `BETTER_AUTH_SECRET` warning | Terminal — warning about low-entropy secret (dev only, not a problem) |
| Timetable shows "No classes today" on weekends | Expected behavior — timetable slots are Mon(0) to Fri(4) |

---

## 📊 Data Summary

| Entity | Count |
|---|---|
| Departments | 5 |
| Programs | 5 |
| Batches | 6 |
| Sections | 7 |
| Subjects | 24 |
| Admins | 2 |
| Faculty | 12 |
| Students | 32 |
| Wardens | 2 |
| Timetable slots | ~45 |
| Attendance records | ~1500+ |
| Leave applications | 16 |
| Exams | 16 |
| Exam results | ~100+ |
| Hostels | 4 |
| Rooms | 60 |
| Room allocations | 29 |
| Gate passes | 12 |
| Complaints | 12 |
| Announcements | 15 |
| Calendar events | 20 |
| Activity logs | 32 |
