"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
  code: string;
  semester?: { id: string; number: number; program?: { code: string } };
}

interface CreateExamFormProps {
  subjects: Subject[];
}

const EXAM_TYPES = [
  { value: "internal", label: "Internal" },
  { value: "midterm", label: "Mid-Term" },
  { value: "endsem", label: "End Semester" },
  { value: "supplementary", label: "Supplementary" },
];

export default function CreateExamForm({ subjects }: CreateExamFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const router = useRouter();

  const groupedSubjects = useMemo(() => {
    const groups: Record<string, Subject[]> = {};
    for (const s of subjects) {
      const semLabel = s.semester
        ? `${s.semester.program?.code || "Program"} — Semester ${s.semester.number}`
        : "General / Other";
      if (!groups[semLabel]) groups[semLabel] = [];
      groups[semLabel].push(s);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [subjects]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const subjectId = form.get("subjectId") as string;
    const subject = subjects.find((s) => s.id === subjectId);

    const body = {
      name: form.get("name") as string,
      type: form.get("type") as string,
      subjectId,
      semesterId: subject?.semester?.id || form.get("semesterId") as string,
      date: form.get("date") as string,
      totalMarks: Number(form.get("totalMarks")),
    };

    if (!body.semesterId) {
      setError("Could not determine semester from subject. Please select a subject with a semester.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create exam");
        return;
      }

      setOpen(false);
      setSelectedSubject(null);
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
        + Create Exam
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-md rounded-2xl border p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Create Exam
        </h3>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>Exam Name *</label>
            <input
              name="name"
              required
              placeholder="e.g., DSA Mid-Term Exam"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Type *</label>
              <select name="type" required className={inputCls} style={inputStyle}>
                {EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Total Marks *</label>
              <input
                name="totalMarks"
                type="number"
                required
                min={1}
                max={500}
                placeholder="100"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Subject *</label>
            <select
              name="subjectId"
              required
              className={inputCls}
              style={inputStyle}
              onChange={(e) => setSelectedSubject(subjects.find((s) => s.id === e.target.value) || null)}
            >
              <option value="">Select subject...</option>
              {groupedSubjects.map(([groupName, items]) => (
                <optgroup key={groupName} label={groupName} className="font-semibold text-purple-400 bg-gray-900">
                  {items.map((s) => (
                    <option key={s.id} value={s.id} className="text-gray-100 bg-gray-900 font-normal">
                      {s.code} — {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedSubject?.semester && (
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Semester: {selectedSubject.semester.number} — {selectedSubject.semester.program?.code}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Exam Date *</label>
            <input
              name="date"
              type="date"
              required
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setSelectedSubject(null); setError(""); }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
              {loading ? "Creating..." : "Create Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
