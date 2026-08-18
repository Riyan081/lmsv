import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import StatusBadge from "../../../components/ui/status-badge";
import LeaveActionButtons from "../../admin/leave/action-buttons";

export default async function FacultyLeavePage() {
  const res = await api.get("/api/leave?limit=30");
  const leaves = res.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Leave Applications"
        description="Review and manage student leave applications."
      />

      {leaves.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No leave applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave: any) => (
            <div
              key={leave.id}
              className="rounded-2xl border p-5 hover:bg-white/[0.02] transition-colors"
              style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {leave.user?.name}
                    </span>
                    {leave.user?.enrollmentNo && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                        {leave.user.enrollmentNo}
                      </span>
                    )}
                    <StatusBadge status={leave.status} />
                  </div>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {leave.reason}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <span>{leave.type}</span>
                    <span>·</span>
                    <span>{new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {leave.status === "pending" && <LeaveActionButtons leaveId={leave.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
