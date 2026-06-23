import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@repo/auth/middleware";
import DashboardContent from "../../components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession(await headers());

  if (!session) {
    redirect("/sign-in");
  }

  const { user } = session;

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1 className="dashboard-greeting">
          Hello, {user.name}! 👋
        </h1>
        <p className="dashboard-subtitle">
          Here&apos;s your account overview
        </p>

        {/* Session info card */}
        <div className="session-card">
          <h2 className="session-card-title">Profile</h2>

          <div className="session-field">
            <span className="session-field-label">Name</span>
            <span className="session-field-value">{user.name}</span>
          </div>

          <div className="session-field">
            <span className="session-field-label">Email</span>
            <span className="session-field-value">{user.email}</span>
          </div>

          <div className="session-field">
            <span className="session-field-label">Role</span>
            <span
              className={`role-badge role-${user.role || "user"}`}
            >
              {(user.role || "user").toUpperCase()}
            </span>
          </div>

          <div className="session-field">
            <span className="session-field-label">Email Verified</span>
            <span className="session-field-value">
              {user.emailVerified ? "✅ Yes" : "❌ No"}
            </span>
          </div>

          <div className="session-field">
            <span className="session-field-label">Member Since</span>
            <span className="session-field-value">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Session details card */}
        <div className="session-card">
          <h2 className="session-card-title">Session</h2>

          <div className="session-field">
            <span className="session-field-label">Session ID</span>
            <span className="session-field-value" style={{ fontFamily: "monospace", fontSize: "12px" }}>
              {session.session.id.slice(0, 16)}...
            </span>
          </div>

          <div className="session-field">
            <span className="session-field-label">Expires</span>
            <span className="session-field-value">
              {new Date(session.session.expiresAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Client-side actions */}
        <DashboardContent />
      </div>
    </div>
  );
}
