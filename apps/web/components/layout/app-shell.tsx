import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@repo/auth/middleware";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

/**
 * App Shell — wraps all authenticated LMS pages.
 * Server component that fetches session and renders the sidebar + topbar layout.
 *
 * Usage (in layout.tsx):
 *   <AppShell>{children}</AppShell>
 */
export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(await headers());

  if (!session) {
    redirect("/sign-in");
  }

  const { user } = session;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg-primary)" }}>
      {/* Sidebar */}
      <Sidebar role={user.role || "student"} />

      {/* Main content area */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Topbar
          user={{
            name: user.name,
            email: user.email,
            role: user.role || "student",
            image: user.image,
          }}
        />

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
