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
  student: {
    id: string;
    name: string;
    enrollmentNo?: string;
    section?: { id: string; name: string };
    batch?: { id: string; name: string };
    department?: { id: string; name: string; code: string };
  };
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
  subjects: _subjects,
}: {
  records: AttendanceRecord[];
  subjects?: Subject[];
}) {
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  // Derive unique sections and departments from records
  const sections = useMemo(() => {
    const map = new Map<string, { id: string; name: string; batchName: string; deptId?: string }>();
    for (const r of records) {
      if (r.student.section) {
        if (deptFilter && r.student.department?.id !== deptFilter) continue;
        map.set(r.student.section.id, {
          id: r.student.section.id,
          name: r.student.section.name,
          batchName: r.student.batch?.name || "",
          deptId: r.student.department?.id,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [records, deptFilter]);

  const departments = useMemo(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    for (const r of records) {
      if (r.student.department) {
        map.set(r.student.department.id, r.student.department);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [records]);

  // Derive subjects from records, respecting dept and section filters
  const availableSubjects = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const r of records) {
      if (deptFilter && r.student.department?.id !== deptFilter) continue;
      if (sectionFilter && r.student.section?.id !== sectionFilter) continue;
      if (r.subject) {
        map.set(r.subject.id, r.subject);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [records, deptFilter, sectionFilter]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (subjectFilter && r.subject.id !== subjectFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (sectionFilter && r.student.section?.id !== sectionFilter) return false;
      if (deptFilter && r.student.department?.id !== deptFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.student.name.toLowerCase().includes(q) &&
          !r.student.enrollmentNo?.toLowerCase().includes(q) &&
          !r.subject.name.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [records, subjectFilter, statusFilter, sectionFilter, deptFilter, search]);

  // Group by section for section-wise display
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; records: AttendanceRecord[] }>();
    for (const r of filtered) {
      const key = r.student.section?.id || "no-section";
      const label = r.student.section
        ? `Section ${r.student.section.name} — ${r.student.batch?.name || "?"} (${r.student.department?.code || "?"})`
        : "No Section";
      if (!map.has(key)) map.set(key, { label, records: [] });
      map.get(key)!.records.push(r);
    }
    return Array.from(map.values());
  }, [filtered]);

  const presentCount = filtered.filter((r) => r.status === "present").length;
  const absentCount = filtered.filter((r) => r.status === "absent").length;
  const lateCount = filtered.filter((r) => r.status === "late").length;

  const hasFilters = subjectFilter || statusFilter || sectionFilter || deptFilter || search;
  const clearFilters = () => {
    setSubjectFilter(""); setStatusFilter(""); setSectionFilter(""); setDeptFilter(""); setSearch("");
  };

  const inputCls = "px-3 py-2 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = { borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-card)" };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search student name or enrollment..."
          className={`w-full ${inputCls}`}
          style={inputStyle}
        />

        <div className="flex flex-wrap gap-3">
          {/* Dept */}
          <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setSectionFilter(""); setSubjectFilter(""); }} className={inputCls} style={inputStyle}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
            ))}
          </select>

          {/* Section */}
          <select value={sectionFilter} onChange={(e) => { setSectionFilter(e.target.value); setSubjectFilter(""); }} className={inputCls} style={inputStyle}>
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>Section {s.name} — {s.batchName}</option>
            ))}
          </select>

          {/* Subject */}
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={`${inputCls} min-w-[180px]`} style={inputStyle}>
            <option value="">All Subjects</option>
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
            ))}
          </select>

          {/* Status */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls} style={inputStyle}>
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className={`${inputCls} hover:bg-white/5`} style={{ ...inputStyle, color: "var(--color-text-muted)" }}>
              ✕ Clear
            </button>
          )}
        </div>
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

      {/* Grouped Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No attendance records match your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {group.label}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {group.records.length} record{group.records.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                        {["Date", "Period", "Student", "Subject", "Status", "Marked By"].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((r) => (
                        <tr key={r.id} className="border-b last:border-b-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: "var(--color-border)" }}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
