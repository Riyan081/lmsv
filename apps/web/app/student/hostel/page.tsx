import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import ApplyGatePassForm from "./gate-pass-form";
import FilecomplaintForm from "./complaint-form";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-500/15 text-red-400",
  in_progress: "bg-amber-500/15 text-amber-400",
  resolved: "bg-emerald-500/15 text-emerald-400",
};

export default async function StudentHostelPage() {
  // Fetch hostels to get available rooms for complaint form
  const hostelsRes = await api.get("/api/hostel");
  const hostels: any[] = hostelsRes.data || [];
  const allRooms = hostels.flatMap((h: any) =>
    (h.rooms || []).map((r: any) => ({ id: r.id, roomNumber: r.roomNumber }))
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Hostel"
        description="Your hostel services — gate passes and complaints."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gate Pass */}
        <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>🎫 Gate Pass</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Request a gate pass to go out of campus</p>
          </div>
          <div className="p-5">
            <ApplyGatePassForm />
          </div>
        </div>

        {/* Complaints */}
        <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>📋 Complaints</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Report maintenance or facility issues</p>
            </div>
            <FilecomplaintForm rooms={allRooms} />
          </div>
          <div className="p-5 space-y-2">
            {allRooms.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "var(--color-text-muted)" }}>
                No rooms available. Contact admin.
              </p>
            )}
            {allRooms.length > 0 && (
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Click "File Complaint" to report an issue with your room or hostel facilities.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
