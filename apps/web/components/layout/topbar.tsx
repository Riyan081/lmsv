"use client";

import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/15 text-red-400 border-red-500/20",
  faculty: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  student: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warden: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export default function Topbar({ user }: TopbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  return (
    <header
      className="h-[60px] flex items-center justify-between px-6 border-b sticky top-0 z-30 backdrop-blur-xl"
      style={{
        background: "rgba(10, 10, 15, 0.85)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Left — Breadcrumb / Page title area */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          University LMS
        </h2>
      </div>

      {/* Right — User info */}
      <div className="flex items-center gap-4">
        {/* Role badge */}
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${ROLE_COLORS[user.role] || ROLE_COLORS.student}`}
        >
          {user.role}
        </span>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {user.name}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {user.email}
            </p>
          </div>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 hover:bg-white/[0.06]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
