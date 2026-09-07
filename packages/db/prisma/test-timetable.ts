/**
 * Analyze generated timetables — check for clashes, day off, faculty load, etc.
 */

const API = "http://localhost:3001/api";
let TOKEN = "";

async function login() {
  const res = await fetch(`${API}/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
    body: JSON.stringify({ email: "admin@college.com", password: "password123" }),
  });
  const data = (await res.json()) as any;
  TOKEN = data.token;
}

async function apiGet(path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Origin: "http://localhost:3000" },
  });
  return res.json() as any;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOT_TIMES = ["09:00-11:00", "11:15-13:15", "13:45-15:45"];

async function main() {
  await login();

  const slotsRes = await apiGet("/timetable");
  const slots: any[] = slotsRes.data || [];

  console.log("═".repeat(70));
  console.log("  📊 TIMETABLE ANALYSIS — ALL GENERATED SLOTS");
  console.log("═".repeat(70));
  console.log(`\nTotal slots in DB: ${slots.length}\n`);

  // ─── 1. FACULTY CLASH CHECK ─────────────────────────────────────
  console.log("━".repeat(70));
  console.log("  1. FACULTY CLASH CHECK (same teacher, same time)");
  console.log("━".repeat(70));

  const facultyTimeMap: Record<string, any[]> = {};
  for (const s of slots) {
    const key = `${s.faculty.id}|${s.dayOfWeek}|${s.startTime}`;
    if (!facultyTimeMap[key]) facultyTimeMap[key] = [];
    facultyTimeMap[key].push(s);
  }

  let clashCount = 0;
  for (const [key, group] of Object.entries(facultyTimeMap)) {
    if (group.length > 1) {
      clashCount++;
      const f = group[0];
      console.log(`  ❌ CLASH: ${f.faculty.name} on ${DAYS[f.dayOfWeek]} at ${f.startTime}`);
      for (const g of group) {
        const secLabel = `${g.section.batch?.program?.code || "?"} ${g.section.batch?.name || "?"} Sec-${g.section.name}`;
        console.log(`     → ${g.subject.code} (${g.subject.name}) — ${secLabel}`);
      }
    }
  }
  if (clashCount === 0) console.log("  ✅ No faculty clashes found! All clear.");
  console.log();

  // ─── 2. FACULTY CROSS-SEMESTER TEACHING ─────────────────────────
  console.log("━".repeat(70));
  console.log("  2. FACULTY TEACHING ACROSS SEMESTERS (Sem 3 + Sem 5)");
  console.log("━".repeat(70));

  const facultySections: Record<string, Set<string>> = {};
  const facultySubjects: Record<string, string[]> = {};
  for (const s of slots) {
    const fName = s.faculty.name;
    if (!facultySections[fName]) facultySections[fName] = new Set();
    if (!facultySubjects[fName]) facultySubjects[fName] = [];
    const secLabel = `${s.section.batch?.program?.code || "?"} ${s.section.batch?.name || "?"} Sec-${s.section.name}`;
    facultySections[fName].add(secLabel);
    if (!facultySubjects[fName].includes(`${s.subject.code} (${secLabel})`)) {
      facultySubjects[fName].push(`${s.subject.code} (${secLabel})`);
    }
  }

  for (const [fName, secs] of Object.entries(facultySections)) {
    if (secs.size > 1) {
      console.log(`  👨‍🏫 ${fName} teaches ${secs.size} sections:`);
      for (const sub of facultySubjects[fName]!) {
        console.log(`     → ${sub}`);
      }
    }
  }
  console.log();

  // ─── 3. FACULTY WEEKLY LOAD ─────────────────────────────────────
  console.log("━".repeat(70));
  console.log("  3. FACULTY WEEKLY LOAD (slots per week)");
  console.log("━".repeat(70));

  const facultyLoad: Record<string, number> = {};
  const facultyDays: Record<string, Set<number>> = {};
  for (const s of slots) {
    const fName = s.faculty.name;
    facultyLoad[fName] = (facultyLoad[fName] || 0) + 1;
    if (!facultyDays[fName]) facultyDays[fName] = new Set();
    facultyDays[fName].add(s.dayOfWeek);
  }

  const sortedFaculty = Object.entries(facultyLoad).sort((a, b) => b[1] - a[1]);
  for (const [fName, count] of sortedFaculty) {
    const daysWorking = facultyDays[fName]!.size;
    const daysOff = 5 - daysWorking;
    const dayOffLabel = daysOff > 0
      ? DAYS.filter((_, i) => !facultyDays[fName]!.has(i)).join(", ")
      : "NONE";
    const bar = "█".repeat(count) + "░".repeat(15 - count);
    console.log(`  ${fName.padEnd(25)} ${bar} ${count}/15 slots | ${daysWorking} days | Off: ${dayOffLabel}`);
  }
  console.log();

  // ─── 4. SECTION TIMETABLE SUMMARY ──────────────────────────────
  console.log("━".repeat(70));
  console.log("  4. SECTION TIMETABLE SUMMARY");
  console.log("━".repeat(70));

  const sectionSlots: Record<string, any[]> = {};
  for (const s of slots) {
    const secLabel = `${s.section.batch?.program?.code || "?"} ${s.section.batch?.name || "?"} Sec-${s.section.name}`;
    if (!sectionSlots[secLabel]) sectionSlots[secLabel] = [];
    sectionSlots[secLabel].push(s);
  }

  for (const [secLabel, secSlots] of Object.entries(sectionSlots)) {
    const daysUsed = new Set(secSlots.map(s => s.dayOfWeek));
    const daysOff = DAYS.filter((_, i) => !daysUsed.has(i));
    console.log(`\n  📚 ${secLabel} — ${secSlots.length} slots/week`);
    console.log(`     Days: ${[...daysUsed].map(d => DAYS[d]).join(", ")} | Free: ${daysOff.length > 0 ? daysOff.join(", ") : "NONE"}`);

    // Print grid
    for (let day = 0; day < 5; day++) {
      const daySlots = secSlots.filter(s => s.dayOfWeek === day).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
      if (daySlots.length === 0) {
        console.log(`     ${DAYS[day].padEnd(10)}: — FREE —`);
      } else {
        const slotStr = daySlots.map((s: any) => `${s.startTime}-${s.endTime} ${s.subject.code} (${s.faculty.name.split(" ").pop()})`).join(" | ");
        console.log(`     ${DAYS[day]!.padEnd(10)}: ${slotStr}`);
      }
    }
  }

  console.log("\n" + "═".repeat(70));
  console.log("  ANALYSIS COMPLETE");
  console.log("═".repeat(70) + "\n");
}

main().catch((e) => { console.error("Error:", e); process.exit(1); });
