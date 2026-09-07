import { api } from "../../lib/api";
import PageHeader from "../../components/ui/page-header";
import Link from "next/link";

export default async function ProfilePage() {
  const [profileRes, attendanceRes, resultsRes] = await Promise.all([
    api.get("/api/users/me"),
    api.get("/api/attendance/my-summary"),
    api.get("/api/exams/my-results"),
  ]);

  const user = profileRes.data || {};
  const attendance = attendanceRes.data;
  const results = resultsRes.data || [];

  const hostel = user.hostelAllocations?.[0];

  const ROLE_COLORS: Record<string, string> = {
    student: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    faculty: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    admin: "bg-red-500/15 text-red-400 border-red-500/30",
    warden: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };

  return (
    <div className="animate-fade-in-up space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader
        title="My Profile"
        description="View your institutional identification, academic records, and personal information."
      />

      {/* Hero / ID Card Container */}
      <div
        className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(15, 15, 26, 0.98))",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Avatar with gradient border */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-purple-500 via-blue-500 to-emerald-400 shadow-xl">
              <div
                className="w-full h-full rounded-[22px] flex items-center justify-center text-4xl font-extrabold text-white"
                style={{ background: "var(--color-bg-secondary)" }}
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name} className="w-full h-full rounded-[22px] object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "👤"
                )}
              </div>
            </div>
            <span
              className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-md ${
                ROLE_COLORS[user.role] || ROLE_COLORS.student
              }`}
            >
              {user.role}
            </span>
          </div>

          {/* User Essential Info */}
          <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                {user.name}
              </h1>
              {user.enrollmentNo && (
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 inline-block self-center md:self-auto">
                  Roll: {user.enrollmentNo}
                </span>
              )}
              {user.employeeId && (
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 inline-block self-center md:self-auto">
                  ID: {user.employeeId}
                </span>
              )}
            </div>

            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {user.department ? `${user.department.name} (${user.department.code})` : "General Member"}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span className="flex items-center gap-1.5">
                ✉️ <strong style={{ color: "var(--color-text-primary)" }}>{user.email}</strong>
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  📞 <strong style={{ color: "var(--color-text-primary)" }}>+91 {user.phone}</strong>
                </span>
              )}
              {user.gender && (
                <span className="capitalize flex items-center gap-1.5">
                  ⚧️ <strong style={{ color: "var(--color-text-primary)" }}>{user.gender}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Mini Action / QR aesthetic */}
          <div className="hidden lg:flex flex-col items-end justify-between self-stretch shrink-0 text-right">
            <span className="text-[10px] tracking-widest font-mono text-gray-400 uppercase">
              Official University LMS ID
            </span>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
              <div className="text-2xl">🎓</div>
              <span className="text-[9px] font-mono text-purple-300 font-semibold">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Academic & Institutional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details Card */}
        <div
          className="rounded-3xl border p-6 space-y-4"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <span className="text-lg">📚</span>
            <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Academic & Enrollment
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1">
              <span style={{ color: "var(--color-text-muted)" }}>Degree Program</span>
              <span className="font-semibold text-right" style={{ color: "var(--color-text-primary)" }}>
                {user.batch?.program?.name || "B.Tech Engineering"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Department</span>
              <span className="font-medium text-right" style={{ color: "var(--color-text-primary)" }}>
                {user.department?.name || "—"} ({user.department?.code || "—"})
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Batch Years</span>
              <span className="font-medium text-purple-300">
                {user.batch?.name || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Assigned Section</span>
              <span className="font-semibold px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Section {user.section?.name || "A"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Student Status</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                Active Enrolled
              </span>
            </div>
          </div>
        </div>

        {/* Guardian & Emergency Details Card */}
        <div
          className="rounded-3xl border p-6 space-y-4"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <span className="text-lg">👨‍👩‍👧</span>
            <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Guardian & Emergency Contact
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1">
              <span style={{ color: "var(--color-text-muted)" }}>Parent / Guardian Name</span>
              <span className="font-semibold text-right" style={{ color: "var(--color-text-primary)" }}>
                {user.guardianName || "Not Provided"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Emergency Phone</span>
              <span className="font-medium text-right text-emerald-400">
                {user.guardianPhone ? `+91 ${user.guardianPhone}` : "Not Provided"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Account Created</span>
              <span style={{ color: "var(--color-text-primary)" }}>
                {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Email Verification</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                ✅ Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hostel Residence Section */}
      {hostel ? (
        <div
          className="rounded-3xl border p-6 space-y-4 bg-gradient-to-r from-purple-950/20 to-blue-950/20"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏠</span>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Campus Residence & Hostel
              </h3>
            </div>
            <Link href="/student/hostel" className="text-xs text-purple-400 hover:underline">
              Hostel Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Hostel Building</p>
              <p className="text-base font-semibold mt-1" style={{ color: "var(--color-text-primary)" }}>
                {hostel.room?.hostel?.name || "Campus Hostel"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Allocated Room</p>
              <p className="text-base font-semibold mt-1 text-purple-300">
                Room {hostel.room?.roomNumber} (Floor {hostel.room?.floor})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Allocation Date</p>
              <p className="text-base font-semibold mt-1 text-emerald-400">
                {new Date(hostel.allocatedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      ) : user.role === "student" ? (
        <div
          className="rounded-3xl border p-6 flex items-center justify-between"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Hostel Accommodation
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                You are currently a Day Scholar (no campus hostel room allocated).
              </p>
            </div>
          </div>
          <Link href="/student/hostel" className="text-xs btn-gradient py-2 px-4">
            Hostel Info
          </Link>
        </div>
      ) : null}

      {/* Quick Academic Summary for Students */}
      {user.role === "student" && attendance && (
        <div
          className="rounded-3xl border p-6 space-y-4"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Current Semester Performance
              </h3>
            </div>
            <div className="flex gap-3 text-xs">
              <Link href="/student/attendance" className="text-purple-400 hover:underline">
                Full Attendance →
              </Link>
              <Link href="/student/results" className="text-blue-400 hover:underline">
                Exam Results →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-xs text-gray-400 mb-1">Overall Attendance</p>
              <p className="text-3xl font-bold text-emerald-400">
                {attendance.overallPercentage}%
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {attendance.totalPresent} of {attendance.totalClasses} classes
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-xs text-gray-400 mb-1">Enrolled Subjects</p>
              <p className="text-3xl font-bold text-blue-400">
                {attendance.subjects?.length || 0}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Active courses this term</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-xs text-gray-400 mb-1">Exam Results Published</p>
              <p className="text-3xl font-bold text-purple-400">
                {results.length}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Results on record</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
