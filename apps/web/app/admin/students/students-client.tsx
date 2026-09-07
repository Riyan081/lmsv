"use client";

import { useState, useMemo } from "react";
import DataTable from "../../../components/ui/data-table";
import DeleteRowButton from "../../../components/ui/delete-row-button";

interface StudentsClientProps {
  students: any[];
  departments: any[];
  batches: any[];
  activeSectionId?: string;
  activeBatchId?: string;
  activeDeptId?: string;
}

export default function StudentsClient({
  students,
  departments,
  batches,
  activeSectionId,
  activeBatchId,
  activeDeptId,
}: StudentsClientProps) {
  const [deptFilter, setDeptFilter] = useState(activeDeptId || "");
  const [batchFilter, setBatchFilter] = useState(activeBatchId || "");
  const [sectionFilter, setSectionFilter] = useState(activeSectionId || "");
  const [search, setSearch] = useState("");

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        render: (row: any) => (
          <div>
            <div className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {row.name}
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {row.email}
            </div>
          </div>
        ),
      },
      {
        key: "enrollmentNo",
        label: "Enrollment",
        render: (row: any) => (
          <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            {row.enrollmentNo || "—"}
          </span>
        ),
      },
      {
        key: "department",
        label: "Dept",
        render: (row: any) => (
          <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400">
            {row.department?.code || "—"}
          </span>
        ),
      },
      {
        key: "batch",
        label: "Batch",
        render: (row: any) => (
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {row.batch?.name || "—"}
          </span>
        ),
      },
      {
        key: "section",
        label: "Section",
        render: (row: any) =>
          row.section ? (
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
              {row.section.name}
            </span>
          ) : (
            <span style={{ color: "var(--color-text-muted)" }}>—</span>
          ),
      },
      {
        key: "gender",
        label: "Gender",
        render: (row: any) => (
          <span className="text-xs capitalize" style={{ color: "var(--color-text-secondary)" }}>
            {row.gender || "—"}
          </span>
        ),
      },
      {
        key: "phone",
        label: "Phone",
        render: (row: any) => (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {row.phone || "—"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (row: any) => (
          <DeleteRowButton
            url={`http://localhost:3001/api/users/${row.id}`}
            label={`student "${row.name}"`}
          />
        ),
      },
    ],
    []
  );

  // Build all sections from batches for the section dropdown
  const allSections = useMemo(() => {
    const base = batchFilter
      ? batches.filter((b: any) => b.id === batchFilter)
      : batches;
    return base.flatMap((b: any) =>
      (b.sections || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        batchName: b.name,
        programCode: b.program?.code || "",
      }))
    );
  }, [batches, batchFilter]);

  // Client-side filtering on top of server-side
  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (deptFilter && s.department?.id !== deptFilter) return false;
      if (batchFilter && s.batch?.id !== batchFilter) return false;
      if (sectionFilter && s.section?.id !== sectionFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !(s.enrollmentNo || "").toLowerCase().includes(q) &&
          !(s.email || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [students, deptFilter, batchFilter, sectionFilter, search]);

  // Group by section for visual grouping
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; students: any[] }>();
    for (const s of filtered) {
      const key = s.section?.id || "no-section";
      const label = s.section
        ? `Section ${s.section.name} — ${s.batch?.name || "Unknown Batch"} (${s.department?.code || "?"})`
        : `No Section Assigned`;
      if (!map.has(key)) map.set(key, { label, students: [] });
      map.get(key)!.students.push(s);
    }
    return Array.from(map.values());
  }, [filtered]);

  const clearFilters = () => {
    setDeptFilter("");
    setBatchFilter("");
    setSectionFilter("");
    setSearch("");
  };

  const hasFilters = deptFilter || batchFilter || sectionFilter || search;

  const inputCls =
    "px-3 py-2 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = {
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
    background: "var(--color-bg-card)",
  };

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div
        className="rounded-2xl border p-4 flex flex-wrap gap-3 items-center"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search name, enrollment, email..."
          className={`${inputCls} flex-1 min-w-[200px]`}
          style={inputStyle}
        />

        {/* Department filter */}
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setBatchFilter("");
            setSectionFilter("");
          }}
          className={inputCls}
          style={inputStyle}
        >
          <option value="">All Departments</option>
          {departments.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.code} — {d.name}
            </option>
          ))}
        </select>

        {/* Batch filter */}
        <select
          value={batchFilter}
          onChange={(e) => {
            setBatchFilter(e.target.value);
            setSectionFilter("");
          }}
          className={inputCls}
          style={inputStyle}
        >
          <option value="">All Batches</option>
          {(deptFilter
            ? batches.filter((b: any) => b.program?.department?.id === deptFilter)
            : batches
          ).map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.program?.code})
            </option>
          ))}
        </select>

        {/* Section filter */}
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className={inputCls}
          style={inputStyle}
        >
          <option value="">All Sections</option>
          {allSections.map((s: any) => (
            <option key={s.id} value={s.id}>
              Section {s.name} — {s.batchName} ({s.programCode})
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs px-3 py-2 rounded-xl border hover:bg-white/5 transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            ✕ Clear
          </button>
        )}

        <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>
          {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grouped by Section */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <p className="text-4xl mb-3">🎓</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No students match your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.label}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {group.label}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {group.students.length} student{group.students.length !== 1 ? "s" : ""}
                </span>
              </div>
              <DataTable
                columns={columns}
                data={group.students}
                emptyMessage="No students"
                emptyIcon="🎓"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
