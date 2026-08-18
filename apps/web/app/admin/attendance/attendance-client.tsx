"use client";

import { useState, useMemo } from "react";

const STATUS_COLORS: Record<string, string> = {
  present: "bg-emerald-500/15 text-emerald-400",
  absent: "bg-red-500/15 text-red-400",
  late: "bg-amber-500/15 text-amber-400",
};

interface AttendanceRecord {
  id: string;
  date: string;
  period: number;
  status: string;
  student: { id: string; name: string; enrollmentNo?: string };
  subject: { id: string; name: string; code: string };
  markedBy?: { id: string; name: string };
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function AdminAttendanceClient({
  records,
  subjects,
}: {
  records: AttendanceRecord[];
  subjects: Subject[];
}) {
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (subjectFilter && r.subject.id !== subjectFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.student.name.toLowerCase().includes(q) &&
          !r.student.enrollmentNo?.toLowerCase().includes(q) &&
          !r.subject.name.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [records, subjectFilter, statusFilter, search]);

  // Aggregate stats from filtered records
  const presentCount = filtered.filter((r) => r.status === "present").length;
  const absentCount = filtered.filter((r) => r.status === "absent").length;
  const lateCount = filtered.filter((r) => r.status === "late").length;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student name or enrollment..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
        />
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none min-w-[180px]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-card)" }}
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-card)" }}
        >
          <option value="">All status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      </div>

      {/* Mini stats */}
      <div className="flex gap-4 text-sm flex-wrap">
        <span style={{ color: "var(--color-text-muted)" }}>
          Showing <strong style={{ color: "var(--color-text-primary)" }}>{filtered.length}</strong> records
        </span>
        <span className="text-emerald-400">✅ Present: <strong>{presentCount}</strong></span>
        <span className="text-red-400">❌ Absent: <strong>{absentCount}</strong></span>
        <span className="text-amber-400">⏰ Late: <strong>{lateCount}</strong></span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No attendance records match your filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                  {["Date", "Period", "Student", "Subject", "Status", "Marked By"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-b-0 hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
                      {r.period}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{r.student.name}</p>
                      {r.student.enrollmentNo && (
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{r.student.enrollmentNo}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{r.subject.name}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{r.subject.code}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[r.status] || ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {r.markedBy?.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
