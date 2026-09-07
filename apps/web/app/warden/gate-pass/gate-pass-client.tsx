"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function GatePassClient({ passes }: { passes: any[] }) {
  const router = useRouter();
  const [passList, setPassList] = useState<any[]>(passes);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setPassList(passes);
  }, [passes]);

  const filtered = passList.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.student?.name?.toLowerCase().includes(q);
      const matchEnroll = p.student?.enrollmentNo?.toLowerCase().includes(q);
      const matchReason = p.reason?.toLowerCase().includes(q);
      if (!matchName && !matchEnroll && !matchReason) return false;
    }
    return true;
  });

  const counts = {
    all: passList.length,
    pending: passList.filter((p) => p.status === "pending").length,
    approved: passList.filter((p) => p.status === "approved").length,
    rejected: passList.filter((p) => p.status === "rejected").length,
  };

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    // Optimistically update UI immediately
    setPassList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));

    try {
      const res = await fetch(`http://localhost:3001/api/hostel/gate-pass/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        // Revert on error
        setPassList(passes);
        alert(data.error || "Failed to update gate pass status");
      }
    } catch {
      setPassList(passes);
      alert("Failed to connect to server");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filter tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border ${
                filter === f ? "btn-gradient border-transparent" : "hover:bg-white/5"
              }`}
              style={filter !== f ? { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" } : {}}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
              <span className="ml-1 text-xs opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search student or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-xs border outline-none bg-white/5 min-w-[220px]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">🎫</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No gate pass requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pass) => (
            <div
              key={pass.id}
              className="rounded-2xl border p-5 hover:bg-white/[0.02] transition-colors"
              style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {pass.student?.name}
                    </span>
                    {pass.student?.enrollmentNo && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                        {pass.student.enrollmentNo}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[pass.status] || ""}`}>
                      {pass.status}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>{pass.reason}</p>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <span>📅 Out: {new Date(pass.outDate).toLocaleDateString()} at {pass.outTime}</span>
                    <span>↩️ Return by: {new Date(pass.expectedReturnDate).toLocaleDateString()}</span>
                    {pass.approvedBy && <span>✅ By: {pass.approvedBy.name}</span>}
                  </div>
                </div>

                {/* Approve/Reject actions */}
                {pass.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleStatus(pass.id, "rejected")}
                      disabled={updating === pass.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors border border-red-500/20 disabled:opacity-50"
                    >
                      {updating === pass.id ? "..." : "Reject"}
                    </button>
                    <button
                      onClick={() => handleStatus(pass.id, "approved")}
                      disabled={updating === pass.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors border border-emerald-500/20 disabled:opacity-50"
                    >
                      {updating === pass.id ? "..." : "Approve"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
