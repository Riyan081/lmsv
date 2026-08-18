import AppShell from "../../components/layout/app-shell";

/**
 * Dashboard layout — all /dashboard/* routes get the AppShell
 * (sidebar + topbar + content area).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
