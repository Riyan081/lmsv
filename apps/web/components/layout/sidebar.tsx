"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_CONFIG: Record<string, NavGroup[]> = {
  admin: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "📊" },
        { label: "My Profile", href: "/profile", icon: "👤" },
        { label: "Activity Log", href: "/admin/activity-log", icon: "📋" },
      ],
    },
    {
      title: "Academic",
      items: [
        { label: "Departments", href: "/admin/departments", icon: "🏛️" },
        { label: "Programs", href: "/admin/programs", icon: "📚" },
        { label: "Batches", href: "/admin/batches", icon: "👥" },
        { label: "Subjects", href: "/admin/subjects", icon: "📖" },
        { label: "Timetable", href: "/admin/timetable", icon: "🗓️" },
      ],
    },
    {
      title: "People",
      items: [
        { label: "Students", href: "/admin/students", icon: "🎓" },
        { label: "Faculty", href: "/admin/faculty", icon: "👨‍🏫" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Attendance", href: "/admin/attendance", icon: "✅" },
        { label: "Leave", href: "/admin/leave", icon: "📝" },
        { label: "Exams", href: "/admin/exams", icon: "📝" },
        { label: "Calendar", href: "/admin/calendar", icon: "📅" },
        { label: "Announcements", href: "/admin/announcements", icon: "📢" },
        { label: "Hostel", href: "/admin/hostel", icon: "🏠" },
      ],
    },
  ],
  faculty: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "📊" },
        { label: "My Profile", href: "/profile", icon: "👤" },
      ],
    },
    {
      title: "Teaching",
      items: [
        { label: "My Timetable", href: "/faculty/timetable", icon: "🗓️" },
        { label: "Mark Attendance", href: "/faculty/attendance", icon: "✅" },
        { label: "Enter Marks", href: "/faculty/marks", icon: "📝" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Leave", href: "/faculty/leave", icon: "📋" },
        { label: "Calendar", href: "/calendar", icon: "📅" },
        { label: "Announcements", href: "/announcements", icon: "📢" },
      ],
    },
  ],
  student: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "📊" },
        { label: "My Profile", href: "/profile", icon: "👤" },
      ],
    },
    {
      title: "Academics",
      items: [
        { label: "My Timetable", href: "/student/timetable", icon: "🗓️" },
        { label: "My Attendance", href: "/student/attendance", icon: "✅" },
        { label: "My Results", href: "/student/results", icon: "📊" },
      ],
    },
    {
      title: "Services",
      items: [
        { label: "Apply Leave", href: "/student/leave", icon: "📝" },
        { label: "Hostel", href: "/student/hostel", icon: "🏠" },
        { label: "Calendar", href: "/calendar", icon: "📅" },
        { label: "Announcements", href: "/announcements", icon: "📢" },
      ],
    },
  ],
  warden: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "📊" },
        { label: "My Profile", href: "/profile", icon: "👤" },
      ],
    },
    {
      title: "Hostel",
      items: [
        { label: "Rooms", href: "/warden/rooms", icon: "🚪" },
        { label: "Gate Pass", href: "/warden/gate-pass", icon: "🎫" },
        { label: "Complaints", href: "/warden/complaints", icon: "📋" },
        { label: "Announcements", href: "/announcements", icon: "📢" },
      ],
    },
  ],
};

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const groups = (NAV_CONFIG[role] ?? NAV_CONFIG.student)!;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col border-r transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={{
        background: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b" style={{ borderColor: "var(--color-border)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
        >
          🎓
        </div>
        {!collapsed && (
          <span className="font-bold text-base tracking-tight whitespace-nowrap">
            University LMS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p
                className="text-[11px] font-semibold uppercase tracking-wider px-3 mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? "text-white"
                        : "hover:bg-white/[0.04]"
                    }`}
                    style={{
                      color: isActive ? "white" : "var(--color-text-secondary)",
                      background: isActive
                        ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.15))"
                        : undefined,
                      border: isActive ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid transparent",
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span
                        className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(139, 92, 246, 0.2)",
                          color: "#a78bfa",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t px-3 py-3" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors duration-150 hover:bg-white/[0.04]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span className="text-base">{collapsed ? "→" : "←"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
