"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveActionButtons({ leaveId }: { leaveId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(status);
    try {
      await fetch(`http://localhost:3001/api/leave/${leaveId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {
      // Silently handle — page will show unchanged status
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 shrink-0 ml-4">
      <button
        onClick={() => handleAction("approved")}
        disabled={loading !== null}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
      >
        {loading === "approved" ? "..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading !== null}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
      >
        {loading === "rejected" ? "..." : "Reject"}
      </button>
    </div>
  );
}
