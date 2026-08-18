"use client";

import { useState } from "react";

export default function ApplyGatePassForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("http://localhost:3001/api/hostel/gate-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reason: form.get("reason"),
          outDate: form.get("outDate"),
          outTime: form.get("outTime"),
          expectedReturnDate: form.get("expectedReturnDate"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Gate pass requested! Waiting for approval.");
        (e.target as HTMLFormElement).reset();
      } else {
        setError(data.error || "Failed to request gate pass");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
      {success && <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">{success}</div>}

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Reason *</label>
        <input name="reason" required placeholder="Why do you need a gate pass?"
          className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Out Date *</label>
          <input name="outDate" type="date" required
            className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Out Time *</label>
          <input name="outTime" type="time" required
            className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Expected Return *</label>
        <input name="expectedReturnDate" type="date" required
          className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
      </div>
      <button type="submit" disabled={loading} className="w-full btn-gradient text-sm py-2.5 disabled:opacity-50">
        {loading ? "Submitting..." : "Request Gate Pass"}
      </button>
    </form>
  );
}
