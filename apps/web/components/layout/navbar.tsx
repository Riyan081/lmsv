/* eslint-disable @next/next/no-img-element */
"use client";

import { authClient } from "@repo/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <nav className="dashboard-nav">
      <Link href="/" className="dashboard-nav-brand">
        <div className="auth-logo">✦</div>
        Todo App
      </Link>

      <div className="dashboard-nav-actions">
        {isPending ? (
          <div className="spinner" />
        ) : session ? (
          <>
            <Link href="/dashboard" className="btn btn-ghost">
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="btn btn-ghost"
              id="signout-btn"
            >
              Sign Out
            </button>
            <div className="avatar" id="user-avatar">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                />
              ) : (
                session.user.name?.charAt(0).toUpperCase()
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary" style={{ width: "auto" }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
