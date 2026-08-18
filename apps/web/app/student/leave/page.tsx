import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import StatusBadge from "../../../components/ui/status-badge";
import ApplyLeaveForm from "./apply-form";

export default async function StudentLeavePage() {
  const res = await api.get("/api/leave/my?limit=20");
  const leaves = res.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Leave Applications"
        description="Apply for leave and track your applications."
        action={<ApplyLeaveForm />}
      />

      {/* Leave list */}
      {leaves.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No leave applications yet.
          </p>
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
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={leave.status} />
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                      {leave.type}
                    </span>
                  </div>
                  <p className="text-sm mt-2" style={{ color: "var(--color-text-primary)" }}>
                    {leave.reason}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Applied {new Date(leave.createdAt).toLocaleDateString()}
                  </p>
                  {leave.approvedBy && (
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                      By: {leave.approvedBy.name}
                    </p>
                  )}
                  {leave.approverNote && (
                    <p className="text-xs mt-1 italic" style={{ color: "var(--color-text-secondary)" }}>
                      &ldquo;{leave.approverNote}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
