# 🎓 University LMS — Learning Management System

A full-stack, multi-role **University Learning Management System** built with **Next.js**, **Express**, **Prisma**, **PostgreSQL**, **WebSockets**, and **Better Auth**. Supports Admin, Faculty, Student, and Warden roles with realistic Indian engineering college data.

> **Tech Stack**: Next.js 16 · Express 5 · Prisma ORM · PostgreSQL 16 · WebSocket · Better Auth · Bun · TailwindCSS 4 · Turborepo

---

## 📋 Table of Contents

- [Quick Start (Docker Compose)](#-quick-start-docker-compose)
- [Manual Setup (Without Docker)](#-manual-setup-without-docker)
- [Seed the Database](#-seed-the-database)
- [Project Architecture](#-project-architecture)
- [Environment Variables](#-environment-variables)
- [Testing Walkthrough](#-complete-testing-walkthrough)
  - [Master Credentials](#-master-credentials-reference)
  - [Phase 1: Admin Testing](#phase-1--admin-testing)
  - [Phase 2: Faculty Testing](#phase-2--faculty-testing)
  - [Phase 3: Student Testing](#phase-3--student-testing)
  - [Phase 4: Warden Testing](#phase-4--warden-testing)
  - [Phase 5: Public Pages](#phase-5--publicgeneral-pages)
  - [Quick Smoke Test](#-quick-smoke-test-checklist)
- [API Testing](#-api-testing)
- [Seed Data Summary](#-seed-data-summary)
- [Known Issues](#-known-issues)

---

## 🚀 Quick Start (Docker Compose)

> **Prerequisites**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running, [Git](https://git-scm.com/downloads)

### 1. Clone the Repository

```bash
git clone https://github.com/Riyan081/lmsv.git
cd lmsv
```

### 2. Start All Services

```bash
docker compose up --build -d
```

This single command spins up **4 services**:

| Service | Port | Description |
|---|---|---|
| `db` | `5432` | PostgreSQL 16 (Alpine) |
| `db-migrate` | — | Runs Prisma migrations, then exits |
| `backend` | `3001` | Express API server |
| `frontend` | `3000` | Next.js web app |
| `ws` | `8080` | WebSocket server (real-time) |

### 3. Verify Services Are Running

```bash
docker compose ps
```

You should see `db`, `backend`, `frontend`, and `ws` with status **running**. The `db-migrate` service will show as **exited (0)** — that's expected (it runs migrations and exits).

### 4. Seed the Database

The database starts empty. You need to seed it with realistic test data:

```bash
# Install dependencies locally (needed for seed script)
bun install

# Generate Prisma client
bun run db:generate

# Run the seed script
# PowerShell:
$env:DATABASE_URL='postgresql://postgres:mysecretpassword@localhost:5432/postgres'
$env:BETTER_AUTH_SECRET='supersecretkey123'
bun run packages/db/prisma/seed.ts

# Bash / macOS / Linux:
DATABASE_URL='postgresql://postgres:mysecretpassword@localhost:5432/postgres' \
BETTER_AUTH_SECRET='supersecretkey123' \
bun run packages/db/prisma/seed.ts
```

### 5. Open the App

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:3001](http://localhost:3001)
- **WebSocket**: `ws://localhost:8080`

### 6. Login with Seed Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@college.com` | `password123` |
| **Faculty** | `amit.verma@college.com` | `password123` |
| **Student** | `aarav.sharma@student.college.com` | `password123` |

### Stop / Restart

```bash
# Stop all services
docker compose down

# Stop and remove all data (volumes)
docker compose down -v

# Restart
docker compose up -d
```

---

## 🛠️ Manual Setup (Without Docker)

> **Prerequisites**: [Bun](https://bun.sh/) (v1.3+), [Node.js](https://nodejs.org/) (v18+), [PostgreSQL](https://www.postgresql.org/) (v16)

### 1. Clone & Install

```bash
git clone https://github.com/Riyan081/lmsv.git
cd lmsv
bun install
```

### 2. Start PostgreSQL

```bash
# Using Docker (just the database)
docker run -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres:16-alpine
```

Or use your local PostgreSQL installation.

### 3. Set Up Environment Variables

Create env files for each app (see [Environment Variables](#-environment-variables) section below).

### 4. Run Migrations & Generate Client

```bash
# Generate Prisma client
bun run db:generate

# Run migrations
cd packages/db
bunx prisma migrate deploy --schema prisma/schema.prisma
cd ../..
```

### 5. Seed the Database

```bash
# PowerShell:
$env:DATABASE_URL='postgresql://postgres:mysecretpassword@localhost:5432/postgres'
$env:BETTER_AUTH_SECRET='supersecretkey123'
bun run packages/db/prisma/seed.ts
```

### 6. Start Development Servers

```bash
# Start all services (frontend + backend + ws) via Turborepo
bun run dev
```

Or start individually:

```bash
bun run start:https   # Backend API on :3001
bun run start:web     # Frontend on :3000
bun run start:ws      # WebSocket on :8080
```

---

## 🌱 Seed the Database

The seed script creates a **complete, realistic Indian engineering college** dataset. Run it after the database is up and migrations are applied.

```bash
# Set env vars first, then run:
bun run packages/db/prisma/seed.ts
```

> [!IMPORTANT]
> The seed script **clears all existing data** before inserting. Don't run it on a database with data you want to keep.

### What Gets Seeded

The seed creates **3 departments** (Computer Engineering, Information Technology, AI & Data Science) with a full academic structure:

| Entity | Count | Details |
|---|---|---|
| Departments | 3 | CMPN, IT, AIDS |
| Programs | 3 | B.Tech (4 years, 8 semesters each) |
| Batches | 6 | 2023-2027 and 2024-2028 for each dept |
| Sections | 8 | A/B per batch (e.g., CMPN-23A, CMPN-23B) |
| Semesters | 24 | 1-8 per program (current: Sem 5) |
| Subjects | 40 | 14 CMPN + 13 IT + 13 AI (Sem 3 & Sem 5) |
| Admin | 1 | `admin@college.com` |
| Faculty | 18 | 6 per department |
| Students | 48 | 6 per section |
| Faculty-Subject links | 56 | Timetable-ready assignments |
| Timetable slots | ~100+ | Auto-generated for all 8 sections |
| Attendance records | ~1500+ | Last 2 weeks, all sections |
| Exams | 15 | Mid-terms + internals across all depts |
| Leave applications | 16 | Mixed approved/pending/rejected |
| Calendar events | 9 | Holidays, exams, TechFest, workshops |
| Hostels | 2 | Boys + Girls hostel |
| Rooms | 30 | 15 per hostel across 3 floors |
| Hostel allocations | 3 | Sample student room assignments |
| Announcements | 5 | Global, pinned, department-specific |
| Activity logs | 8 | Recent activity for dashboard |

### Seed Credentials

**All accounts use password: `password123`**

| Role | Email Pattern | Example |
|---|---|---|
| Admin | `admin@college.com` | Dr. Rajesh Kumar |
| Faculty | `firstname.lastname@college.com` | `amit.verma@college.com` |
| Students | `firstname.lastname@student.college.com` | `aarav.sharma@student.college.com` |

---

## 🏗️ Project Architecture

```
lmsv/
├── apps/
│   ├── web/              # Next.js 16 frontend (port 3000)
│   ├── https/            # Express 5 API backend (port 3001)
│   └── ws-server/        # WebSocket server (port 8080)
├── packages/
│   ├── db/               # Prisma schema, migrations, seed
│   ├── auth/             # Better Auth configuration
│   ├── ui/               # Shared UI components
│   ├── common/           # Shared utilities
│   ├── storage/          # File storage utilities
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/# Shared TS config
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── Dockerfile.ws
├── scripts/
│   └── test-api.mjs      # API endpoint test suite
├── docker-compose.yml     # Full stack orchestration
├── turbo.json             # Turborepo pipeline config
└── package.json           # Root workspace config
```

### Service Dependencies

```
Frontend (Next.js :3000) ──→ Backend API (:3001) ──→ PostgreSQL (:5432)
                         ──→ WebSocket (:8080)   ──→ PostgreSQL (:5432)
```

---

## 🔑 Environment Variables

### `apps/https/.env` (Backend API)

```env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3001
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:3001
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
CORS_ORIGIN=http://localhost:3000

# OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### `apps/web/.env.local` (Frontend)

```env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres

# OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### `apps/ws-server/.env` (WebSocket)

```env
BETTER_AUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
```

### `packages/db/.env` (Prisma)

```env
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
```

> [!NOTE]
> When using Docker Compose, the `DATABASE_URL` inside containers uses `db` as the hostname instead of `localhost` (e.g., `postgresql://postgres:mysecretpassword@db:5432/postgres`). This is handled automatically in `docker-compose.yml`.

---

## 🧪 Complete Testing Walkthrough

> **App URL**: [http://localhost:3000](http://localhost:3000)
> **API Server**: [http://localhost:3001](http://localhost:3001)
> **All passwords**: `password123`

> [!IMPORTANT]
> Test in this exact order (Admin → Faculty → Student) to see the different role dashboards and sidebar menus. Each role has its own set of pages.

---

### 🔐 Master Credentials Reference

#### Admin
| Email | Name |
|---|---|
| `admin@college.com` | Dr. Rajesh Kumar |

#### Faculty (18 total — key ones per department)

| Email | Name | Department | Key Subjects |
|---|---|---|---|
| `amit.verma@college.com` | Prof. Amit Verma | CMPN | DSA (CMPN501), DSA Lab (CMPN591) |
| `sneha.patil@college.com` | Dr. Sneha Patil | CMPN | OS (CMPN502), SE (CMPN505) |
| `ravi.krishnan@college.com` | Prof. Ravi Krishnan | CMPN | DBMS (CMPN503), DBMS Lab (CMPN592) |
| `anita.desai@college.com` | Dr. Anita Desai | IT | Web Dev (IT501), Web Dev Lab (IT591) |
| `meena.iyer@college.com` | Dr. Meena Iyer | IT | Cloud Computing (IT503) |
| `deepak.singh@college.com` | Dr. Deepak Singh | AIDS | ML (AI501), ML Lab (AI591) |
| `pooja.nair@college.com` | Prof. Pooja Nair | AIDS | NLP (AI502) |

#### Students (48 total — key ones per department)

| Email | Name | Department | Section |
|---|---|---|---|
| `aarav.sharma@student.college.com` | Aarav Sharma | CMPN | 2023/A |
| `priya.patel@student.college.com` | Priya Patel | CMPN | 2023/A |
| `arjun.gupta@student.college.com` | Arjun Gupta | CMPN | 2023/B |
| `dev.rajput@student.college.com` | Dev Rajput | IT | 2023/A |
| `riya.chopra@student.college.com` | Riya Chopra | IT | 2023/A |
| `raj.prabhu@student.college.com` | Raj Prabhu | AIDS | 2023/A |

---

### Phase 1: 👑 Admin Testing

> **Login with**: `admin@college.com` / `password123`

#### Step 1.1 — Sign In & Dashboard
1. Go to [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
2. Enter `admin@college.com` and `password123`
3. Click Sign In → Should redirect to `/dashboard`
4. **Verify dashboard shows**:
   - ✅ Welcome message with admin name
   - ✅ Stats grid: Total Students (48), Total Faculty (18), Departments (3), Subjects
   - ✅ Activity Feed section
   - ✅ Upcoming Events section
   - ✅ Recent Announcements section

#### Step 1.2 — Academic Structure

Go through these pages sequentially via the sidebar:

| Sidebar Item | URL | What to verify |
|---|---|---|
| **🏛️ Departments** | `/admin/departments` | 3 departments: CMPN, IT, AIDS with codes and descriptions |
| **📚 Programs** | `/admin/programs` | 3 programs: B.Tech CMPN/IT/AIDS, all 4-year, 8 semesters |
| **👥 Batches** | `/admin/batches` | 6 batches: 2023-2027 and 2024-2028 for each dept |
| **📖 Subjects** | `/admin/subjects` | ~40 subjects across depts (CMPN501-592, IT501-592, AI501-592 + Sem 3 subjects) |
| **🗓️ Timetable** | `/admin/timetable` | Timetable slots with day, time, room, faculty, section info |

#### Step 1.3 — People Management

| Sidebar Item | URL | What to verify |
|---|---|---|
| **🎓 Students** | `/admin/students` | 48 students listed with name, email, enrollment no, batch, section, department |
| **👨‍🏫 Faculty** | `/admin/faculty` | 18 faculty listed with name, email, employee ID, department |

#### Step 1.4 — Operations Management

| Sidebar Item | URL | What to verify |
|---|---|---|
| **✅ Attendance** | `/admin/attendance` | Attendance records across all departments (2 weeks history seeded) |
| **📝 Leave** | `/admin/leave` | ~16 leave applications: mix of approved, pending, rejected across students and faculty |
| **📝 Exams** | `/admin/exams` | ~15 exams: mid-terms and internals across all depts with results |
| **📅 Calendar** | `/admin/calendar` | 9 events: Independence Day, Ganesh Chaturthi, Diwali, TechFest, exam periods, workshops |
| **📢 Announcements** | `/admin/announcements` | 5 announcements: global + pinned (TechFest, Placement Drive) |
| **🏠 Hostel** | `/admin/hostel` | 2 hostels (Boys + Girls), rooms, allocations |

#### Step 1.5 — Sign Out
- Sign out before moving to the next role

---

### Phase 2: 👨‍🏫 Faculty Testing

> **Login with**: `amit.verma@college.com` / `password123` (CMPN faculty — most data)

#### Step 2.1 — Dashboard
1. Sign in at `/sign-in`
2. **Verify dashboard shows**:
   - ✅ Welcome message with faculty name
   - ✅ Stats: My Subjects count, Today's Classes count
   - ✅ Today's Schedule (if today is Mon-Fri, should show CMPN501/CMPN591 classes)

#### Step 2.2 — Teaching Features

| Sidebar Item | URL | What to verify |
|---|---|---|
| **🗓️ My Timetable** | `/faculty/timetable` | Shows Prof. Amit Verma's classes: CMPN501 (DSA) and CMPN591 (DSA Lab) for sections A & B |
| **✅ Mark Attendance** | `/faculty/attendance` | Can select subject → section → see student list → mark present/absent/late |
| **📝 Enter Marks** | `/faculty/marks` | Can select exam → see students → enter marks and grades |

#### Step 2.3 — Management Features

| Sidebar Item | URL | What to verify |
|---|---|---|
| **📋 Leave** | `/faculty/leave` | Shows leave applications from students in assigned sections |
| **📅 Calendar** | `/calendar` | Academic calendar with upcoming events |
| **📢 Announcements** | `/announcements` | Can see global announcements |

#### Step 2.4 — Sign Out

> [!TIP]
> **Optional extra test**: Sign in as `anita.desai@college.com` to verify IT faculty sees different subjects (IT501, IT591) and different students.

---

### Phase 3: 🎓 Student Testing

> **Login with**: `aarav.sharma@student.college.com` / `password123` (CMPN 2023, Section A — most data)

#### Step 3.1 — Dashboard
1. Sign in at `/sign-in`
2. **Verify dashboard shows**:
   - ✅ Welcome message with student name
   - ✅ Stats: Today's Classes, My Leaves, Recent Results
   - ✅ Today's schedule (if weekday — DSA, OS, DBMS, etc.)
   - ✅ Announcements section

#### Step 3.2 — Academic Features

| Sidebar Item | URL | What to verify |
|---|---|---|
| **🗓️ My Timetable** | `/student/timetable` | Shows classes: CMPN501-CMPN505, CMPN591-CMPN592 across Mon-Fri with rooms & faculty |
| **✅ My Attendance** | `/student/attendance` | Attendance summary for each subject with present/absent/late counts (2 weeks) |
| **📊 My Results** | `/student/results` | Exam results: DSA Mid-Term, OS Mid-Term, DBMS Internal — each with marks and grade |

#### Step 3.3 — Services

| Sidebar Item | URL | What to verify |
|---|---|---|
| **📝 Apply Leave** | `/student/leave` | Can see past leaves: Aarav has 1 approved medical leave ("Fever and cold"). Can apply new |
| **🏠 Hostel** | `/student/hostel` | Shows hostel allocation (if assigned) |
| **📅 Calendar** | `/calendar` | Academic events visible |
| **📢 Announcements** | `/announcements` | Global announcements visible |

#### Step 3.4 — Sign Out

> [!TIP]
> **Optional extra tests**:
> - `priya.patel@student.college.com` — CMPN female student, pending personal leave
> - `dev.rajput@student.college.com` — IT student, different subjects (IT501-IT505)
> - `arjun.gupta@student.college.com` — CMPN Section B student (cross-section test)

---

### Phase 4: 🏠 Warden Testing

> [!NOTE]
> Warden role is not seeded by default in the current seed script. If your app has a warden dashboard, create warden users separately or update the seed.

---

### Phase 5: 🌐 Public/General Pages

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
| 1 | Login as `admin@college.com` | Dashboard with stat cards, activity feed |
| 2 | Visit `/admin/students` | 48 students listed |
| 3 | Visit `/admin/departments` | 3 departments (CMPN, IT, AIDS) |
| 4 | Visit `/admin/exams` | 15 exams with results |
| 5 | Sign out, login as `amit.verma@college.com` | Faculty dashboard with subjects and schedule |
| 6 | Visit `/faculty/attendance` | Can see student list for attendance marking |
| 7 | Sign out, login as `aarav.sharma@student.college.com` | Student dashboard with classes, leaves, results |
| 8 | Visit `/student/results` | Shows exam marks and grades |
| 9 | Visit `/student/attendance` | Attendance summary with 2 weeks of data |
| 10 | Test sign-out and sign-in flow | Clean session management |

---

## 🔬 API Testing

Run the automated API test suite against the backend:

```bash
# Make sure the backend is running on :3001
node scripts/test-api.mjs
```

This script tests all API endpoints: auth, departments, attendance, leave, timetable, exams, calendar, hostel, announcements, activity log, and dashboard.

### Load Testing

```bash
# Run 3000 requests with 100 concurrent
bun run load-test.js
```

Tests Better Auth's rate limiter — expect `429 Too Many Requests` responses proving rate limiting is active.

---

## 📊 Seed Data Summary

| Entity | Count |
|---|---|
| Departments | 3 (CMPN, IT, AIDS) |
| Programs | 3 |
| Batches | 6 |
| Sections | 8 |
| Subjects | 40 |
| Semesters | 24 |
| Admin | 1 |
| Faculty | 18 |
| Students | 48 |
| Faculty-Subject assignments | 56 |
| Timetable slots | ~100+ |
| Attendance records | ~1500+ |
| Exams | 15 |
| Leave applications | 16 |
| Calendar events | 9 |
| Hostels | 2 |
| Rooms | 30 |
| Hostel allocations | 3 |
| Announcements | 5 |
| Activity logs | 8 |

---

## 🐛 Known Issues

| Issue | Where to look |
|---|---|
| Hydration mismatch warning | Browser console — minor, caused by date formatting differences between server/client |
| `BETTER_AUTH_SECRET` warning | Terminal — warning about low-entropy secret (dev only, not a problem) |
| Timetable shows "No classes today" on weekends | Expected behavior — timetable slots are Mon(0) to Fri(4) |

---

## 📝 License

This project is private and intended for educational purposes.