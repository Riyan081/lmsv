import { headers } from "next/headers";
import { getServerSession } from "@repo/auth/middleware";
import { redirect } from "next/navigation";
import { api } from "../../lib/api";
import StatCard from "../../components/ui/stat-card";
import PageHeader from "../../components/ui/page-header";
import ActivityFeed from "../../components/ui/activity-feed";
import StatusBadge from "../../components/ui/status-badge";

export default async function DashboardPage() {
  const session = await getServerSession(await headers());
  if (!session) redirect("/sign-in");

  const { user } = session;
  const role = user.role || "student";

  // Fetch role-specific dashboard data
  const dashRes = await api.get(`/api/dashboard/${role}`);
  const data = dashRes.data;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`Welcome back, ${user.name}! 👋`}
        description={getGreeting(role)}
      />

      {role === "admin" && <AdminDashboard data={data} />}
      {role === "faculty" && <FacultyDashboard data={data} />}
      {role === "student" && <StudentDashboard data={data} />}
      {role === "warden" && <WardenDashboard data={data} />}
    </div>
  );
}

function getGreeting(role: string): string {
  switch (role) {
    case "admin": return "Here's your institution overview for today.";
    case "faculty": return "Here's your teaching schedule and tasks.";
    case "student": return "Here's your academic overview.";
    case "warden": return "Here's your hostel management overview.";
    default: return "Here's your dashboard.";
  }
}

// ─── Admin Dashboard ──────────────────────────────────────────────

function AdminDashboard({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Unable to load dashboard data. Make sure the API server is running.
        </p>
      </div>
    );
  }

  const { stats, recentActivity, upcomingEvents, announcements } = data;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon="🎓" label="Total Students" value={stats?.totalStudents ?? 0} color="blue" />
        <StatCard icon="👨‍🏫" label="Total Faculty" value={stats?.totalFaculty ?? 0} color="purple" />
        <StatCard icon="🏛️" label="Departments" value={stats?.totalDepartments ?? 0} color="cyan" />
        <StatCard icon="📖" label="Subjects" value={stats?.totalSubjects ?? 0} color="green" />
        <StatCard icon="📝" label="Pending Leaves" value={stats?.pendingLeaves ?? 0} color="amber" />
        <StatCard
          icon="✅"
          label="Today's Attendance"
          value={`${stats?.todayAttendancePercent ?? 0}%`}
          color="green"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <ActivityFeed items={recentActivity || []} />

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                📅 Upcoming Events
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {(upcomingEvents || []).length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No upcoming events</p>
              ) : (
                upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-sm">
                      📅
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {event.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={event.type} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                📢 Recent Announcements
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {(announcements || []).length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No announcements</p>
              ) : (
                announcements.map((a: any) => (
                  <div key={a.id} className="pb-3 border-b last:border-b-0 last:pb-0" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {a.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                      {a.createdBy?.name} · {new Date(a.createdAt).toLocaleDateString()}
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

// ─── Faculty Dashboard ────────────────────────────────────────────

function FacultyDashboard({ data }: { data: any }) {
  if (!data) return <DashboardFallback />;

  const { todaySchedule, mySubjects, pendingLeaves } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="📖" label="My Subjects" value={mySubjects?.length ?? 0} color="purple" />
        <StatCard icon="🗓️" label="Today's Classes" value={todaySchedule?.length ?? 0} color="blue" />
        <StatCard icon="📝" label="Pending Leaves" value={pendingLeaves ?? 0} color="amber" />
      </div>

      {/* Today's Schedule */}
      <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            🗓️ Today&apos;s Schedule
          </h3>
        </div>
        <div className="p-5 space-y-3">
          {(todaySchedule || []).length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No classes scheduled for today 🎉</p>
          ) : (
            todaySchedule.map((slot: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="text-center shrink-0 w-16">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {slot.startTime}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{slot.endTime}</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {slot.subject?.name} ({slot.subject?.code})
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {slot.section?.batch?.name} — Section {slot.section?.name}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────

function StudentDashboard({ data }: { data: any }) {
  if (!data) return <DashboardFallback />;

  const { todaySchedule, myLeaves, recentResults, announcements } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="🗓️" label="Today's Classes" value={todaySchedule?.length ?? 0} color="blue" />
        <StatCard icon="📝" label="My Leaves" value={myLeaves?.length ?? 0} color="amber" />
        <StatCard icon="📊" label="Recent Results" value={recentResults?.length ?? 0} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              🗓️ Today&apos;s Schedule
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {(todaySchedule || []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No classes today 🎉</p>
            ) : (
              todaySchedule.map((slot: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-medium shrink-0 w-24" style={{ color: "var(--color-text-secondary)" }}>
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {slot.subject?.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {slot.faculty?.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              📢 Announcements
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {(announcements || []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No announcements</p>
            ) : (
              announcements.map((a: any) => (
                <div key={a.id} className="pb-3 border-b last:border-b-0 last:pb-0" style={{ borderColor: "var(--color-border)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{a.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Warden Dashboard ─────────────────────────────────────────────

function WardenDashboard({ data }: { data: any }) {
  if (!data) return <DashboardFallback />;

  const { stats, recentGatePasses, recentComplaints } = data;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🏠" label="My Hostels" value={stats?.totalHostels ?? 0} color="purple" />
        <StatCard icon="🚪" label="Total Rooms" value={stats?.totalRooms ?? 0} color="blue" />
        <StatCard icon="🎫" label="Pending Gate Passes" value={stats?.pendingGatePasses ?? 0} color="amber" />
        <StatCard icon="📋" label="Open Complaints" value={stats?.openComplaints ?? 0} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Gate Passes */}
        <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>🎫 Pending Gate Passes</h3>
          </div>
          <div className="p-4 space-y-3">
            {(recentGatePasses || []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No pending gate passes 🎉</p>
            ) : (
              (recentGatePasses || []).map((gp: any) => (
                <div key={gp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{gp.student?.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{gp.student?.enrollmentNo}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                </div>
              ))
            )}
            {(recentGatePasses || []).length > 0 && (
              <a href="/warden/gate-pass" className="block text-xs text-center pt-1" style={{ color: "var(--color-text-muted)" }}>View all →</a>
            )}
          </div>
        </div>

        {/* Open Complaints */}
        <div className="rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>📋 Open Complaints</h3>
          </div>
          <div className="p-4 space-y-3">
            {(recentComplaints || []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No open complaints 🎉</p>
            ) : (
              (recentComplaints || []).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{c.student?.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Room {c.room?.roomNumber} · {c.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg border capitalize ${
                    c.status === "open" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    c.status === "in_progress" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>{c.status?.replace("_", " ")}</span>
                </div>
              ))
            )}
            {(recentComplaints || []).length > 0 && (
              <a href="/warden/complaints" className="block text-xs text-center pt-1" style={{ color: "var(--color-text-muted)" }}>View all →</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fallback ─────────────────────────────────────────────────────

function DashboardFallback() {
  return (
    <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Unable to load dashboard. Make sure the API server is running on port 3001.
      </p>
    </div>
  );
}
