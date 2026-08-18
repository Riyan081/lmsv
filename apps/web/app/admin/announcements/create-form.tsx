"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAnnouncementForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("http://localhost:3001/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.get("title"),
          content: form.get("content"),
          type: form.get("type"),
          isPinned: form.get("isPinned") === "on",
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed"); return; }
      setOpen(false);
      router.refresh();
    } catch { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  if (!open) return <button onClick={() => setOpen(true)} className="btn-gradient text-sm">+ New Announcement</button>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-lg rounded-2xl border p-6" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Create Announcement</h3>
        {error && <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Title *</label>
            <input name="title" required placeholder="Announcement title"
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Content *</label>
            <textarea name="content" required rows={4} placeholder="Write the announcement..."
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors resize-none"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Type</label>
              <select name="type" className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}>
                <option value="global">Global</option>
                <option value="department">Department</option>
                <option value="class">Class</option>
                <option value="hostel">Hostel</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isPinned" className="w-4 h-4 rounded accent-purple-500" />
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Pin this</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
              {loading ? "Creating..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
