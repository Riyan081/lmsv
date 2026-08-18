import { api } from "../../lib/api";
import PageHeader from "../../components/ui/page-header";
import AppShell from "../../components/layout/app-shell";

export default async function AnnouncementsPage() {
  const res = await api.get("/api/announcements/my?limit=30");
  const announcements = res.data || [];

  return (
    <AppShell>
      <div className="animate-fade-in-up">
        <PageHeader
          title="Announcements"
          description="Stay updated with the latest announcements."
        />

        {announcements.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <p className="text-4xl mb-3">📢</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a: any) => (
              <article
                key={a.id}
                className={`rounded-2xl border p-5 transition-colors hover:bg-white/[0.02] ${
                  a.isPinned ? "border-purple-500/30" : ""
                }`}
                style={{
                  background: a.isPinned ? "rgba(139, 92, 246, 0.03)" : "var(--color-bg-card)",
                  borderColor: a.isPinned ? undefined : "var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {a.isPinned && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          📌 Pinned
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                        {a.type}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                      {a.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {a.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {a.createdBy?.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
