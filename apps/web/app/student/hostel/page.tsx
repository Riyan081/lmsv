import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import ApplyGatePassForm from "./gate-pass-form";
import FilecomplaintForm from "./complaint-form";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  open: "bg-red-500/15 text-red-400 border-red-500/20",
  in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

export default async function StudentHostelPage() {
  // Fetch hostels, gate passes, and complaints concurrently
  const [hostelsRes, gatePassesRes, complaintsRes] = await Promise.all([
    api.get("/api/hostel").catch(() => ({ data: [] })),
    api.get("/api/hostel/gate-pass?limit=20").catch(() => ({ data: [] })),
    api.get("/api/hostel/complaints?limit=20").catch(() => ({ data: [] })),
  ]);

  const hostels: any[] = hostelsRes.data || [];
  const gatePasses: any[] = gatePassesRes.data || [];
  const complaints: any[] = complaintsRes.data || [];

  const allRooms = hostels.flatMap((h: any) =>
    (h.rooms || []).map((r: any) => ({
      id: r.id,
      roomNumber: `${h.name} - Room ${r.roomNumber}`,
    }))
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Hostel & Gate Pass"
        description="Manage your hostel accommodation, gate passes, and maintenance complaints."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gate Pass Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>🎫 Apply for Gate Pass</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Submit a request to leave campus</p>
            </div>
            <div className="p-5">
              <ApplyGatePassForm />
            </div>
          </div>

          {/* Gate Pass History */}
          <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>📜 My Gate Passes</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5" style={{ color: "var(--color-text-muted)" }}>{gatePasses.length} total</span>
            </div>
            <div className="p-5 space-y-3 max-h-[360px] overflow-y-auto">
              {gatePasses.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: "var(--color-text-muted)" }}>
                  No gate pass requests yet.
                </p>
              ) : (
                gatePasses.map((pass: any) => (
                  <div key={pass.id} className="p-3.5 rounded-xl border bg-white/[0.02] space-y-2" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>{pass.reason}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[pass.status] || ""}`}>
                        {pass.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      <span>📅 Out: {new Date(pass.outDate).toLocaleDateString()} {pass.outTime}</span>
                      <span>↩️ Return: {new Date(pass.expectedReturnDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Complaints Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>📋 Maintenance Complaints</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Report room or facility issues</p>
              </div>
              <FilecomplaintForm rooms={allRooms} />
            </div>
            <div className="p-5 space-y-3 max-h-[500px] overflow-y-auto">
              {complaints.length === 0 ? (
                <div className="text-center py-10 space-y-1">
                  <p className="text-2xl">🧹</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>No complaints filed yet.</p>
                </div>
              ) : (
                complaints.map((c: any) => (
                  <div key={c.id} className="p-3.5 rounded-xl border bg-white/[0.02] space-y-1.5" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold capitalize" style={{ color: "var(--color-text-primary)" }}>{c.category}</span>
                        {c.room && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                            Room {c.room.roomNumber}
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[c.status] || ""}`}>
                        {c.status?.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{c.description}</p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                      Filed on {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
