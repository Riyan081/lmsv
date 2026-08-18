import { api } from "../../lib/api";
import PageHeader from "../../components/ui/page-header";
import StatusBadge from "../../components/ui/status-badge";
import AppShell from "../../components/layout/app-shell";

export default async function CalendarPage() {
  const res = await api.get("/api/calendar?limit=50");
  const events = res.data || [];

  // Group by month
  const byMonth = new Map<string, any[]>();
  for (const event of events) {
    const d = new Date(event.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push({ ...event, monthLabel: label });
  }

  return (
    <AppShell>
      <div className="animate-fade-in-up">
        <PageHeader
          title="Academic Calendar"
          description="Important dates, holidays, and events."
        />

        {events.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No events scheduled.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(byMonth.entries()).map(([key, monthEvents]) => (
              <div key={key}>
                <h3 className="text-sm font-semibold mb-3 px-1" style={{ color: "var(--color-text-secondary)" }}>
                  {monthEvents[0].monthLabel}
                </h3>
                <div className="space-y-2">
                  {monthEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
                    >
                      <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-purple-400">
                          {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                          {new Date(event.startDate).getDate()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                            {event.description}
                          </p>
                        )}
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                          {new Date(event.startDate).toLocaleDateString()} — {new Date(event.endDate).toLocaleDateString()}
                          {event.department ? ` · ${event.department.name}` : " · All Departments"}
                        </p>
                      </div>
                      <StatusBadge status={event.type} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
