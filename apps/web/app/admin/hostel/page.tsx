import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import StatCard from "../../../components/ui/stat-card";
import CreateHostelForm from "./create-form";
import AddRoomModal from "./add-room-form";

export default async function AdminHostelPage() {
  const [hostelsRes, wardensRes] = await Promise.all([
    api.get("/api/hostel").catch(() => ({ data: [] })),
    api.get("/api/users?role=warden").catch(() => ({ data: [] })),
  ]);

  const hostels: any[] = hostelsRes.data || [];
  const wardens: any[] = wardensRes.data || [];

  const totalRooms = hostels.reduce((s: number, h: any) => s + (h.rooms?.length || h._count?.rooms || 0), 0);
  const totalCapacity = hostels.reduce(
    (s: number, h: any) => s + (h.rooms || []).reduce((rs: number, r: any) => rs + (r.capacity || 0), 0),
    0
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Hostel Management"
        description="Configure hostels, assign wardens, add rooms, and monitor resident capacity."
        action={<CreateHostelForm wardens={wardens} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="🏠" label="Total Hostels" value={hostels.length} color="purple" />
        <StatCard icon="🚪" label="Total Rooms" value={totalRooms} color="blue" />
        <StatCard icon="👥" label="Total Bed Capacity" value={totalCapacity || "—"} color="green" />
      </div>

      {/* Hostel Cards */}
      {hostels.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>No hostels configured yet.</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Click "+ Add Hostel" to create your first hostel block.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hostels.map((hostel: any) => {
            const rooms = hostel.rooms || [];
            const capacity = rooms.reduce((acc: number, r: any) => acc + (r.capacity || 0), 0);

            return (
              <div
                key={hostel.id}
                className="rounded-2xl border p-5 transition-all hover:bg-white/[0.02] flex flex-col justify-between"
                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">
                        🏠
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {hostel.name}
                        </p>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 capitalize" style={{ color: "var(--color-text-muted)" }}>
                          {hostel.type} hostel
                        </span>
                      </div>
                    </div>
                    <AddRoomModal hostelId={hostel.id} hostelName={hostel.name} />
                  </div>

                  <div className="space-y-2.5 pt-2 border-t text-xs" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>Configured Rooms</span>
                      <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {rooms.length || hostel._count?.rooms || 0} rooms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>Bed Capacity</span>
                      <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {capacity > 0 ? `${capacity} beds` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>Assigned Warden</span>
                      <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {hostel.warden?.name ? `👤 ${hostel.warden.name}` : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rooms pill preview */}
                {rooms.length > 0 && (
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                      Rooms (Floor Level)
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {rooms.slice(0, 10).map((r: any) => (
                        <span
                          key={r.id}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          R-{r.roomNumber} (F{r.floor})
                        </span>
                      ))}
                      {rooms.length > 10 && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                          +{rooms.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
