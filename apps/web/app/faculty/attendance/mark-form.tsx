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

export default function MarkAttendanceForm() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState("1");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch faculty's assigned subjects via dashboard
  useEffect(() => {
    (async () => {
      setLoadingSubjects(true);
      try {
        const res = await fetch("http://localhost:3001/api/dashboard/faculty", { credentials: "include" });
        const data = await res.json();
        if (data.success) setSubjects(data.data.mySubjects || []);
        else setError("Failed to load your subjects.");
      } catch {
        setError("Cannot connect to server. Make sure the API is running.");
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, []);

  // When subject is selected, fetch students for that section
  const handleSubjectSelect = async (subjectId: string) => {
    if (!subjectId) { setSelectedSubject(null); setStudents([]); return; }
    const sub = subjects.find((s) => s.subject.id === subjectId);
    if (!sub) return;
    setSelectedSubject(sub);
    setAttendance({});
    setSuccess("");
    setError("");

    setLoadingStudents(true);
    try {
      // Correct API: fetch students filtered by sectionId
      const res = await fetch(
        `http://localhost:3001/api/users?role=student&sectionId=${sub.section.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const studentList: Student[] = data.data || [];
      setStudents(studentList);
      // Pre-mark all as present
      const initial: Record<string, string> = {};
      studentList.forEach((s) => { initial[s.id] = "present"; });
      setAttendance(initial);
    } catch {
      setError("Failed to load students for this section.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId] || "present";
      const next = current === "present" ? "absent" : current === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !date) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
    if (records.length === 0) {
      setError("No students to mark. Please select a subject with enrolled students.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subjectId: selectedSubject.subject.id,
          date,
          period: parseInt(period),
          records,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const { present, absent, late } = data.data;
        setSuccess(`Attendance saved! Present: ${present}, Absent: ${absent}, Late: ${late}`);
      } else {
        setError(data.error || "Failed to mark attendance");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_STYLES: Record<string, string> = {
    present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    absent: "bg-red-500/15 text-red-400 border-red-500/25",
    late: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;

  return (
    <div className="space-y-6">
      {/* Subject, Date & Period Selection */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Select Subject
            </label>
            <select
              onChange={(e) => handleSubjectSelect(e.target.value)}
              disabled={loadingSubjects}
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            >
              <option value="">{loadingSubjects ? "Loading..." : "— Select a subject —"}</option>
              {subjects.map((s) => (
                <option key={s.subject.id} value={s.subject.id}>
                  {s.subject.name} ({s.subject.code}) — Sec {s.section.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Period *</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            >
              {[1,2,3,4,5,6,7,8].map((p) => (
                <option key={p} value={p}>Period {p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
      {success && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">✅ {success}</div>}

      {/* Student list */}
      {selectedSubject && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {selectedSubject.subject.name} — Section {selectedSubject.section.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Click status badge to toggle: Present → Absent → Late
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400">✅ {presentCount}</span>
              <span className="text-red-400">❌ {absentCount}</span>
              <span className="text-amber-400">⏰ {lateCount}</span>
            </div>
          </div>

          {loadingStudents ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No students found in Section {selectedSubject.section.name}.
                Make sure students are assigned to this section when created.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {students.map((student) => {
                const status = attendance[student.id] || "present";
                return (
                  <div
                    key={student.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => toggleAttendance(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                      >
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{student.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{student.enrollmentNo || "—"}</p>
                      </div>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${STATUS_STYLES[status]}`}
                      onClick={(e) => { e.stopPropagation(); toggleAttendance(student.id); }}
                    >
                      {status}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {students.length} students · Period {period} · {date}
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting || students.length === 0}
              className="btn-gradient text-sm px-6 py-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Submit Attendance"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
