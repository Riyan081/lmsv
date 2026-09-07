"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Exam {
  id: string;
  name: string;
  totalMarks: number;
  subject: { id: string; name: string; code: string };
  semester?: { number: number };
}

interface EnterMarksFormProps {
  exam: Exam;
}

interface Student {
  id: string;
  name: string;
  enrollmentNo?: string;
}

export default function EnterMarksForm({ exam }: EnterMarksFormProps) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setFetchingStudents(true);

    // Fetch students who are in sections that study this subject
    fetch(`http://localhost:3001/api/users?role=student&subjectId=${exam.subject.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const studs: Student[] = (data.data || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          enrollmentNo: u.enrollmentNo,
        }));
        setStudents(studs);
        // Initialize marks as empty
        const initMarks: Record<string, string> = {};
        for (const s of studs) initMarks[s.id] = "";
        setMarks(initMarks);
      })
      .catch(() => setStudents([]))
      .finally(() => setFetchingStudents(false));
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Only include students with marks entered
    const results = Object.entries(marks)
      .filter(([, v]) => v !== "" && !isNaN(Number(v)))
      .map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained: Number(marksObtained),
      }));

    if (results.length === 0) {
      setError("Enter marks for at least one student.");
      setLoading(false);
      return;
    }

    // Validate marks don't exceed total
    const invalid = results.filter((r) => r.marksObtained > exam.totalMarks || r.marksObtained < 0);
    if (invalid.length > 0) {
      setError(`Marks must be between 0 and ${exam.totalMarks}.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/exams/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ examId: exam.id, results }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to enter marks");
        return;
      }

      setSuccess(`✅ Marks entered for ${data.data.totalEntered} student${data.data.totalEntered !== 1 ? "s" : ""}`);
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 1200);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        📝 Enter Marks
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] flex flex-col"
            style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Enter Marks — {exam.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {exam.subject.code} — {exam.subject.name} · Total Marks: {exam.totalMarks}
              </p>
            </div>

            {error && (
              <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                {success}
              </div>
            )}

            {fetchingStudents ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading students...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                {/* Student list */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1" style={{ maxHeight: "420px" }}>
                  {students.length === 0 && (
                    <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>
                      No students found.
                    </p>
                  )}
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                          {s.name}
                        </p>
                        {s.enrollmentNo && (
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.enrollmentNo}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={exam.totalMarks}
                          step={0.5}
                          placeholder="—"
                          value={marks[s.id] || ""}
                          onChange={(e) => setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-20 px-3 py-1.5 rounded-lg text-sm border bg-white/5 outline-none focus:border-purple-500/50 text-center transition-colors"
                          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                        />
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>/{exam.totalMarks}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setError(""); setSuccess(""); }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
                    {loading ? "Saving..." : `Save Marks (${Object.values(marks).filter((v) => v !== "").length} students)`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
