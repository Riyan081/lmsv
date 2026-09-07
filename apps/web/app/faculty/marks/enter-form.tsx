"use client";

import { useState, useEffect, useMemo } from "react";

interface SubjectItem {
  id: string; // FacultySubject assignment ID
  subject: { id: string; name: string; code: string };
  section: {
    id: string;
    name: string;
    batch?: { id: string; name: string; program?: { code: string } };
  };
  semester: { id: string; number: number };
}

interface Student {
  id: string;
  name: string;
  enrollmentNo: string | null;
}

interface Exam {
  id: string;
  name: string;
  type: string;
  totalMarks: number;
  date: string;
  subjectId: string;
  semesterId?: string;
  _count?: { results: number };
}

export default function EnterMarksForm() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("new");
  const [students, setStudents] = useState<Student[]>([]);

  // New Exam fields
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("internal");
  const [totalMarks, setTotalMarks] = useState("100");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);

  // Marks state: studentId -> { marks, grade }
  const [marks, setMarks] = useState<Record<string, { marks: string; grade: string }>>({});

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedAssignmentId) || null;
  }, [subjects, selectedAssignmentId]);

  // Load faculty subjects & exams
  useEffect(() => {
    (async () => {
      setLoadingSubjects(true);
      try {
        const [dashRes, examsRes] = await Promise.all([
          fetch("http://localhost:3001/api/dashboard/faculty", { credentials: "include" }),
          fetch("http://localhost:3001/api/exams?limit=100", { credentials: "include" }),
        ]);

        const dashData = await dashRes.json();
        const examsData = await examsRes.json();

        if (dashData.success) {
          setSubjects(dashData.data.mySubjects || []);
        }
        if (examsData.success) {
          setAllExams(examsData.data?.records || examsData.data || []);
        }
      } catch {
        setError("Cannot connect to server. Make sure the API is running.");
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, []);

  // Filter exams applicable for the selected subject
  const subjectExams = useMemo(() => {
    if (!selectedSubject) return [];
    return allExams.filter((e) => e.subjectId === selectedSubject.subject.id);
  }, [allExams, selectedSubject]);

  // When subject changes, fetch students for that section
  const handleAssignmentChange = async (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedExamId("new");
    setMarks({});
    setSuccess("");
    setError("");

    if (!assignmentId) {
      setStudents([]);
      return;
    }

    const item = subjects.find((s) => s.id === assignmentId);
    if (!item) return;

    setLoadingStudents(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/users?role=student&sectionId=${item.section.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const studentList: Student[] = (data.data || []).sort((a: Student, b: Student) =>
        (a.enrollmentNo || a.name).localeCompare(b.enrollmentNo || b.name)
      );

      setStudents(studentList);
      const initial: Record<string, { marks: string; grade: string }> = {};
      studentList.forEach((s) => {
        initial[s.id] = { marks: "", grade: "" };
      });
      setMarks(initial);
    } catch {
      setError("Failed to load students for this section.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // When picking an existing exam, load any existing marks if available
  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    setError("");
    setSuccess("");

    if (examId !== "new") {
      const ex = subjectExams.find((e) => e.id === examId);
      if (ex) {
        setTotalMarks(String(ex.totalMarks));
        setExamName(ex.name);
        setExamType(ex.type);
      }
    }
  };

  // Grade calculation
  const calcGrade = (obtained: number, total: number): string => {
    const pct = total > 0 ? (obtained / total) * 100 : 0;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  };

  const handleMarksInput = (studentId: string, value: string) => {
    const obtained = parseFloat(value);
    const total = parseFloat(totalMarks);
    const grade = !isNaN(obtained) && !isNaN(total) && obtained >= 0 ? calcGrade(obtained, total) : "";
    setMarks((prev) => ({
      ...prev,
      [studentId]: { marks: value, grade },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    let targetExamId = selectedExamId;
    const maxMarks = parseFloat(totalMarks);

    // Step 1: If creating a new exam, create it first
    if (targetExamId === "new") {
      if (!examName.trim()) {
        setError("Please enter an exam title.");
        setSubmitting(false);
        return;
      }

      try {
        const createRes = await fetch("http://localhost:3001/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: examName,
            type: examType,
            subjectId: selectedSubject.subject.id,
            semesterId: selectedSubject.semester.id,
            date: examDate,
            totalMarks: maxMarks,
          }),
        });
        const createData = await createRes.json();
        if (!createData.success) {
          setError(createData.error || "Failed to create exam");
          setSubmitting(false);
          return;
        }
        targetExamId = createData.data.id;
      } catch {
        setError("Failed to connect to server to create exam.");
        setSubmitting(false);
        return;
      }
    }

    // Step 2: Prepare marks payload
    const entries = Object.entries(marks).filter(([, v]) => v.marks !== "" && !isNaN(parseFloat(v.marks)));
    if (entries.length === 0) {
      setError("Please enter marks for at least one student.");
      setSubmitting(false);
      return;
    }

    // Validate marks do not exceed total
    const invalid = entries.filter(([, v]) => parseFloat(v.marks) > maxMarks || parseFloat(v.marks) < 0);
    if (invalid.length > 0) {
      setError(`Marks must be between 0 and ${maxMarks}.`);
      setSubmitting(false);
      return;
    }

    try {
      const marksRes = await fetch("http://localhost:3001/api/exams/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId: targetExamId,
          results: entries.map(([studentId, { marks: m, grade }]) => ({
            studentId,
            marksObtained: parseFloat(m),
            grade: grade || calcGrade(parseFloat(m), maxMarks),
          })),
        }),
      });

      const marksData = await marksRes.json();
      if (marksData.success) {
        setSuccess(
          `✅ Marks successfully entered and published for ${entries.length} students in Section ${selectedSubject.section.name}!`
        );
      } else {
        setError(marksData.error || "Failed to submit marks");
      }
    } catch {
      setError("Failed to submit marks. Check server connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const GRADE_COLORS: Record<string, string> = {
    "A+": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    A: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "B+": "bg-blue-500/15 text-blue-400 border-blue-500/30",
    B: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    C: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    D: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    F: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  const enteredCount = Object.values(marks).filter((m) => m.marks !== "").length;

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = {
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
    background: "var(--color-bg-card)",
  };

  return (
    <div className="space-y-6">
      {/* Subject & Exam Configuration */}
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Assigned Course */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Assigned Course & Section *
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => handleAssignmentChange(e.target.value)}
              disabled={loadingSubjects}
              className={inputCls}
              style={inputStyle}
            >
              <option value="">{loadingSubjects ? "Loading courses..." : "— Select Course & Section —"}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject.name} ({s.subject.code}) — Section {s.section.name} · Sem {s.semester.number} ({s.section.batch?.name || ""})
                </option>
              ))}
            </select>
          </div>

          {/* Exam Selection / Mode */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Exam / Assessment *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => handleExamChange(e.target.value)}
              disabled={!selectedSubject}
              className={inputCls}
              style={inputStyle}
            >
              <option value="new">+ Create New Exam / Quiz</option>
              {subjectExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.type.toUpperCase()}) — Max {e.totalMarks} Marks
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* New Exam Details (only shown if creating new exam) */}
        {selectedExamId === "new" && selectedSubject && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Exam Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Unit Test 1, Mid-Term Exam, Lab Practical"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className={inputCls}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Assessment Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option value="internal">Internal Assessment</option>
                <option value="midterm">Mid-Term Exam</option>
                <option value="endsem">End Semester Exam</option>
                <option value="supplementary">Supplementary Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Total Marks *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className={inputCls}
                style={inputStyle}
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Students Marks Entry Sheet */}
      {selectedSubject && (
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            {/* Table Header */}
            <div
              className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Enter Marks: {selectedSubject.subject.name} — Section {selectedSubject.section.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  Total Marks: <strong className="text-purple-300">{totalMarks}</strong> · Grades auto-calculated as you type.
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 font-semibold">
                {enteredCount} of {students.length} Marks Entered
              </span>
            </div>

            {loadingStudents ? (
              <div className="p-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                Loading students for Section {selectedSubject.section.name}...
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No students enrolled in Section {selectedSubject.section.name}.
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {students.map((student, idx) => {
                  const sMarks = marks[student.id]?.marks || "";
                  const sGrade = marks[student.id]?.grade || "";
                  const numMarks = parseFloat(sMarks);
                  const isExceeded = !isNaN(numMarks) && numMarks > parseFloat(totalMarks);

                  return (
                    <div
                      key={student.id}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-gray-400 w-5 text-center shrink-0">
                          {idx + 1}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                        >
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                            {student.name}
                          </p>
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-purple-300 font-semibold">
                            {student.enrollmentNo || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Marks Input & Grade Badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={parseFloat(totalMarks)}
                            step={0.5}
                            placeholder="—"
                            value={sMarks}
                            onChange={(e) => handleMarksInput(student.id, e.target.value)}
                            className={`w-24 px-3 py-1.5 rounded-xl text-sm border bg-white/5 outline-none text-center font-bold transition-colors ${
                              isExceeded ? "border-red-500 text-red-400" : "focus:border-purple-500/50"
                            }`}
                            style={{ borderColor: isExceeded ? undefined : "var(--color-border)", color: "var(--color-text-primary)" }}
                          />
                          <span className="text-[10px] text-gray-400 ml-1.5 font-mono">
                            /{totalMarks}
                          </span>
                        </div>

                        {/* Grade */}
                        <span
                          className={`w-12 py-1 rounded-lg text-xs font-bold text-center border uppercase tracking-wider ${
                            sGrade ? GRADE_COLORS[sGrade] || "bg-white/5 text-gray-300 border-white/10" : "bg-transparent border-transparent text-transparent"
                          }`}
                        >
                          {sGrade || "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Footer */}
            <div
              className="p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {enteredCount} students graded · Maximum score: {totalMarks}
              </p>
              <button
                type="submit"
                disabled={submitting || students.length === 0}
                className="btn-gradient text-sm px-6 py-2.5 disabled:opacity-50"
              >
                {submitting ? "Publishing Marks..." : `Save & Publish Marks (${enteredCount} Students)`}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
