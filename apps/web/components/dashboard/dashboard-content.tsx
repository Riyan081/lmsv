"use client";

import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";

/**
 * Client-side dashboard actions (sign out button, etc.)
 */
export default function DashboardContent() {
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
    <div style={{ marginTop: "24px" }}>
      <button
        onClick={handleSignOut}
        className="btn btn-danger"
        id="dashboard-signout-btn"
      >
        Sign Out
      </button>
    </div>
  );
}
