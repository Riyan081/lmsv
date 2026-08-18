"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["plumbing", "electrical", "furniture", "cleaning", "other"] as const;

export default function FilecomplaintForm({ rooms }: { rooms: { id: string; roomNumber: string }[] }) {
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
      roomId: form.get("roomId") as string,
      category: form.get("category") as string,
      description: form.get("description") as string,
    };
    try {
      const res = await fetch("http://localhost:3001/api/hostel/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to file complaint"); return; }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = { borderColor: "var(--color-border)", color: "var(--color-text-primary)" };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-gradient text-sm">+ File Complaint</button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>File a Complaint</h3>
            {error && <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Room *</label>
                <select name="roomId" required className={inputCls} style={inputStyle}>
                  <option value="">Select your room...</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>Room {r.roomNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Category *</label>
                <select name="category" required className={inputCls} style={inputStyle}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Description *</label>
                <textarea
                  name="description"
                  required
                  minLength={10}
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-white/5 transition-colors" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">{loading ? "Filing..." : "File Complaint"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
