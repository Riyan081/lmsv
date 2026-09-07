"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-500/15 text-red-400 border-red-500/20",
  in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: "🚿",
  electrical: "⚡",
  furniture: "🪑",
  cleaning: "🧹",
  other: "📋",
};

export default function ComplaintsClient({ complaints }: { complaints: any[] }) {
  const router = useRouter();
  const [complaintList, setComplaintList] = useState<any[]>(complaints);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setComplaintList(complaints);
  }, [complaints]);

  const filtered = complaintList.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchStudent = c.student?.name?.toLowerCase().includes(q) || c.student?.enrollmentNo?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchCategory = c.category?.toLowerCase().includes(q);
      const matchRoom = c.room?.roomNumber?.toLowerCase().includes(q) || c.room?.hostel?.name?.toLowerCase().includes(q);
      if (!matchStudent && !matchDesc && !matchCategory && !matchRoom) return false;
    }
    return true;
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    // Optimistic UI update
    setComplaintList((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

    try {
      const res = await fetch(`http://localhost:3001/api/hostel/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        setComplaintList(complaints);
        alert(data.error || "Failed to update status");
      }
    } catch {
      setComplaintList(complaints);
      alert("Failed to connect to server");
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all: complaintList.length,
    open: complaintList.filter((c) => c.status === "open").length,
    in_progress: complaintList.filter((c) => c.status === "in_progress").length,
    resolved: complaintList.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="space-y-5">
      {/* Search and Filter tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["all", "open", "in_progress", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border ${
                filter === f ? "btn-gradient border-transparent" : "hover:bg-white/5"
              }`}
              style={filter !== f ? { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" } : {}}
            >
              {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}{" "}
              <span className="ml-1 text-xs opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search complaints, room, student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-xs border outline-none bg-white/5 min-w-[240px]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No complaints found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border p-5 hover:bg-white/[0.02] transition-colors"
              style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl shrink-0">{CATEGORY_ICONS[c.category] || "📋"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold capitalize" style={{ color: "var(--color-text-primary)" }}>
                      {c.category}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[c.status] || ""}`}>
                      {c.status?.replace("_", " ")}
                    </span>
                    {c.room && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                        📍 {c.room.hostel?.name} — Room {c.room.roomNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>{c.description}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    By: {c.student?.name} {c.student?.enrollmentNo ? `(${c.student.enrollmentNo})` : ""} · {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status actions */}
                {c.status !== "resolved" && (
                  <div className="flex gap-2 shrink-0">
                    {c.status === "open" && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, "in_progress")}
                        disabled={updating === c.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors border border-amber-500/20 disabled:opacity-50"
                      >
                        {updating === c.id ? "..." : "Start"}
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(c.id, "resolved")}
                      disabled={updating === c.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors border border-emerald-500/20 disabled:opacity-50"
                    >
                      {updating === c.id ? "..." : "Resolve"}
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
