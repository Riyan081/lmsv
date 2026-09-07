"use client";

import { useState, useMemo } from "react";
import StatusBadge from "../../../components/ui/status-badge";
import LeaveActionButtons from "./action-buttons";

interface LeaveItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
    enrollmentNo?: string;
    employeeId?: string;
    department?: { id: string; name: string; code: string };
    batch?: { id: string; name: string };
    section?: { id: string; name: string };
  };
  approvedBy?: { id: string; name: string };
}

export default function AdminLeaveClient({ leaves }: { leaves: LeaveItem[] }) {
  const [statusTab, setStatusTab] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Unique departments list
  const departments = useMemo(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    for (const l of leaves) {
      if (l.user?.department) {
        map.set(l.user.department.id, l.user.department);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [leaves]);

  // Unique batches list
  const batches = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const l of leaves) {
      if (l.user?.batch) {
        map.set(l.user.batch.id, l.user.batch);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [leaves]);

  // Status counts
  const counts = useMemo(() => {
    const res = { all: leaves.length, pending: 0, approved: 0, rejected: 0 };
    for (const l of leaves) {
      if (l.status in res) {
        (res as any)[l.status]++;
      }
    }
    return res;
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      if (statusTab !== "all" && l.status !== statusTab) return false;
      if (deptFilter && l.user?.department?.id !== deptFilter) return false;
      if (batchFilter && l.user?.batch?.id !== batchFilter) return false;
      if (roleFilter && l.user?.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.user?.name?.toLowerCase().includes(q) &&
          !l.user?.enrollmentNo?.toLowerCase().includes(q) &&
          !l.reason?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [leaves, statusTab, deptFilter, batchFilter, roleFilter, search]);

  // Group leaves by batch/dept for clear structure
  const groupedLeaves = useMemo(() => {
    const map = new Map<string, { label: string; leaves: LeaveItem[] }>();
    for (const l of filteredLeaves) {
      const deptCode = l.user?.department?.code || "General";
      const batchName = l.user?.batch?.name || (l.user?.role === "faculty" ? "Faculty" : "Unassigned");
      const key = `${deptCode}-${batchName}`;
      const label = `${deptCode} — ${batchName}`;
      if (!map.has(key)) map.set(key, { label, leaves: [] });
      map.get(key)!.leaves.push(l);
    }
    return Array.from(map.values());
  }, [filteredLeaves]);

  const hasFilters = deptFilter || batchFilter || roleFilter || search;
  const clearFilters = () => {
    setDeptFilter("");
    setBatchFilter("");
    setRoleFilter("");
    setSearch("");
  };

  const inputCls =
    "px-3 py-2 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = {
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
    background: "var(--color-bg-card)",
  };

  return (
    <div className="space-y-5">
      {/* Status Tabs */}
      <div
        className="flex items-center gap-2 border-b pb-4 overflow-x-auto"
        style={{ borderColor: "var(--color-border)" }}
      >
        {[
          { key: "all", label: "All Applications", count: counts.all },
          {
            key: "pending",
            label: "Pending Review",
            count: counts.pending,
            badgeColor: "bg-amber-500/20 text-amber-400",
          },
          {
            key: "approved",
            label: "Approved",
            count: counts.approved,
            badgeColor: "bg-emerald-500/20 text-emerald-400",
          },
          {
            key: "rejected",
            label: "Rejected",
            count: counts.rejected,
            badgeColor: "bg-red-500/20 text-red-400",
          },
        ].map((tab) => {
          const active = statusTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  active ? "bg-white/20 text-white" : tab.badgeColor || "bg-white/10 text-gray-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search applicant name, enrollment no, or reason..."
          className={`w-full ${inputCls}`}
          style={inputStyle}
        />

        <div className="flex flex-wrap gap-3">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className={`${inputCls} hover:bg-white/5`}
              style={{ ...inputStyle, color: "var(--color-text-muted)" }}
            >
              ✕ Clear Filters
            </button>
          )}

          <span className="text-xs ml-auto self-center" style={{ color: "var(--color-text-muted)" }}>
            Showing {filteredLeaves.length} of {leaves.length} application{leaves.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grouped Leave List */}
      {filteredLeaves.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No leave applications match your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedLeaves.map((group) => (
            <div key={group.label}>
              {/* Group Title */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {group.label}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {group.leaves.length} application{group.leaves.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {group.leaves.map((leave) => {
                  const startDate = new Date(leave.startDate);
                  const endDate = new Date(leave.endDate);
                  const days = Math.max(
                    1,
                    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                  );

                  return (
                    <div
                      key={leave.id}
                      className="rounded-2xl border p-5 hover:bg-white/[0.02] transition-colors"
                      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* User Header */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {leave.user?.name}
                            </span>
                            <span
                              className="text-xs uppercase px-2 py-0.5 rounded-md bg-white/5 font-medium"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {leave.user?.role}
                            </span>
                            {leave.user?.enrollmentNo && (
                              <span
                                className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 font-semibold text-purple-300"
                              >
                                {leave.user.enrollmentNo}
                              </span>
                            )}
                            {leave.user?.department && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {leave.user.department.code}
                                {leave.user.batch ? ` · ${leave.user.batch.name}` : ""}
                                {leave.user.section ? ` · Sec-${leave.user.section.name}` : ""}
                              </span>
                            )}
                            <StatusBadge status={leave.status} />
                          </div>

                          {/* Reason */}
                          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                            {leave.reason}
                          </p>

                          {/* Metadata Footer */}
                          <div
                            className="flex flex-wrap items-center gap-2.5 mt-3 text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <span className="capitalize font-medium text-purple-400 px-2 py-0.5 rounded bg-purple-500/10">
                              {leave.type} leave
                            </span>
                            <span>·</span>
                            <span>
                              📅 {startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} —{" "}
                              {endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} (
                              {days} day{days !== 1 ? "s" : ""})
                            </span>
                            <span>·</span>
                            <span>Applied {new Date(leave.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                            {leave.approvedBy && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-400">Reviewed by {leave.approvedBy.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {leave.status === "pending" && (
                          <div className="shrink-0 self-end sm:self-center">
                            <LeaveActionButtons leaveId={leave.id} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
