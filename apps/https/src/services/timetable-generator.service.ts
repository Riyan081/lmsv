import prisma from "@repo/db/client";

/**
 * Timetable Auto-Generator
 *
 * Constraint-satisfaction algorithm that generates a weekly timetable for a
 * given section + semester, based on faculty assignments and college timing structure.
 *
 * College slot structure (fixed):
 *   Slot 0: 09:00 – 11:00  (Lecture 1)
 *   Slot 1: 11:15 – 13:15  (Lecture 2)
 *   Slot 2: 13:45 – 15:45  (Lecture 3)
 *
 *   Working days: Mon–Fri (dayOfWeek 0–4), No Saturday
 *   Max slots per week: 15 (3 per day × 5 days)
 */

export interface GeneratorConfig {
  clearExisting?: boolean;  // Delete existing slots before generating
}

// Fixed slot structure for this college
const SLOTS = [
  { start: "09:00", end: "11:00" }, // Lecture 1
  { start: "11:15", end: "13:15" }, // Lecture 2
  { start: "13:45", end: "15:45" }, // Lecture 3
];
const WORKING_DAYS = [0, 1, 2, 3, 4]; // Mon=0 … Fri=4
const MAX_SLOTS_PER_WEEK = WORKING_DAYS.length * SLOTS.length; // 15

interface SubjectTask {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  facultyId: string;
  facultyName: string;
  slotsNeeded: number;      // ceil(credits / 2)
  slotsPlaced: number;
  daysUsed: Set<number>;    // to enforce spread across week
}

interface PlacedSlot {
  day: number;
  slotIdx: number;
  subjectId: string;
  facultyId: string;
  sectionId: string;
  semesterId: string;
  startTime: string;
  endTime: string;
}

export interface GeneratorResult {
  success: boolean;
  slots?: PlacedSlot[];
  error?: string;
  warnings?: string[];
  stats?: {
    totalSubjects: number;
    totalSlotsNeeded: number;
    totalSlotsPlaced: number;
    slotsPerDay: Record<number, number>;
  };
}

export const timetableGeneratorService = {
  async generate(
    sectionId: string,
    semesterId: string,
    config: GeneratorConfig = {}
  ): Promise<GeneratorResult> {
    const warnings: string[] = [];

    // ── 1. Load faculty-subject assignments for this section + semester ──────
    const assignments = await prisma.facultySubject.findMany({
      where: { sectionId, semesterId },
      include: {
        subject: { select: { id: true, name: true, code: true, credits: true } },
        faculty: { select: { id: true, name: true } },
      },
    });

    if (assignments.length === 0) {
      return {
        success: false,
        error: "No faculty-subject assignments found for this section and semester. Assign faculty to subjects first.",
      };
    }

    // ── 2. Build subject tasks (one task per FacultySubject mapping) ─────────
    const tasks: SubjectTask[] = assignments.map((a) => ({
      subjectId: a.subject.id,
      subjectName: a.subject.name,
      subjectCode: a.subject.code,
      credits: a.subject.credits,
      facultyId: a.faculty.id,
      facultyName: a.faculty.name,
      slotsNeeded: Math.ceil(a.subject.credits / 2), // 2hr slots
      slotsPlaced: 0,
      daysUsed: new Set<number>(),
    }));

    // ── 3. Validate feasibility ──────────────────────────────────────────────
    const totalSlotsNeeded = tasks.reduce((sum, t) => sum + t.slotsNeeded, 0);
    if (totalSlotsNeeded > MAX_SLOTS_PER_WEEK) {
      return {
        success: false,
        error: `Cannot generate timetable: ${totalSlotsNeeded} slots needed but only ${MAX_SLOTS_PER_WEEK} available per week (3 slots/day × 5 days). Reduce subjects or credits.`,
      };
    }

    // ── 4. Load existing timetable slots for SAME SEMESTER (all sections) ───
    //    This catches cross-section faculty conflicts (E1, E11)
    const existingSlots = await prisma.timetableSlot.findMany({
      where: { semesterId },
      select: {
        id: true,
        facultyId: true,
        sectionId: true,
        subjectId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
    });

    // ── 5. Clear existing slots for THIS section if requested ────────────────
    if (config.clearExisting) {
      await prisma.timetableSlot.deleteMany({ where: { sectionId, semesterId } });
      // Remove cleared section's slots from existingSlots too
      const remainingExisting = existingSlots.filter((s) => s.sectionId !== sectionId);
      existingSlots.length = 0;
      existingSlots.push(...remainingExisting);
      warnings.push("Existing timetable for this section was cleared before regeneration.");
    } else {
      // ── E8: "Fill gaps" — reduce slotsNeeded for subjects already placed ──
      const thisSection = existingSlots.filter((s) => s.sectionId === sectionId);
      if (thisSection.length > 0) {
        for (const task of tasks) {
          const existingSlotsForSubject = thisSection.filter(
            (s) => s.subjectId === task.subjectId && s.facultyId === task.facultyId
          );
          const alreadyPlaced = existingSlotsForSubject.length;
          if (alreadyPlaced > 0) {
            task.slotsNeeded = Math.max(0, task.slotsNeeded - alreadyPlaced);
            task.slotsPlaced = alreadyPlaced;
            // Mark which days are already used
            for (const es of existingSlotsForSubject) {
              task.daysUsed.add(es.dayOfWeek);
            }
            if (task.slotsNeeded === 0) {
              warnings.push(`"${task.subjectCode}" already fully scheduled (${alreadyPlaced} slot${alreadyPlaced > 1 ? "s" : ""}). Skipping.`);
            } else {
              warnings.push(`"${task.subjectCode}" has ${alreadyPlaced} existing slot(s). Generating ${task.slotsNeeded} more.`);
            }
          }
        }
        // Filter out fully placed tasks
        const remaining = tasks.filter((t) => t.slotsNeeded > 0);
        if (remaining.length === 0) {
          return {
            success: true,
            slots: [],
            warnings: [...warnings, "All subjects already have their required slots. Nothing to generate."],
            stats: { totalSubjects: tasks.length, totalSlotsNeeded: 0, totalSlotsPlaced: 0, slotsPerDay: {} },
          };
        }
      }
    }

    // Recalculate after E8 adjustments
    const adjustedSlotsNeeded = tasks.reduce((sum, t) => sum + t.slotsNeeded, 0);

    // ── 6. Build faculty-busy map ─────────────────────────────────────────────
    //    faculty_id → Set of "day-slotIdx" strings that are occupied
    const facultyBusy = new Map<string, Set<string>>();

    for (const slot of existingSlots) {
      if (!facultyBusy.has(slot.facultyId)) facultyBusy.set(slot.facultyId, new Set());
      const slotIdx = timeToSlotIdx(slot.startTime);
      if (slotIdx >= 0) {
        facultyBusy.get(slot.facultyId)!.add(`${slot.dayOfWeek}-${slotIdx}`);
      }
    }

    // ── 7. Build section-busy map (for the target section) ───────────────────
    const sectionBusy = new Set<string>(
      existingSlots
        .filter((s) => s.sectionId === sectionId)
        .map((s) => {
          const idx = timeToSlotIdx(s.startTime);
          return `${s.dayOfWeek}-${idx}`;
        })
        .filter((k) => !k.endsWith("-1"))
    );

    // ── 8. Sort tasks by most-constrained first ───────────────────────────────
    //    Faculty that teaches more sections = harder to place = goes first (E3)
    const facultyLoadMap = new Map<string, number>();
    for (const slot of existingSlots) {
      facultyLoadMap.set(slot.facultyId, (facultyLoadMap.get(slot.facultyId) || 0) + 1);
    }

    // Filter to only tasks that still need slots
    const activeTasks = tasks.filter((t) => t.slotsNeeded > 0);

    activeTasks.sort((a, b) => {
      // Most busy faculty first (hardest to schedule)
      const loadDiff = (facultyLoadMap.get(b.facultyId) || 0) - (facultyLoadMap.get(a.facultyId) || 0);
      if (loadDiff !== 0) return loadDiff;
      // More slots needed first
      return b.slotsNeeded - a.slotsNeeded;
    });

    // ── 9. Placement with retry (greedy → relaxed soft constraints → shuffled)
    //
    // Pass 1: Apply ALL soft constraints (S1 day spread, S2 no marathon, S3 balanced)
    // Pass 2: Relax S2 (allow faculty marathon — needed when faculty teaches 3+ in one section)
    // Pass 3: Shuffle task order and retry (pseudo-backtracking)
    //
    let bestResult = attemptPlacement(activeTasks, sectionBusy, facultyBusy, sectionId, semesterId, true);

    if (bestResult.unplaceable.length > 0) {
      // Pass 2: Relax marathon constraint
      warnings.push("Relaxing faculty marathon constraint (S2) to find a valid schedule...");
      const pass2 = attemptPlacement(activeTasks, sectionBusy, facultyBusy, sectionId, semesterId, false);
      if (pass2.unplaceable.length < bestResult.unplaceable.length) {
        bestResult = pass2;
      }
    }

    if (bestResult.unplaceable.length > 0) {
      // Pass 3: Shuffle order — try different task orderings (pseudo-backtracking)
      warnings.push("Trying alternative task orderings...");
      for (let shuffle = 0; shuffle < 3; shuffle++) {
        const shuffled = [...activeTasks];
        // Rotate the array by a different offset each time
        const offset = (shuffle + 1) * Math.ceil(shuffled.length / 4);
        const rotated = [...shuffled.slice(offset), ...shuffled.slice(0, offset)];
        const pass3 = attemptPlacement(rotated, sectionBusy, facultyBusy, sectionId, semesterId, false);
        if (pass3.unplaceable.length < bestResult.unplaceable.length) {
          bestResult = pass3;
        }
        if (bestResult.unplaceable.length === 0) break;
      }
    }

    const { placed, unplaceable } = bestResult;

    // ── 10. Validate output ───────────────────────────────────────────────────
    if (unplaceable.length > 0) {
      if (placed.length === 0) {
        return {
          success: false,
          error: `Could not place any slots. Conflicts:\n${unplaceable.join("\n")}`,
          warnings,
        };
      }
      for (const u of unplaceable) {
        warnings.push(`⚠️ Could not fully schedule: ${u}`);
      }
    }

    // Sanity check: no two placed slots share same section+day+slotIdx
    const placedKeys = new Set<string>();
    for (const p of placed) {
      const k = `${p.day}-${p.slotIdx}`;
      if (placedKeys.has(k)) {
        return {
          success: false,
          error: "Internal error: duplicate section slot detected. Please report this bug.",
          warnings,
        };
      }
      placedKeys.add(k);
    }

    // Stats
    const slotsPerDay: Record<number, number> = {};
    for (const d of WORKING_DAYS) {
      slotsPerDay[d] = placed.filter((p) => p.day === d).length;
    }

    return {
      success: true,
      slots: placed,
      warnings: warnings.length > 0 ? warnings : undefined,
      stats: {
        totalSubjects: tasks.length,
        totalSlotsNeeded: adjustedSlotsNeeded,
        totalSlotsPlaced: placed.length,
        slotsPerDay,
      },
    };
  },

  /**
   * Generate and persist the timetable in a transaction (E12: all-or-nothing).
   */
  async generateAndSave(
    sectionId: string,
    semesterId: string,
    config: GeneratorConfig = {}
  ): Promise<{ success: boolean; created: number; error?: string; warnings?: string[] }> {
    const result = await this.generate(sectionId, semesterId, config);

    if (!result.success || !result.slots || result.slots.length === 0) {
      return {
        success: result.success && result.slots?.length === 0, // success if nothing to generate
        created: 0,
        error: result.error || (result.success ? undefined : "No slots were generated."),
        warnings: result.warnings,
      };
    }

    // Persist ALL slots in a single transaction — if any fails, ALL roll back (E12)
    try {
      await prisma.$transaction(
        result.slots.map((slot) =>
          prisma.timetableSlot.create({
            data: {
              dayOfWeek: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              room: null, // E4: Admin assigns rooms manually
              subjectId: slot.subjectId,
              facultyId: slot.facultyId,
              sectionId: slot.sectionId,
              semesterId: slot.semesterId,
            },
          })
        )
      );

      return {
        success: true,
        created: result.slots.length,
        warnings: result.warnings,
      };
    } catch (err: any) {
      return {
        success: false,
        created: 0,
        error: `Database error while saving (rolled back): ${err.message}`,
        warnings: result.warnings,
      };
    }
  },
};

// ─── Helper: map startTime string to slot index ──────────────────────────────
function timeToSlotIdx(start: string): number {
  return SLOTS.findIndex((s) => s.start === start);
}

// ─── Core placement algorithm ────────────────────────────────────────────────
// Extracted so we can call it multiple times with different parameters (retry logic)

function attemptPlacement(
  tasks: SubjectTask[],
  existingSectionBusy: Set<string>,
  existingFacultyBusy: Map<string, Set<string>>,
  sectionId: string,
  semesterId: string,
  enforceMarathonConstraint: boolean
): { placed: PlacedSlot[]; unplaceable: string[] } {
  // Clone state so multiple attempts don't interfere
  const sectionBusy = new Set(existingSectionBusy);
  const facultyBusy = new Map<string, Set<string>>();
  for (const [k, v] of existingFacultyBusy) {
    facultyBusy.set(k, new Set(v));
  }
  // Clone task state
  const tasksCopy = tasks.map((t) => ({
    ...t,
    slotsPlaced: t.slotsPlaced, // keep existing count from E8
    daysUsed: new Set(t.daysUsed),
    slotsNeeded: t.slotsNeeded,
  }));

  const placed: PlacedSlot[] = [];
  const unplaceable: string[] = [];

  for (const task of tasksCopy) {
    // Track how many slots we still need to place in THIS run
    const toPlace = task.slotsNeeded; // already adjusted by E8 if applicable
    let placedForTask = 0;

    while (placedForTask < toPlace) {
      let found = false;

      // S1: Prefer days not yet used by this subject (even distribution)
      // S3: Among equally-prioritized days, prefer least-loaded day (balance)
      // This prevents the greedy algorithm from filling Mon-Thu and leaving Friday empty
      const dayLoadCount = (day: number): number => {
        let count = 0;
        for (const k of sectionBusy) {
          if (k.startsWith(`${day}-`)) count++;
        }
        for (const p of placed) {
          if (p.day === day) count++;
        }
        return count;
      };

      const candidateDays = [...WORKING_DAYS].sort((a, b) => {
        // Primary: unused days first for this subject (S1: spread)
        const aUsed = task.daysUsed.has(a) ? 1 : 0;
        const bUsed = task.daysUsed.has(b) ? 1 : 0;
        if (aUsed !== bUsed) return aUsed - bUsed;
        // Secondary: least-loaded day first (S3: balance across week)
        return dayLoadCount(a) - dayLoadCount(b);
      });

      outerLoop: for (const day of candidateDays) {
        // H5 + S3: Check if day is full (max 3 slots per day per section)
        // Count unique busy slot indices for this day (from sectionBusy + newly placed)
        const busyOnDay = new Set<number>();
        for (const k of sectionBusy) {
          if (k.startsWith(`${day}-`)) busyOnDay.add(parseInt(k.split("-")[1]!));
        }
        for (const p of placed) {
          if (p.day === day) busyOnDay.add(p.slotIdx);
        }
        if (busyOnDay.size >= SLOTS.length) continue; // day is full (H5)

        for (let slotIdx = 0; slotIdx < SLOTS.length; slotIdx++) {
          const key = `${day}-${slotIdx}`;

          // H1: Section not double-booked
          if (sectionBusy.has(key)) continue;
          if (placed.some((p) => p.day === day && p.slotIdx === slotIdx)) continue;

          // H2: Faculty not double-booked (across ALL sections)
          const facBusy = facultyBusy.get(task.facultyId);
          if (facBusy?.has(key)) continue;
          if (placed.some((p) => p.day === day && p.slotIdx === slotIdx && p.facultyId === task.facultyId)) continue;

          // S2: Avoid faculty marathon — only if enforced (Bug #4 fix)
          if (enforceMarathonConstraint) {
            const consecutive = countConsecutiveFacultySlots(placed, existingFacultyBusy, task.facultyId, day, slotIdx);
            if (consecutive >= 2) continue; // soft skip — will be retried without this in pass 2
          }

          // ✅ All constraints pass — place the slot
          const slot = SLOTS[slotIdx]!;
          placed.push({
            day,
            slotIdx,
            subjectId: task.subjectId,
            facultyId: task.facultyId,
            sectionId,
            semesterId,
            startTime: slot.start,
            endTime: slot.end,
          });

          // Update busy maps
          if (!facultyBusy.has(task.facultyId)) facultyBusy.set(task.facultyId, new Set());
          facultyBusy.get(task.facultyId)!.add(key);
          sectionBusy.add(key);
          task.daysUsed.add(day);

          found = true;
          placedForTask++;
          break outerLoop;
        }
      }

      if (!found) {
        // Could not place — report and move on
        unplaceable.push(
          `"${task.subjectCode} (${task.subjectName})" by ${task.facultyName}: placed ${placedForTask}/${toPlace} new slots`
        );
        break;
      }
    }
  }

  return { placed, unplaceable };
}

/** Count consecutive slots for the same faculty on a given day (checking both placed and existing) */
function countConsecutiveFacultySlots(
  placed: PlacedSlot[],
  existingFacultyBusy: Map<string, Set<string>>,
  facultyId: string,
  day: number,
  slotIdx: number
): number {
  const isOccupied = (idx: number) => {
    // Check in current placement run
    if (placed.some((p) => p.facultyId === facultyId && p.day === day && p.slotIdx === idx)) return true;
    // Check in existing schedule
    const existing = existingFacultyBusy.get(facultyId);
    if (existing?.has(`${day}-${idx}`)) return true;
    return false;
  };

  let count = 0;
  // Check slots before
  for (let i = slotIdx - 1; i >= 0; i--) {
    if (isOccupied(i)) count++;
    else break;
  }
  // Check slots after
  for (let i = slotIdx + 1; i < SLOTS.length; i++) {
    if (isOccupied(i)) count++;
    else break;
  }
  return count;
}
