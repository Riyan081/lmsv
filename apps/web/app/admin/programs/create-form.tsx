"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateProgramFormProps {
  departments: { id: string; name: string; code: string }[];
}

export default function CreateProgramForm({ departments }: CreateProgramFormProps) {
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
      name: form.get("name") as string,
      code: (form.get("code") as string).toUpperCase(),
      durationYears: Number(form.get("durationYears")),
      totalSemesters: Number(form.get("totalSemesters")),
      departmentId: form.get("departmentId") as string,
    };

    try {
      const res = await fetch("http://localhost:3001/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create program");
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
  const labelCls = "block text-xs font-medium mb-1.5";
  const labelStyle = { color: "var(--color-text-secondary)" };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-gradient text-sm">
        + Add Program
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
          Create Academic Program
        </h3>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>Program Name *</label>
            <input
              name="name"
              required
              placeholder="e.g., Bachelor of Technology"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Code *</label>
              <input
                name="code"
                required
                placeholder="e.g., BTECH"
                className={`${inputCls} uppercase`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Department *</label>
              <select name="departmentId" required className={inputCls} style={inputStyle}>
                <option value="">Select department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Duration (Years) *</label>
              <select name="durationYears" required className={inputCls} style={inputStyle}>
                <option value="">Select...</option>
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="4">4 Years</option>
                <option value="5">5 Years</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Total Semesters *</label>
              <select name="totalSemesters" required className={inputCls} style={inputStyle}>
                <option value="">Select...</option>
                {[2, 4, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} Semesters</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-gradient text-sm disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
