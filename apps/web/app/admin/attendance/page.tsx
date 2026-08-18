import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import AdminAttendanceClient from "./attendance-client";

export default async function AdminAttendancePage() {
  const [attendanceRes, subjectsRes, dashRes] = await Promise.all([
    api.get("/api/attendance?limit=50"),
    api.get("/api/subjects"),
    api.get("/api/dashboard/admin"),
  ]);

  const records: any[] = attendanceRes.data || [];
  const subjects: any[] = subjectsRes.data || [];
  const stats = dashRes.data?.stats;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Attendance"
        description="Monitor attendance records across all subjects and sections."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: "✅", label: "Today's Attendance", value: `${stats?.todayAttendancePercent ?? 0}%`, color: "text-emerald-400" },
          { icon: "🎓", label: "Total Students", value: stats?.totalStudents ?? 0, color: "text-blue-400" },
          { icon: "📋", label: "Records (Last 50)", value: records.length, color: "text-purple-400" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="rounded-2xl border p-5" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{icon} {label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <AdminAttendanceClient records={records} subjects={subjects} />
    </div>
  );
}
