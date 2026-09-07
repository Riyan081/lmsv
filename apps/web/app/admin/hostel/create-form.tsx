"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateHostelForm({ wardens = [] }: { wardens?: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wardenList, setWardenList] = useState<{ id: string; name: string }[]>(wardens);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (wardens.length > 0) {
      setWardenList(wardens);
    }
  }, [wardens]);

  useEffect(() => {
    if (open) {
      fetch("http://localhost:3001/api/users?role=warden", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setWardenList(data.data);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const wardenId = form.get("wardenId") as string;

    try {
      const res = await fetch("http://localhost:3001/api/hostel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.get("name"),
          type: form.get("type"),
          wardenId: wardenId || undefined,
          totalRooms: parseInt((form.get("totalRooms") as string) || "0", 10),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create hostel");
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

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = { borderColor: "var(--color-border)", color: "var(--color-text-primary)" };

  if (!open) return <button onClick={() => setOpen(true)} className="btn-gradient text-sm">+ Add Hostel</button>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Add Hostel</h3>
        {error && <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Hostel Name *</label>
            <input name="name" required placeholder="e.g., Boys Hostel Block A"
              className={inputCls}
              style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Hostel Type *</label>
              <select name="type" className={inputCls} style={inputStyle}>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Expected Rooms</label>
              <input name="totalRooms" type="number" min={0} defaultValue={0} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Assigned Warden</label>
            <select name="wardenId" className={inputCls} style={inputStyle}>
              <option value="">Select Warden (Optional)...</option>
              {wardenList.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
              {loading ? "Creating..." : "Create Hostel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
