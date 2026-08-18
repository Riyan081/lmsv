import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import StatusBadge from "../../../components/ui/status-badge";
import CreateEventForm from "./create-form";

export default async function AdminCalendarPage() {
  const res = await api.get("/api/calendar?limit=50");
  const events = res.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Academic Calendar"
        description="Manage academic events, holidays, and important dates."
        action={<CreateEventForm />}
      />

      {events.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No events. Create your first event.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
            <div key={event.id} className="rounded-2xl border p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
              style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-purple-400">
                  {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {new Date(event.startDate).getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{event.title}</p>
                {event.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>{event.description}</p>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(event.startDate).toLocaleDateString()} — {new Date(event.endDate).toLocaleDateString()}
                  {event.department ? ` · ${event.department.name}` : " · All"}
                </p>
              </div>
              <StatusBadge status={event.type} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
