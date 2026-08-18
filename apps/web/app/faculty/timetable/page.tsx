import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function FacultyTimetablePage() {
  const res = await api.get("/api/timetable/my");
  const slots = res.data || [];

  const byDay = new Map<number, any[]>();
  for (const slot of slots) {
    if (!byDay.has(slot.dayOfWeek)) byDay.set(slot.dayOfWeek, []);
    byDay.get(slot.dayOfWeek)!.push(slot);
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="My Timetable" description="Your weekly teaching schedule." />

      {slots.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">🗓️</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No timetable assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAY_NAMES.map((day, idx) => {
            const daySlots = byDay.get(idx) || [];
            if (daySlots.length === 0) return null;
            return (
              <div key={day} className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--color-border)" }}>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{day}</h3>
                  <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>{daySlots.length} classes</span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {daySlots.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)).map((slot: any, i: number) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                      <div className="w-24 shrink-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{slot.startTime}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{slot.endTime}</p>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {slot.subject?.name} <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-white/5" style={{ color: "var(--color-text-muted)" }}>{slot.subject?.code}</span>
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          {slot.section?.batch?.program?.name} — {slot.section?.batch?.name} — Sec {slot.section?.name}
                          {slot.room ? ` · ${slot.room}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
