"use client";

import { useState, useCallback } from "react";
import CreateSlotForm from "./create-slot-form";
import AutoGenerateButton from "./auto-generate-button";
import { useRouter } from "next/navigation";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Section {
  id: string;
  label: string;
  programCode?: string;
}

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subject: { id: string; name: string; code: string };
  faculty: { id: string; name: string };
  section: { id: string; name: string; batch?: { name: string; program?: { code: string } } };
}

interface TimetableGridProps {
  slots: Slot[];
  sections: Section[];
  semesters?: { id: string; label: string; programCode: string }[];
}

const SUBJECT_COLORS = [
  "bg-blue-500/15 border-blue-500/30 text-blue-300",
  "bg-purple-500/15 border-purple-500/30 text-purple-300",
  "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  "bg-orange-500/15 border-orange-500/30 text-orange-300",
  "bg-pink-500/15 border-pink-500/30 text-pink-300",
  "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  "bg-amber-500/15 border-amber-500/30 text-amber-300",
  "bg-rose-500/15 border-rose-500/30 text-rose-300",
];

function getSubjectColor(subjectId: string) {
  // Stable color per subject based on ID hash
  let hash = 0;
  for (let i = 0; i < subjectId.length; i++) {
    hash = subjectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

function formatTime(t: string) {
  const parts = t.split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function TimetableGrid({ slots, sections, semesters = [] }: TimetableGridProps) {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string>(sections[0]?.id || "");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreated = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDelete = async (slotId: string) => {
    if (!confirm("Remove this lecture slot from the timetable?")) return;
    setDeletingId(slotId);
    try {
      const res = await fetch(`http://localhost:3001/api/timetable/${slotId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  // Filter slots for selected section
  const filteredSlots = slots.filter((s) => s.section.id === selectedSection);

  // Group by day
  const slotsByDay: Slot[][] = Array.from({ length: 6 }, () => []);
  filteredSlots.forEach((s) => {
    if (s.dayOfWeek >= 0 && s.dayOfWeek < 6) {
      slotsByDay[s.dayOfWeek]!.push(s);
      slotsByDay[s.dayOfWeek]!.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
  });

  const selectedSectionLabel = sections.find((s) => s.id === selectedSection)?.label ?? "";

  // Total slots stats
  const totalSlots = filteredSlots.length;
  const daysWithClasses = slotsByDay.filter((d) => d.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Section selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Section:
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors min-w-[240px]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-card)" }}
          >
            {sections.length === 0 && <option value="">No sections found — create batches first</option>}
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <AutoGenerateButton sections={sections} semesters={semesters} />
          <CreateSlotForm onCreated={handleCreated} />
        </div>
      </div>

      {/* Stats */}
      {selectedSection && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Lectures/Week", value: totalSlots, color: "text-purple-400" },
            { label: "Days with Classes", value: `${daysWithClasses} / 6`, color: "text-blue-400" },
            { label: "Section", value: selectedSectionLabel.split("—")[1]?.trim() || "—", color: "text-emerald-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Grid */}
      {sections.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>No sections found</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Create batches and sections first, then add timetable slots.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          {/* Day columns */}
          <div className="grid grid-cols-6 border-b" style={{ borderColor: "var(--color-border)" }}>
            {DAYS.map((day, i) => {
              const daySlots = slotsByDay[i] ?? [];
              return (
                <div
                  key={day}
                  className={`px-3 py-3 text-center border-r last:border-r-0 ${daySlots.length > 0 ? "" : "opacity-50"}`}
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    {DAY_SHORT[i]}
                  </p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-text-primary)" }}>
                    {day.slice(3)}
                  </p>
                  {daySlots.length > 0 && (
                    <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      {daySlots.length}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Slots grid */}
          <div className="grid grid-cols-6 min-h-[400px]">
            {DAYS.map((day, dayIdx) => {
              const daySlots = slotsByDay[dayIdx] ?? [];
              return (
              <div
                key={day}
                className="border-r last:border-r-0 p-2 space-y-2"
                style={{ borderColor: "var(--color-border)" }}
              >
                {daySlots.length === 0 ? (
                  <div
                    className="h-full min-h-[80px] rounded-xl border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Free</span>
                  </div>
                ) : (
                  daySlots.map((slot) => {
                    const color = getSubjectColor(slot.subject.id);
                    return (
                      <div
                        key={slot.id}
                        className={`relative group rounded-xl border p-2.5 transition-all hover:scale-[1.01] ${color}`}
                      >
                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs w-5 h-5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 flex items-center justify-center"
                          title="Remove slot"
                        >
                          ×
                        </button>

                        {/* Time */}
                        <div className="text-xs font-semibold mb-1.5 opacity-80">
                          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        </div>

                        {/* Subject */}
                        <div className="font-bold text-xs leading-tight mb-1">
                          {slot.subject.code}
                        </div>
                        <div className="text-xs opacity-80 leading-tight mb-1.5 truncate" title={slot.subject.name}>
                          {slot.subject.name}
                        </div>

                        {/* Faculty */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs opacity-60">👤</span>
                          <span className="text-xs opacity-75 truncate">{slot.faculty.name}</span>
                        </div>

                        {/* Room */}
                        {slot.room && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs opacity-60">📍</span>
                            <span className="text-xs opacity-75">{slot.room}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All slots list (compact view) */}
      {filteredSlots.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              All Slots — {selectedSectionLabel}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                  {["Day", "Time", "Subject", "Faculty", "Room"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{h}</th>
                  ))}
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredSlots
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                  .map((slot) => (
                    <tr key={slot.id} className="border-b last:border-b-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {DAYS[slot.dayOfWeek]}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{slot.subject.name}</div>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{slot.subject.code}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {slot.faculty.name}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                        {slot.room || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          {deletingId === slot.id ? "..." : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSection && filteredSlots.length === 0 && (
        <div className="rounded-2xl border p-10 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
            No lectures scheduled yet
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
            Click "+ Add Lecture Slot" to start building this section's weekly timetable.
          </p>
        </div>
      )}
    </div>
  );
}
