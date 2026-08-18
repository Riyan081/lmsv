"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyLeaveForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      type: form.get("type"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      reason: form.get("reason"),
    };

    try {
      const res = await fetch("http://localhost:3001/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to submit leave");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-gradient text-sm">
        + Apply Leave
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Apply for Leave
        </h3>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Leave Type *
            </label>
            <select
              name="type"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            >
              <option value="medical">Medical</option>
              <option value="personal">Personal</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Start Date *
              </label>
              <input
                name="startDate"
                type="date"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                End Date *
              </label>
              <input
                name="endDate"
                type="date"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Reason *
            </label>
            <textarea
              name="reason"
              required
              rows={4}
              minLength={10}
              placeholder="Explain your reason for leave..."
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors resize-none"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(""); }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
