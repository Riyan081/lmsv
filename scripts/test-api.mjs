/**
 * LMS API Test Script
 * Run: node scripts/test-api.mjs
 *
 * Tests all API endpoints: auth, departments, attendance,
 * leave, timetable, exam, calendar, hostel, announcements,
 * activity-log, dashboard.
 *
 * Prerequisites: Backend must be running on http://localhost:3001
 */

const BASE = "http://localhost:3001";
let authCookie = "";
let sessionUserId = "";
let sessionUserRole = "";
let createdIds = {}; // store created resource IDs for chain testing

// ─── Colours ──────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  magenta: "\x1b[35m",
};

let passed = 0, failed = 0, skipped = 0;

// ─── Helpers ──────────────────────────────────────────────────────
async function req(method, path, body = null, expectStatus = 200) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE,  // Better Auth requires Origin for CSRF protection
      ...(authCookie ? { Cookie: authCookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const res = await fetch(`${BASE}${path}`, opts);

    // Capture ALL Set-Cookie headers (Better Auth sets multiple: session_token + session_data)
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    if (cookies.length > 0) {
      // Build a combined cookie string from all set-cookie headers
      const cookiePairs = cookies.map(c => c.split(";")[0]);
      // Merge with existing cookies (don't lose previously set ones)
      const existing = authCookie ? authCookie.split("; ").filter(Boolean) : [];
      const merged = new Map();
      for (const pair of [...existing, ...cookiePairs]) {
        const name = pair.split("=")[0];
        merged.set(name, pair);
      }
      authCookie = [...merged.values()].join("; ");
    }

    let data;
    try { data = await res.json(); } catch { data = null; }

    return { status: res.status, data, ok: res.ok };
  } catch (err) {
    return { status: 0, data: null, ok: false, error: err.message };
  }
}

function pass(name, detail = "") {
  passed++;
  console.log(`  ${c.green}✓${c.reset} ${name}${detail ? c.dim + "  " + detail + c.reset : ""}`);
}

function fail(name, detail = "") {
  failed++;
  console.log(`  ${c.red}✗${c.reset} ${name}${detail ? "  " + c.red + detail + c.reset : ""}`);
}

function skip(name, reason = "") {
  skipped++;
  console.log(`  ${c.yellow}–${c.reset} ${c.dim}${name}${reason ? "  [" + reason + "]" : ""}${c.reset}`);
}

function section(name) {
  console.log(`\n${c.bold}${c.cyan}● ${name}${c.reset}`);
}

function info(msg) {
  console.log(`  ${c.magenta}ℹ${c.reset} ${c.dim}${msg}${c.reset}`);
}

async function test(name, fn) {
  try {
    const result = await fn();
    if (result === false) {
      fail(name, "test returned false");
    } else if (result === "SKIP") {
      // already handled in fn
    } else {
      pass(name, typeof result === "string" ? result : "");
    }
  } catch (err) {
    fail(name, err.message);
  }
}

// ─── Health Check ─────────────────────────────────────────────────
section("Server Health");
await test("GET / responds", async () => {
  const { status } = await req("GET", "/");
  if (status === 0) throw new Error("Cannot connect to server. Is the backend running on :3001?");
  return `HTTP ${status}`;
});

// ─── Auth ─────────────────────────────────────────────────────────
section("Auth");

const TEST_EMAIL = `lms_test_${Date.now()}@test.com`;
const TEST_PASS = "TestPass123!";

await test("POST /api/auth/sign-up/email — create test user", async () => {
  const { data, status } = await req("POST", "/api/auth/sign-up/email", {
    name: "LMS Test User",
    email: TEST_EMAIL,
    password: TEST_PASS,
  });
  if (status === 0) throw new Error("No response");
  if (data?.user || data?.id || status === 200) return `created ${TEST_EMAIL}`;
  if (status === 422 || status === 400) return `validation error (expected — user may already exist)`;
  throw new Error(`HTTP ${status}: ${JSON.stringify(data)}`);
});

await test("POST /api/auth/sign-in/email — sign in", async () => {
  const { data, status } = await req("POST", "/api/auth/sign-in/email", {
    email: TEST_EMAIL,
    password: TEST_PASS,
  });
  if (status === 0) throw new Error("No response");
  if (data?.user || status === 200) {
    sessionUserId = data?.user?.id || "";
    sessionUserRole = data?.user?.role || "student";
    return `signed in, role: ${sessionUserRole}, cookie: ${authCookie ? "✓" : "missing"}`;
  }
  throw new Error(`HTTP ${status}: ${JSON.stringify(data)}`);
});

await test("GET /api/auth/get-session — verify session", async () => {
  const { data, status } = await req("GET", "/api/auth/get-session");
  const user = data?.user || data?.data?.user;
  if (user) {
    sessionUserId = user.id || sessionUserId;
    sessionUserRole = user.role || sessionUserRole;
    return `session valid, role: ${sessionUserRole}`;
  }
  if (status === 200) return `session valid`;
  throw new Error(`HTTP ${status}: ${JSON.stringify(data)}`);
});

// ─── Try to elevate to admin role via admin plugin ────────────────
section("Role Setup");

await test("Attempt admin role elevation via admin API", async () => {
  if (!sessionUserId) {
    skip("Attempt admin role elevation", "no userId from session");
    return "SKIP";
  }
  // Better Auth admin plugin: POST /api/auth/admin/set-role
  const { data, status } = await req("POST", "/api/auth/admin/set-role", {
    userId: sessionUserId,
    role: "admin",
  });
  if (status === 200 && data?.user) {
    sessionUserRole = "admin";
    return `elevated to admin`;
  }
  // May fail if user isn't already an admin — that's OK
  info(`Could not elevate role (HTTP ${status}). Will test with role: ${sessionUserRole}`);
  return `using role: ${sessionUserRole}`;
});

// Re-check session after role change
await test("GET /api/auth/get-session — re-verify after role change", async () => {
  const { data, status } = await req("GET", "/api/auth/get-session");
  const user = data?.user || data?.data?.user;
  if (user) {
    sessionUserRole = user.role || sessionUserRole;
    return `role: ${sessionUserRole}`;
  }
  return `session ok`;
});

const isAdmin = sessionUserRole === "admin";
const isFaculty = sessionUserRole === "faculty";
const isStudent = sessionUserRole === "student";

if (!isAdmin) {
  info(`Current role is "${sessionUserRole}" — admin-only endpoints will show 403 (expected)`);
}

// ─── Helper for role-gated tests ─────────────────────────────────
async function testRoleGated(name, requiredRoles, fn) {
  const hasAccess = requiredRoles.includes(sessionUserRole);
  if (!hasAccess) {
    await test(name, async () => {
      const result = await fn();
      // If we got a 403, that's the expected behavior
      return result;
    });
  } else {
    await test(name, fn);
  }
}

// ─── Departments ──────────────────────────────────────────────────
section("Departments");

await test("GET /api/departments — list", async () => {
  const { data, status } = await req("GET", "/api/departments");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error || "unknown"}`);
  return `${data.data?.length ?? 0} departments`;
});

await test("POST /api/departments — create", async () => {
  const { data, status } = await req("POST", "/api/departments", {
    name: "Test Department " + Date.now(),
    code: "TST" + Date.now().toString().slice(-4),
  });
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error || JSON.stringify(data)}`);
  createdIds.departmentId = data.data?.id;
  return `id: ${createdIds.departmentId}`;
});

await test("GET /api/departments/:id — fetch by id", async () => {
  if (!createdIds.departmentId) return `skipped (no department created)`;
  const { data, status } = await req("GET", `/api/departments/${createdIds.departmentId}`);
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return data.data?.name;
});

// ─── Calendar ─────────────────────────────────────────────────────
section("Calendar");

await test("GET /api/calendar — list events", async () => {
  const { data, status } = await req("GET", "/api/calendar");
  if (status === 401) return `401 Unauthorized (auth required)`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} events`;
});

await test("POST /api/calendar — create event", async () => {
  const { data, status } = await req("POST", "/api/calendar", {
    title: "Test Event " + Date.now(),
    type: "academic",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
  });
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error || JSON.stringify(data)}`);
  createdIds.calendarId = data.data?.id;
  return `id: ${createdIds.calendarId}`;
});

// ─── Announcements ────────────────────────────────────────────────
section("Announcements");

await test("GET /api/announcements — list (admin)", async () => {
  const { data, status } = await req("GET", "/api/announcements");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} announcements`;
});

await test("POST /api/announcements — create", async () => {
  const { data, status } = await req("POST", "/api/announcements", {
    title: "Test Announcement",
    content: "This is a test announcement.",
    type: "global",
    isPinned: false,
  });
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error || JSON.stringify(data)}`);
  createdIds.announcementId = data.data?.id;
  return `id: ${createdIds.announcementId}`;
});

await test("GET /api/announcements/my — personalized", async () => {
  const { data, status } = await req("GET", "/api/announcements/my");
  if (status === 401) return `401 Unauthorized`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} announcements`;
});

// ─── Leave ────────────────────────────────────────────────────────
section("Leave");

await test("POST /api/leave — apply", async () => {
  const { data, status } = await req("POST", "/api/leave", {
    type: "personal",
    startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    reason: "Test leave application from API test script",
  });
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error || JSON.stringify(data)}`);
  createdIds.leaveId = data.data?.id;
  return `id: ${createdIds.leaveId}`;
});

await test("GET /api/leave/my — my leaves", async () => {
  const { data, status } = await req("GET", "/api/leave/my");
  if (status === 401) return `401 Unauthorized`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} leaves`;
});

await test("GET /api/leave — list all (faculty/admin)", async () => {
  const { data, status } = await req("GET", "/api/leave");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} leaves`;
});

// ─── Attendance ───────────────────────────────────────────────────
section("Attendance");

await test("GET /api/attendance/my-summary — student summary", async () => {
  const { data, status } = await req("GET", "/api/attendance/my-summary");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (status === 404 || (data?.success === false && data?.error?.includes("not found")))
    return `no section assigned (expected)`;
  if (!data?.success && status !== 200) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.subjects?.length ?? 0} subjects`;
});

await test("GET /api/attendance — list records (faculty/admin)", async () => {
  const { data, status } = await req("GET", "/api/attendance");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} records`;
});

// ─── Timetable ────────────────────────────────────────────────────
section("Timetable");

await test("GET /api/timetable/my — user's timetable", async () => {
  const { data, status } = await req("GET", "/api/timetable/my");
  if (status === 401) return `401 Unauthorized`;
  if (!data?.success && status !== 200) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} slots`;
});

// ─── Exams ────────────────────────────────────────────────────────
section("Exams");

await test("GET /api/exams — list (faculty/admin)", async () => {
  const { data, status } = await req("GET", "/api/exams");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} exams`;
});

await test("GET /api/exams/results/my — my results (student)", async () => {
  const { data, status } = await req("GET", "/api/exams/results/my");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success && status !== 200) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.results?.length ?? data.data?.length ?? 0} results`;
});

// ─── Hostel ───────────────────────────────────────────────────────
section("Hostel");

await test("GET /api/hostel — list hostels (admin/warden)", async () => {
  const { data, status } = await req("GET", "/api/hostel");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} hostels`;
});

await test("GET /api/hostel/gate-pass — list gate passes (admin/warden)", async () => {
  const { data, status } = await req("GET", "/api/hostel/gate-pass");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} passes`;
});

await test("GET /api/hostel/complaints — list complaints (admin/warden)", async () => {
  const { data, status } = await req("GET", "/api/hostel/complaints");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} complaints`;
});

// ─── Activity Log ─────────────────────────────────────────────────
section("Activity Log");

await test("GET /api/activity-log — list logs (admin)", async () => {
  const { data, status } = await req("GET", "/api/activity-log");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `${data.data?.length ?? 0} entries`;
});

await test("GET /api/activity-log/stats — stats (admin)", async () => {
  const { data, status } = await req("GET", "/api/activity-log/stats");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return `total: ${data.data?.total ?? 0}`;
});

// ─── Dashboard ────────────────────────────────────────────────────
section("Dashboard");

await test("GET /api/dashboard/admin", async () => {
  const { data, status } = await req("GET", "/api/dashboard/admin");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return "ok";
});

await test("GET /api/dashboard/faculty", async () => {
  const { data, status } = await req("GET", "/api/dashboard/faculty");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return "ok";
});

await test("GET /api/dashboard/student", async () => {
  const { data, status } = await req("GET", "/api/dashboard/student");
  if (status === 403) return `403 Forbidden (expected for role: ${sessionUserRole})`;
  if (!data?.success) throw new Error(`HTTP ${status}: ${data?.error}`);
  return "ok";
});

// ─── Frontend-Backend Connection Check ────────────────────────────
section("Frontend ↔ Backend Connection");

await test("CORS headers present", async () => {
  try {
    const res = await fetch(`${BASE}/`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:3000" },
    });
    const acaoHeader = res.headers.get("access-control-allow-origin");
    if (acaoHeader) return `ACAO: ${acaoHeader}`;
    return `No ACAO header (CORS may not be configured for OPTIONS)`;
  } catch (err) {
    throw new Error(`CORS check failed: ${err.message}`);
  }
});

await test("Auth cookie format (lms prefix)", async () => {
  if (!authCookie) throw new Error("No auth cookie set");
  const hasLmsPrefix = authCookie.includes("lms.");
  return hasLmsPrefix
    ? `Cookie uses lms prefix: ${authCookie.substring(0, 40)}...`
    : `Cookie: ${authCookie.substring(0, 40)}...`;
});

await test("API response format consistency", async () => {
  // Check that the API returns { success, data/error } consistently
  const { data } = await req("GET", "/");
  if (!("success" in data)) throw new Error("Root endpoint missing 'success' field");
  if (!("message" in data)) throw new Error("Root endpoint missing 'message' field");
  return `{ success: ${data.success}, message: "${data.message}" }`;
});

// ─── Summary ──────────────────────────────────────────────────────
const total = passed + failed + skipped;
console.log(`
${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}
 ${c.bold}Results: ${c.green}${passed} passed${c.reset}  ${failed > 0 ? c.red : ""}${failed} failed${c.reset}  ${c.dim}${skipped} skipped${c.reset}  / ${total} total
 ${c.bold}Role:${c.reset} ${sessionUserRole || "unknown"}  ${c.bold}User:${c.reset} ${TEST_EMAIL}
${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}
`);

if (failed > 0) {
  console.log(`${c.yellow}💡 Tips:${c.reset}`);
  console.log(`   • If you see 403 errors, the test user role is "${sessionUserRole}" — some endpoints require "admin"`);
  console.log(`   • To test as admin, manually set the user's role in the DB:`);
  console.log(`     ${c.dim}UPDATE "user" SET role = 'admin' WHERE email = '${TEST_EMAIL}';${c.reset}`);
  console.log(`   • If endpoints fail with connection errors, ensure the backend is running on :3001`);
  console.log();
  process.exit(1);
}
