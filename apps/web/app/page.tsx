import Link from "next/link";
import { headers } from "next/headers";
import { getServerSession } from "@repo/auth/middleware";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(await headers());
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--color-bg-primary)" }}>
      {/* Aurora background */}
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none animate-aurora">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)
          `
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 border-b backdrop-blur-xl" style={{ borderColor: "var(--color-border)", background: "rgba(10,10,15,0.6)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
            🎓
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            University LMS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="btn-gradient text-sm py-2">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="animate-fade-in-up max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border bg-purple-500/10 text-purple-400 border-purple-500/20">
            🚀 Modern University Management
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            <span className="gradient-text">University LMS</span>
            <br />
            <span style={{ color: "var(--color-text-primary)" }}>Made Simple</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Attendance, timetable, exams, results, hostel management, leave applications, and announcements — all in one powerful platform.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/sign-in" className="btn-gradient text-base px-8 py-3.5">
              Sign In to LMS →
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: "✅", label: "Attendance" },
              { icon: "🗓️", label: "Timetable" },
              { icon: "📝", label: "Exams & Results" },
              { icon: "📋", label: "Leave Management" },
              { icon: "🏠", label: "Hostel" },
              { icon: "📢", label: "Announcements" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors hover:bg-white/[0.03]"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-card)" }}
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
