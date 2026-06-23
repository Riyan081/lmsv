import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@repo/auth/middleware";
import Link from "next/link";

export default async function Home() {
  // Server-side session check
  const session = await getServerSession(await headers());

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: "520px" }}>
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-header">
            <div className="auth-logo">✦</div>
            <h1 className="dashboard-greeting">Todo App</h1>
            <p className="auth-subtitle" style={{ marginTop: "12px" }}>
              Organize your tasks, boost your productivity, and collaborate
              seamlessly with your team.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "32px" }}>
            <Link href="/sign-in" className="btn btn-primary" id="home-signin-btn">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-social" id="home-signup-btn">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
