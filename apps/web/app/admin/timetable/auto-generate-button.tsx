"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Section {
  id: string;
  label: string;
  programCode?: string;
}

interface Semester {
  id: string;
  label: string;
  programCode: string;
}

interface AutoGenerateButtonProps {
  sections: Section[];
  semesters: Semester[];
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = [
  { start: "09:00", end: "11:00", label: "Lecture 1" },
  { start: "11:15", end: "13:15", label: "Lecture 2" },
  { start: "13:45", end: "15:45", label: "Lecture 3" },
];

export default function AutoGenerateButton({ sections, semesters }: AutoGenerateButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<{ created: number } | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const router = useRouter();

  const currentSection = sections.find((s) => s.id === selectedSectionId);
  const filteredSemesters = selectedSectionId && currentSection?.programCode
    ? semesters.filter((sem) => sem.programCode.toUpperCase() === currentSection.programCode.toUpperCase())
    : semesters;

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const targetSection = sections.find((s) => s.id === sectionId);
    const validSems = sectionId && targetSection?.programCode
      ? semesters.filter((sem) => sem.programCode.toUpperCase() === targetSection.programCode.toUpperCase())
      : semesters;

    if (!validSems.some((s) => s.id === selectedSemesterId)) {
      setSelectedSemesterId("");
    }
  };

  const handleOpenModal = () => {
    setOpen(true);
    setError("");
    setWarnings([]);
    setResult(null);
    if (!selectedSectionId && sections.length > 0) {
      const initialSectionId = sections[0]?.id || "";
      setSelectedSectionId(initialSectionId);
      const initialSection = sections[0];
      const validSems = initialSection?.programCode
        ? semesters.filter((sem) => sem.programCode.toUpperCase() === initialSection.programCode.toUpperCase())
        : semesters;
      if (validSems.length > 0) {
        setSelectedSemesterId(validSems[0]!.id);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWarnings([]);
    setResult(null);

    const sectionId = selectedSectionId;
    const semesterId = selectedSemesterId;

    if (!sectionId || !semesterId) {
      setError("Please select both a section and a semester.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/timetable/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sectionId, semesterId, clearExisting }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to generate timetable");
        if (data.warnings?.length) setWarnings(data.warnings);
        return;
      }

      setResult(data.data);
      if (data.data?.warnings?.length) setWarnings(data.data.warnings);
      setTimeout(() => {
        setOpen(false);
        setResult(null);
        setWarnings([]);
        router.refresh();
      }, 2000);
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
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-purple-500/10 hover:border-purple-500/30"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        <span>🤖</span>
        Auto-Generate
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-lg shrink-0">
            🤖
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Auto-Generate Timetable
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Constraint solver · 3 slots/day (09:00–11:00, 11:15–13:15, 13:45–15:45) · Mon–Fri · 15 slots/week
            </p>
          </div>
        </div>

        {/* How it works */}
        <div
          className="rounded-xl border p-3 mb-4 space-y-1.5"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-card)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>How it works:</p>
          {[
            "Reads all FacultySubject assignments for the selected section + semester",
            "Calculates slots needed per subject (ceil(credits ÷ 2))",
            "Places subjects avoiding faculty conflicts across all sections",
            "Spreads same subject across different days (no cramming)",
            "Returns error if scheduling is impossible",
          ].map((tip, i) => (
            <p key={i} className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span className="text-purple-400 mr-1.5">{i + 1}.</span>{tip}
            </p>
          ))}
        </div>

        {/* Success */}
        {result && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
            ✅ Successfully generated <strong>{result.created}</strong> timetable slots! Refreshing...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 whitespace-pre-line">
            ❌ {error}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-4 space-y-1">
            {warnings.map((w, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                {w}
              </div>
            ))}
          </div>
        )}

        {!result && (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className={labelCls} style={labelStyle}>Section *</label>
              <select
                name="sectionId"
                required
                value={selectedSectionId}
                onChange={(e) => handleSectionChange(e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">Select section...</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              {sections.length === 0 && (
                <p className="text-xs mt-1 text-amber-400">No sections found. Create batches and sections first.</p>
              )}
            </div>

            <div>
              <label className={labelCls} style={labelStyle}>
                Semester * {currentSection?.programCode && <span className="text-purple-400 font-normal">({currentSection.programCode})</span>}
              </label>
              <select
                name="semesterId"
                required
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className={inputCls}
                style={inputStyle}
                disabled={!selectedSectionId}
              >
                <option value="">
                  {!selectedSectionId ? "Select a section first..." : filteredSemesters.length === 0 ? "No semesters found" : "Select semester..."}
                </option>
                {filteredSemesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Clear existing toggle */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-white/[0.02] transition-colors"
              style={{ borderColor: "var(--color-border)" }}
              onClick={() => setClearExisting(!clearExisting)}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${clearExisting ? "bg-red-500 border-red-500" : ""}`}
                style={!clearExisting ? { borderColor: "var(--color-border)" } : {}}
              >
                {clearExisting && <span className="text-white text-[10px]">✓</span>}
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Clear existing slots before generating
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ⚠️ Will delete all current slots for this section+semester
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(""); setWarnings([]); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-gradient text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⚙️</span> Generating...
                  </>
                ) : (
                  "🤖 Generate Timetable"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
