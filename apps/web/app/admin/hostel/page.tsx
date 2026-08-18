import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import StatCard from "../../../components/ui/stat-card";
import CreateHostelForm from "./create-form";

export default async function AdminHostelPage() {
  const res = await api.get("/api/hostel");
  const hostels = res.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Hostel Management"
        description="Manage hostels, rooms, and allocations."
        action={<CreateHostelForm />}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="🏠" label="Total Hostels" value={hostels.length} color="purple" />
        <StatCard icon="🚪" label="Total Rooms" value={hostels.reduce((s: number, h: any) => s + (h._count?.rooms || 0), 0)} color="blue" />
        <StatCard icon="👥" label="Total Capacity" value="—" color="green" />
      </div>

      {/* Hostel Cards */}
      {hostels.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No hostels yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostels.map((hostel: any) => (
            <div key={hostel.id} className="rounded-2xl border p-5 transition-colors hover:bg-white/[0.02]"
              style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">🏠</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{hostel.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{hostel.type}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--color-text-muted)" }}>Rooms</span>
                  <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>{hostel._count?.rooms || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--color-text-muted)" }}>Warden</span>
                  <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>{hostel.warden?.name || "Unassigned"}</span>
                </div>
                {hostel.address && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--color-text-muted)" }}>Address</span>
                    <span className="font-medium truncate max-w-[150px]" style={{ color: "var(--color-text-primary)" }}>{hostel.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
