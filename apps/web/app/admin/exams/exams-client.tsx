"use client";

import { useState, useMemo } from "react";
import StatusBadge from "../../../components/ui/status-badge";
import EnterMarksForm from "./enter-marks-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";

interface Exam {
  id: string;
  name: string;
  type: string;
  totalMarks: number;
  date: string;
  subject?: { id: string; name: string; code: string };
  semester?: { id: string; number: number; program?: { id: string; name: string; code: string } };
  _count?: { results: number };
}

export default function AdminExamsClient({ exams }: { exams: Exam[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  // Extract unique semester/program combinations
  const semesterOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    for (const e of exams) {
      if (e.semester) {
        const prog = e.semester.program?.code || "";
        const label = `${prog ? prog + " — " : ""}Semester ${e.semester.number}`;
        map.set(e.semester.id, { id: e.semester.id, label });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (typeFilter && e.type !== typeFilter) return false;
      if (semesterFilter && e.semester?.id !== semesterFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.subject?.name?.toLowerCase().includes(q) &&
          !e.subject?.code?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [exams, typeFilter, semesterFilter, search]);

  // Group by semester
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; exams: Exam[] }>();
    for (const e of filteredExams) {
      const key = e.semester?.id || "other";
      const label = e.semester
        ? `${e.semester.program?.code ? e.semester.program.code + " — " : ""}Semester ${e.semester.number}`
        : "General / Other";
      if (!map.has(key)) map.set(key, { label, exams: [] });
      map.get(key)!.exams.push(e);
    }
    return Array.from(map.values());
  }, [filteredExams]);

  const hasFilters = search || typeFilter || semesterFilter;
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setSemesterFilter("");
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search exam or subject..."
          className={`w-full ${inputCls}`}
          style={inputStyle}
        />

        <div className="flex flex-wrap gap-3">
          <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} className={inputCls} style={inputStyle}>
            <option value="">All Semesters</option>
            {semesterOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputCls} style={inputStyle}>
            <option value="">All Types</option>
            <option value="internal">Internal</option>
            <option value="midterm">Mid-Term</option>
            <option value="endsem">End Semester</option>
            <option value="supplementary">Supplementary</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className={`${inputCls} hover:bg-white/5`} style={{ ...inputStyle, color: "var(--color-text-muted)" }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredExams.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No exams found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.label}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {g.label}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {g.exams.length} exam{g.exams.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                        {["Exam Name", "Subject", "Type", "Total Marks", "Date", "Results", ""].map((h, i) => (
                          <th key={i} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {g.exams.map((row) => (
                        <tr key={row.id} className="border-b last:border-b-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: "var(--color-border)" }}>
                          <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                            {row.name}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{row.subject?.name}</span>
                            <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                              {row.subject?.code}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={row.type} variant="info" />
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {row.totalMarks}
                          </td>
                          <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                            {new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-sm font-medium ${(row._count?.results ?? 0) > 0 ? "text-emerald-400" : ""}`} style={(row._count?.results ?? 0) === 0 ? { color: "var(--color-text-muted)" } : {}}>
                              {row._count?.results ?? 0} entered
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 justify-end">
                              <EnterMarksForm exam={row as any} />
                              <DeleteRowButton
                                url={`http://localhost:3001/api/exams/${row.id}`}
                                label={`exam "${row.name}"`}
                              />
                            </div>
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
