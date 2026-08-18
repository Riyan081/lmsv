import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import StatusBadge from "../../../components/ui/status-badge";

export default async function StudentAttendancePage() {
  const res = await api.get("/api/attendance/my-summary");
  const data = res.data;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="My Attendance"
        description="Track your attendance across all subjects."
      />

      {/* Overall */}
      {data && (
        <div className="rounded-2xl border p-6 mb-6" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Overall Attendance</p>
              <p className="text-4xl font-bold tracking-tight mt-1 gradient-text">
                {data.overallPercentage}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Classes Attended</p>
              <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                {data.totalPresent} / {data.totalClasses}
              </p>
            </div>
          </div>
          {/* Attendance bar */}
          <div className="mt-4 h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${data.overallPercentage}%`,
                background: data.overallPercentage >= 75
                  ? "linear-gradient(90deg, #22c55e, #10b981)"
                  : data.overallPercentage >= 60
                    ? "linear-gradient(90deg, #f59e0b, #eab308)"
                    : "linear-gradient(90deg, #ef4444, #dc2626)",
              }}
            />
          </div>
        </div>
      )}

      {/* Subject-wise */}
      <div className="space-y-3">
        {(data?.subjects || []).map((sub: any) => (
          <div
            key={sub.subject.id}
            className="rounded-2xl border p-5 flex items-center gap-4 transition-colors duration-150 hover:bg-white/[0.02]"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {sub.subject.name}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                  {sub.subject.code}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <span>Present: <strong className="text-emerald-400">{sub.present}</strong></span>
                <span>Absent: <strong className="text-red-400">{sub.absent}</strong></span>
                <span>Late: <strong className="text-amber-400">{sub.late}</strong></span>
                <span>Total: <strong>{sub.totalClasses}</strong></span>
              </div>
              {/* Mini progress bar */}
              <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden w-full max-w-xs">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${sub.percentage}%`,
                    background: sub.percentage >= 75 ? "#22c55e" : sub.percentage >= 60 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-2xl font-bold"
                style={{
                  color: sub.percentage >= 75 ? "#22c55e" : sub.percentage >= 60 ? "#f59e0b" : "#ef4444",
                }}
              >
                {sub.percentage}%
              </p>
              {sub.isLow && <StatusBadge status="Low" variant="danger" />}
            </div>
          </div>
        ))}

        {(!data?.subjects || data.subjects.length === 0) && (
          <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No attendance records found yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
