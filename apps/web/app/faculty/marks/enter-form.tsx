"use client";

import { useState, useEffect } from "react";

interface Subject {
  id: string;
  subject: { id: string; name: string; code: string };
  section: { id: string; name: string };
  semester: { id: string; number: number };
}

interface Student {
  id: string;
  name: string;
  enrollmentNo: string | null;
}

interface CreatedExam {
  id: string;
  name: string;
  totalMarks: number;
}

const GRADES = ["O", "A+", "A", "B+", "B", "C", "F"];

export default function EnterMarksForm() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("internal");
  const [totalMarks, setTotalMarks] = useState("100");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [createdExam, setCreatedExam] = useState<CreatedExam | null>(null);
  const [marks, setMarks] = useState<Record<string, { marks: string; grade: string }>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [submittingMarks, setSubmittingMarks] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load faculty subjects
  useEffect(() => {
    (async () => {
      setLoadingSubjects(true);
      try {
        const res = await fetch("http://localhost:3001/api/dashboard/faculty", { credentials: "include" });
        const data = await res.json();
        if (data.success) setSubjects(data.data.mySubjects || []);
        else setError("Failed to load subjects");
      } catch { setError("Cannot connect to server"); }
      finally { setLoadingSubjects(false); }
    })();
  }, []);

  // Load students when subject changes
  const handleSubjectSelect = async (subjectId: string) => {
    const sub = subjects.find((s) => s.subject.id === subjectId);
    setSelectedSubject(sub || null);
    setCreatedExam(null);
    setMarks({});
    setSuccess("");
    setError("");
    if (!sub) { setStudents([]); return; }

    setLoadingStudents(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/users?role=student&sectionId=${sub.section.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const list: Student[] = data.data || [];
      setStudents(list);
      const initial: Record<string, { marks: string; grade: string }> = {};
      list.forEach((s) => { initial[s.id] = { marks: "", grade: "" }; });
      setMarks(initial);
    } catch {
      setError("Failed to load students for this section");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Auto-calculate grade from marks
  const calcGrade = (obtained: number, total: number): string => {
    const pct = total > 0 ? (obtained / total) * 100 : 0;
    if (pct >= 90) return "O";
    if (pct >= 80) return "A+";
    if (pct >= 70) return "A";
    if (pct >= 60) return "B+";
    if (pct >= 50) return "B";
    if (pct >= 40) return "C";
    return "F";
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const obtained = parseFloat(value);
    const total = parseFloat(totalMarks);
    const grade = !isNaN(obtained) && !isNaN(total) ? calcGrade(obtained, total) : "";
    setMarks((prev) => ({ ...prev, [studentId]: { marks: value, grade } }));
  };

  // Step 1: Create the exam
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setSubmittingExam(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3001/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: examName,
          type: examType,
          subjectId: selectedSubject.subject.id,
          semesterId: selectedSubject.semester.id,
          date: examDate,
          totalMarks: parseInt(totalMarks),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedExam({ id: data.data.id, name: data.data.name, totalMarks: data.data.totalMarks });
        setSuccess(`Exam "${examName}" created! Now enter marks below.`);
      } else {
        setError(data.error || "Failed to create exam");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setSubmittingExam(false);
    }
  };

  // Step 2: Submit marks for each student
  const handleSubmitMarks = async () => {
    if (!createdExam || !selectedSubject) return;
    setSubmittingMarks(true);
    setError("");

    const entries = Object.entries(marks).filter(([, v]) => v.marks !== "");
    if (entries.length === 0) {
      setError("Please enter marks for at least one student.");
      setSubmittingMarks(false);
      return;
    }

    try {
      // Bulk marks submission via POST /api/exams/marks
      const res = await fetch("http://localhost:3001/api/exams/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId: createdExam.id,
          results: entries.map(([studentId, { marks: m, grade }]) => ({
            studentId,
            marksObtained: parseFloat(m),
            grade: grade || undefined,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`✅ Marks submitted for ${entries.length} students!`);
        setCreatedExam(null);
        setMarks({});
        setExamName("");
      } else {
        setError(data.error || "Failed to submit marks");
      }
    } catch {
      setError("Failed to submit marks. Check your server connection.");
    } finally {
      setSubmittingMarks(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = { borderColor: "var(--color-border)", color: "var(--color-text-primary)" };

  return (
    <div className="space-y-6">
      {/* Subject selection */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Select Subject</label>
        <select
          onChange={(e) => handleSubjectSelect(e.target.value)}
          disabled={loadingSubjects}
          className={inputCls}
          style={inputStyle}
        >
          <option value="">{loadingSubjects ? "Loading..." : "— Select a subject —"}</option>
          {subjects.map((s) => (
            <option key={s.subject.id} value={s.subject.id}>
              {s.subject.name} ({s.subject.code}) — Sec {s.section.name}
            </option>
          ))}
        </select>
      </div>

      {/* Alerts */}
      {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
      {success && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">{success}</div>}

      {/* Step 1: Create exam */}
      {selectedSubject && !createdExam && (
        <div className="rounded-2xl border p-6" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Step 1 — Create Exam for {selectedSubject.subject.name}
          </h3>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Exam Name *</label>
                <input value={examName} onChange={(e) => setExamName(e.target.value)} required placeholder="e.g., Mid-Term Exam" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Exam Type</label>
                <select value={examType} onChange={(e) => setExamType(e.target.value)} className={inputCls} style={inputStyle}>
                  <option value="internal">Internal</option>
                  <option value="midterm">Mid-Term</option>
                  <option value="endsem">End Semester</option>
                  <option value="supplementary">Supplementary</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Total Marks *</label>
                <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} required min={1} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Exam Date *</label>
                <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required className={inputCls} style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={submittingExam} className="btn-gradient text-sm px-6 py-2.5 disabled:opacity-50">
              {submittingExam ? "Creating..." : "Create Exam & Enter Marks →"}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Enter marks per student */}
      {createdExam && selectedSubject && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Step 2 — Enter Marks: {createdExam.name} (out of {createdExam.totalMarks})
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Grade is auto-calculated. Leave blank to skip a student.
            </p>
          </div>

          {loadingStudents ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              No students in Section {selectedSubject.section.name}.
            </div>
          ) : (
            <>
              <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {students.map((student) => {
                  const entry = marks[student.id] || { marks: "", grade: "" };
                  return (
                    <div key={student.id} className="px-5 py-3 flex items-center gap-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                      >
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{student.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{student.enrollmentNo || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={entry.marks}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          placeholder="Marks"
                          min={0}
                          max={parseFloat(totalMarks)}
                          className="w-24 px-3 py-1.5 rounded-lg text-sm border bg-white/5 outline-none focus:border-purple-500/50 text-center"
                          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                        />
                        <span className="text-xs w-8 text-center font-bold" style={{ color: entry.grade === "F" ? "#ef4444" : entry.grade ? "#22c55e" : "var(--color-text-muted)" }}>
                          {entry.grade || "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                <button
                  onClick={() => { setCreatedExam(null); setMarks({}); }}
                  className="text-sm px-4 py-2 rounded-xl border hover:bg-white/5 transition-colors"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  ← Back
                </button>
                <button onClick={handleSubmitMarks} disabled={submittingMarks} className="btn-gradient text-sm px-6 py-2 disabled:opacity-50">
                  {submittingMarks ? "Saving..." : `Submit Marks (${Object.values(marks).filter(m => m.marks !== "").length} students)`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
