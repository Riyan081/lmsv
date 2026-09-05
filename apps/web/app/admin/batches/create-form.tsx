"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Program {
  id: string;
  name: string;
  code: string;
  durationYears: number;
}

interface Batch {
  id: string;
  name: string;
  program?: { code: string; name: string };
  sections?: { name: string }[];
}

interface CreateBatchFormProps {
  programs: Program[];
  batches: Batch[];
}

export default function CreateBatchForm({ programs, batches }: CreateBatchFormProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"batch" | "section">("batch");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  const handleBatchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const startYear = Number(form.get("startYear"));
    const endYear = Number(form.get("endYear"));

    const body = {
      name: `${startYear}-${endYear}`,
      startYear,
      endYear,
      programId: form.get("programId") as string,
    };

    try {
      const res = await fetch("http://localhost:3001/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create batch");
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

  const handleSectionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: (form.get("name") as string).toUpperCase(),
      batchId: form.get("batchId") as string,
    };

    try {
      const res = await fetch("http://localhost:3001/api/batches/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create section");
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
      <div className="flex gap-2">
        <button onClick={() => { setTab("batch"); setOpen(true); }} className="btn-gradient text-sm">
          + Add Batch
        </button>
        <button
          onClick={() => { setTab("section"); setOpen(true); }}
          className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          + Add Section
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
      >
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "var(--color-bg-card)" }}>
          <button
            onClick={() => setTab("batch")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "batch" ? "btn-gradient" : "hover:bg-white/5"}`}
            style={tab !== "batch" ? { color: "var(--color-text-secondary)" } : {}}
          >
            New Batch
          </button>
          <button
            onClick={() => setTab("section")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "section" ? "btn-gradient" : "hover:bg-white/5"}`}
            style={tab !== "section" ? { color: "var(--color-text-secondary)" } : {}}
          >
            New Section
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* New Batch form */}
        {tab === "batch" && (
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div>
              <label className={labelCls} style={labelStyle}>Program *</label>
              <select
                name="programId"
                required
                className={inputCls}
                style={inputStyle}
                onChange={(e) => setSelectedProgram(programs.find(p => p.id === e.target.value) || null)}
              >
                <option value="">Select program...</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))}
              </select>
              {selectedProgram && (
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {selectedProgram.durationYears}-year program
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>Start Year *</label>
                <select name="startYear" required className={inputCls} style={inputStyle}>
                  <option value="">Select...</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>End Year *</label>
                <select name="endYear" required className={inputCls} style={inputStyle}>
                  <option value="">Select...</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Batch name will be auto-set as <strong>"StartYear–EndYear"</strong> (e.g., 2024–2028).
            </p>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
                {loading ? "Creating..." : "Create Batch"}
              </button>
            </div>
          </form>
        )}

        {/* New Section form */}
        {tab === "section" && (
          <form onSubmit={handleSectionSubmit} className="space-y-4">
            <div>
              <label className={labelCls} style={labelStyle}>Batch *</label>
              <select
                name="batchId"
                required
                className={inputCls}
                style={inputStyle}
              >
                <option value="">Select batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}{b.program ? ` (${b.program.code})` : ""}
                    {b.sections && b.sections.length > 0
                      ? ` — Sections: ${b.sections.map((s) => s.name).join(", ")}`
                      : ""}
                  </option>
                ))}
              </select>
              {batches.length === 0 && (
                <p className="text-xs mt-1 text-amber-400">No batches yet. Create a batch first.</p>
              )}
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Section Name *</label>
              <input
                name="name"
                required
                placeholder="e.g., A, B, C"
                maxLength={5}
                className={`${inputCls} uppercase`}
                style={inputStyle}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
                {loading ? "Creating..." : "Create Section"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
