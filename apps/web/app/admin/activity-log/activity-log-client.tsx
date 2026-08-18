"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────
interface ActivityLog {
  id: string;
  description: string;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { id: string; name: string; role: string; email: string } | null;
}

// ─── Constants ───────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { icon: string; label: string; bg: string; text: string; border: string }> = {
  login:   { icon: "🔑", label: "Login",   bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
  logout:  { icon: "🚪", label: "Logout",  bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/20" },
  create:  { icon: "➕", label: "Create",  bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  update:  { icon: "✏️", label: "Update",  bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
  delete:  { icon: "🗑️", label: "Delete",  bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  approve: { icon: "✅", label: "Approve", bg: "bg-teal-500/10",    text: "text-teal-400",    border: "border-teal-500/20" },
  reject:  { icon: "❌", label: "Reject",  bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20" },
};

const MODULE_CONFIG: Record<string, { icon: string; color: string }> = {
  auth:         { icon: "🔐", color: "text-blue-400" },
  department:   { icon: "🏛️", color: "text-purple-400" },
  program:      { icon: "📚", color: "text-violet-400" },
  batch:        { icon: "📅", color: "text-indigo-400" },
  subject:      { icon: "📖", color: "text-cyan-400" },
  attendance:   { icon: "✅", color: "text-emerald-400" },
  leave:        { icon: "🏖️", color: "text-amber-400" },
  exam:         { icon: "📝", color: "text-orange-400" },
  hostel:       { icon: "🏠", color: "text-pink-400" },
  announcement: { icon: "📣", color: "text-rose-400" },
  calendar:     { icon: "📆", color: "text-indigo-400" },
  timetable:    { icon: "🕐", color: "text-teal-400" },
  system:       { icon: "⚙️", color: "text-gray-400" },
};

const ROLE_COLORS: Record<string, string> = {
  admin:   "bg-purple-500/15 text-purple-300 border-purple-500/20",
  faculty: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  student: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  warden:  "bg-amber-500/15 text-amber-300 border-amber-500/20",
};

// ─── Helpers ─────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatFullTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Sub-components ──────────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
        active
          ? "btn-gradient border-transparent text-white"
          : "hover:bg-white/5 border-current"
      }`}
      style={!active ? { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" } : {}}
    >
      {label}
    </button>
  );
}

function ActivityCard({ log }: { log: ActivityLog }) {
  const action = ACTION_CONFIG[log.action] || { icon: "📌", label: log.action, bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20" };
  const mod = MODULE_CONFIG[log.module] || { icon: "⚙️", color: "text-gray-400" };
  const roleClass = ROLE_COLORS[log.user?.role || ""] || "bg-gray-500/15 text-gray-300 border-gray-500/20";

  return (
    <div
      className="group flex items-start gap-4 p-4 rounded-2xl border transition-all hover:bg-white/[0.03]"
      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
    >
      {/* Action icon */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${action.bg} ${action.border}`}>
        {action.icon}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Description */}
        <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text-primary)" }}>
          {log.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* User avatar + name */}
          {log.user ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                {initials(log.user.name)}
              </div>
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {log.user.name}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${roleClass}`}>
                {log.user.role}
              </span>
            </div>
          ) : (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>System</span>
          )}

          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>·</span>

          {/* Module badge */}
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${mod.color}`}>
            <span>{mod.icon}</span>
            {log.module}
          </span>

          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>·</span>

          {/* Action badge */}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold uppercase tracking-wide ${action.bg} ${action.text} ${action.border}`}>
            {action.label}
          </span>

          {/* Entity */}
          {log.entityType && (
            <>
              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>·</span>
              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                {log.entityType}
              </span>
            </>
          )}

          {/* IP */}
          {log.ipAddress && log.ipAddress !== "unknown" && (
            <>
              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>·</span>
              <span className="text-[10px] font-mono" style={{ color: "var(--color-text-muted)" }}>
                {log.ipAddress}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <div className="shrink-0 text-right">
        <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{timeAgo(log.createdAt)}</p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {formatFullTime(log.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

interface ActivityLogClientProps {
  logs: ActivityLog[];
  stats: any;
}

export default function ActivityLogClient({ logs, stats }: ActivityLogClientProps) {
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Unique modules and actions from data
  const modules = useMemo(() => ["all", ...Array.from(new Set(logs.map((l) => l.module))).sort()], [logs]);
  const actions = useMemo(() => ["all", ...Array.from(new Set(logs.map((l) => l.action))).sort()], [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (moduleFilter !== "all" && l.module !== moduleFilter) return false;
      if (actionFilter !== "all" && l.action !== actionFilter) return false;
      if (search && !l.description.toLowerCase().includes(search.toLowerCase()) &&
          !l.user?.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, moduleFilter, actionFilter, search]);

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today", value: stats.today ?? 0, icon: "📊", color: "from-purple-500/20 to-purple-500/5" },
            { label: "This Week", value: stats.thisWeek ?? 0, icon: "📈", color: "from-blue-500/20 to-blue-500/5" },
            { label: "Total", value: stats.total ?? 0, icon: "📋", color: "from-cyan-500/20 to-cyan-500/5" },
            { label: "Showing", value: filtered.length, icon: "🔍", color: "from-emerald-500/20 to-emerald-500/5" },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl p-4 border bg-gradient-to-br ${s.color}`}
              style={{ borderColor: "var(--color-border)" }}
            >
              <p className="text-2xl">{s.icon}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--color-text-primary)" }}>{s.value.toLocaleString()}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        className="rounded-2xl border p-4 space-y-4"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by description or user name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border bg-transparent outline-none transition-colors"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
              background: "var(--color-bg-input, rgba(255,255,255,0.03))",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-text-muted)" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Module filters */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
            Module
          </p>
          <div className="flex flex-wrap gap-2">
            {modules.map((m) => (
              <FilterChip
                key={m}
                label={m === "all" ? "All Modules" : `${MODULE_CONFIG[m]?.icon ?? "⚙️"} ${m.charAt(0).toUpperCase() + m.slice(1)}`}
                active={moduleFilter === m}
                onClick={() => setModuleFilter(m)}
              />
            ))}
          </div>
        </div>

        {/* Action filters */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
            Action
          </p>
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <FilterChip
                key={a}
                label={a === "all" ? "All Actions" : `${ACTION_CONFIG[a]?.icon ?? "📌"} ${ACTION_CONFIG[a]?.label ?? a}`}
                active={actionFilter === a}
                onClick={() => setActionFilter(a)}
              />
            ))}
          </div>
        </div>

        {/* Module breakdown bar */}
        {stats?.byModule && stats.byModule.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
              Activity Breakdown
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.byModule.map((m: any) => (
                <button
                  key={m.module}
                  onClick={() => setModuleFilter(moduleFilter === m.module ? "all" : m.module)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all hover:opacity-80 ${
                    moduleFilter === m.module ? "ring-1 ring-purple-500" : ""
                  }`}
                  style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  {MODULE_CONFIG[m.module]?.icon ?? "⚙️"} {m.module}
                  <span className="text-purple-400 font-bold">{m.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Activity Feed
          </h3>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {(moduleFilter !== "all" || actionFilter !== "all" || search) && (
              <button
                onClick={() => { setModuleFilter("all"); setActionFilter("all"); setSearch(""); }}
                className="ml-2 underline hover:opacity-70 transition-opacity"
              >
                Clear filters
              </button>
            )}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div
            className="rounded-2xl border p-12 text-center"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No activity matches your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => (
              <ActivityCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
