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

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subject: { id: string; name: string; code: string };
  section: {
    id: string;
    name: string;
    batch?: { name: string; program?: { code: string } };
  };
}

export default function MarkAttendanceForm() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [todaySlots, setTodaySlots] = useState<TimetableSlot[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0] ?? "");
  const [period, setPeriod] = useState<string>("1");
  const [classType, setClassType] = useState<"theory" | "practical">("theory");
  const [searchStudent, setSearchStudent] = useState<string>("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedAssignmentId) || null;
  }, [subjects, selectedAssignmentId]);

  // Load faculty subjects & timetable
  useEffect(() => {
    (async () => {
      setLoadingSubjects(true);
      try {
        const [dashRes, ttRes] = await Promise.all([
          fetch("http://localhost:3001/api/dashboard/faculty", { credentials: "include" }),
          fetch("http://localhost:3001/api/timetable/my", { credentials: "include" }),
        ]);

        const dashData = await dashRes.json();
        const ttData = await ttRes.json();

        if (dashData.success) {
          setSubjects(dashData.data.mySubjects || []);
        }

        if (ttData.success) {
          // JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
          // LMS timetable slots: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
          const jsDay = new Date().getDay();
          const lmsDay = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : 0; // Mon-Fri, or Monday for weekend demo
          const todays = (ttData.data || []).filter((s: TimetableSlot) => s.dayOfWeek === lmsDay);
          setTodaySlots(todays);
        }
      } catch {
        setError("Cannot connect to server. Make sure the API is running.");
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, []);

  // When assignment selection changes, load students for that section
  const handleAssignmentChange = async (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setSuccess("");
    setError("");
    setSearchStudent("");

    if (!assignmentId) {
      setStudents([]);
      setAttendance({});
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
      // Pre-mark all as present by default
      const initial: Record<string, string> = {};
      studentList.forEach((s) => {
        initial[s.id] = "present";
      });
      setAttendance(initial);
    } catch {
      setError("Failed to load students for this section.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const markAll = (status: "present" | "absent") => {
    const updated: Record<string, string> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId] || "present";
      const next = current === "present" ? "absent" : current === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const handleQuickSlot = (slot: TimetableSlot) => {
    const matched = subjects.find(
      (s) => s.subject.id === slot.subject.id && s.section.id === slot.section.id
    );
    if (matched) {
      handleAssignmentChange(matched.id);
      // Map start time to approximate period
      if (slot.startTime.startsWith("09")) setPeriod("1");
      else if (slot.startTime.startsWith("11")) setPeriod("2");
      else if (slot.startTime.startsWith("13")) setPeriod("3");
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !date) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (records.length === 0) {
      setError("No students to mark. Please select a class with enrolled students.");
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
        setSuccess(
          `Attendance successfully saved for Period ${period}! (✅ Present: ${present}, ❌ Absent: ${absent}, ⏰ Late: ${late})`
        );
      } else {
        setError(data.error || "Failed to mark attendance");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchStudent) return students;
    const q = searchStudent.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || (s.enrollmentNo || "").toLowerCase().includes(q)
    );
  }, [students, searchStudent]);

  const STATUS_STYLES: Record<string, string> = {
    present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    absent: "bg-red-500/15 text-red-400 border-red-500/25",
    late: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = {
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
    background: "var(--color-bg-card)",
  };

  return (
    <div className="space-y-6">
      {/* Today's Timetable Shortcut */}
      {todaySlots.length > 0 && (
        <div
          className="rounded-2xl border p-5 bg-gradient-to-r from-purple-950/20 to-blue-950/20"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-purple-400">📅 Today&apos;s Teaching Schedule</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              (Click to pre-fill attendance)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {todaySlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleQuickSlot(slot)}
                className="text-left p-3 rounded-xl border bg-white/[0.03] hover:bg-white/[0.08] transition-colors border-purple-500/20"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-purple-300">
                    ⏰ {slot.startTime} - {slot.endTime}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                    Sec {slot.section.name}
                  </span>
                </div>
                <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                  {slot.subject.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {slot.subject.code} · {slot.room || "Classroom"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Class & Subject Selector */}
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Assigned Subject */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Assigned Subject & Section *
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => handleAssignmentChange(e.target.value)}
              disabled={loadingSubjects}
              className={inputCls}
              style={inputStyle}
            >
              <option value="">{loadingSubjects ? "Loading assignments..." : "— Select Subject & Section —"}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject.name} ({s.subject.code}) — Section {s.section.name} · Sem {s.semester.number} ({s.section.batch?.name || ""})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
              style={inputStyle}
            />
          </div>

          {/* Period */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Period / Hour *
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                <option key={p} value={p}>
                  Period {p}
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Lecture Type
            </label>
            <div className="flex rounded-xl border p-0.5 bg-white/5" style={{ borderColor: "var(--color-border)" }}>
              <button
                type="button"
                onClick={() => setClassType("theory")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  classType === "theory" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Theory
              </button>
              <button
                type="button"
                onClick={() => setClassType("practical")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  classType === "practical" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Lab / Practical
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
          ✅ {success}
        </div>
      )}

      {/* Student List Section */}
      {selectedSubject && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          {/* Header with Quick Actions & Counts */}
          <div
            className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {selectedSubject.subject.name} — Section {selectedSubject.section.name} ({classType === "theory" ? "Theory Class" : "Practical Lab"})
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Sorted by Roll / Enrollment No. Click row or badge to toggle status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Batch Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => markAll("present")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll("absent")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 transition-colors"
                >
                  Mark All Absent
                </button>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-2 pl-3 border-l text-xs" style={{ borderColor: "var(--color-border)" }}>
                <span className="text-emerald-400 font-semibold">✅ {presentCount}</span>
                <span className="text-red-400 font-semibold">❌ {absentCount}</span>
                <span className="text-amber-400 font-semibold">⏰ {lateCount}</span>
              </div>
            </div>
          </div>

          {/* Search student within class */}
          <div className="p-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <input
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="🔍 Filter student name or enrollment no..."
              className="w-full px-3.5 py-2 rounded-xl text-xs border bg-white/5 outline-none focus:border-purple-500/50 transition-colors"
              style={inputStyle}
            />
          </div>

          {/* Student Roster */}
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
              {filteredStudents.map((student, idx) => {
                const status = attendance[student.id] || "present";
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleAttendance(student.id)}
                    className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                      >
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {student.name}
                        </p>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-purple-300 font-semibold">
                          {student.enrollmentNo || "—"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAttendance(student.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${STATUS_STYLES[status]}`}
                    >
                      {status}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Submit */}
          <div
            className="p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {students.length} students · {classType === "theory" ? "Theory" : "Lab"} · Period {period} · {date}
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting || students.length === 0}
              className="btn-gradient text-sm px-6 py-2.5 disabled:opacity-50"
            >
              {submitting ? "Saving Attendance..." : `Submit Attendance (${presentCount} Present)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
