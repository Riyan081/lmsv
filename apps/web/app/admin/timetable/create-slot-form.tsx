"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Section {
  id: string;
  name: string;
  batch?: { name: string; program?: { code: string } };
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Faculty {
  id: string;
  name: string;
}

interface Semester {
  id: string;
  number: number;
  program: { code: string };
}

interface CreateSlotFormProps {
  /** Called after a successful create so parent can refresh */
  onCreated: () => void;
}

export default function CreateSlotForm({ onCreated }: CreateSlotFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  useEffect(() => {
    if (!open || dataLoaded) return;
    Promise.all([
      fetch("http://localhost:3001/api/batches", { credentials: "include" }).then((r) => r.json()),
      fetch("http://localhost:3001/api/subjects", { credentials: "include" }).then((r) => r.json()),
      fetch("http://localhost:3001/api/users?role=faculty", { credentials: "include" }).then((r) => r.json()),
      fetch("http://localhost:3001/api/programs", { credentials: "include" }).then((r) => r.json()),
    ]).then(([batchData, subjectData, facultyData, programData]) => {
      // Extract sections from batches
      const allSections: Section[] = [];
      (batchData.data || []).forEach((b: any) => {
        (b.sections || []).forEach((s: any) => {
          allSections.push({ id: s.id, name: s.name, batch: { name: b.name, program: b.program } });
        });
      });
      setSections(allSections);
      setSubjects(subjectData.data || []);
      setFacultyList(facultyData.data || []);

      // Get semesters from programs
      const allSemesters: Semester[] = [];
      (programData.data || []).forEach((p: any) => {
        (p.semesters || []).forEach((s: any) => {
          allSemesters.push({ id: s.id, number: s.number, program: { code: p.code } });
        });
      });
      setSemesters(allSemesters.sort((a, b) => a.number - b.number));
      setDataLoaded(true);
    });
  }, [open, dataLoaded]);

  const currentSection = sections.find((s) => s.id === selectedSectionId);
  const filteredSemesters = selectedSectionId && currentSection?.batch?.program?.code
    ? semesters.filter((sem) => sem.program.code.toUpperCase() === currentSection.batch?.program?.code?.toUpperCase())
    : semesters;

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const targetSection = sections.find((s) => s.id === sectionId);
    const validSems = sectionId && targetSection?.batch?.program?.code
      ? semesters.filter((sem) => sem.program.code.toUpperCase() === targetSection.batch?.program?.code?.toUpperCase())
      : semesters;
    if (!validSems.some((s) => s.id === selectedSemesterId)) {
      setSelectedSemesterId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      dayOfWeek: Number(form.get("dayOfWeek")),
      startTime: form.get("startTime") as string,
      endTime: form.get("endTime") as string,
      room: (form.get("room") as string) || undefined,
      subjectId: form.get("subjectId") as string,
      facultyId: form.get("facultyId") as string,
      sectionId: selectedSectionId,
      semesterId: selectedSemesterId,
    };

    try {
      const res = await fetch("http://localhost:3001/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create slot");
        return;
      }

      setOpen(false);
      onCreated();
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
        + Add Lecture Slot
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Add Lecture to Timetable
          </h3>
          <button onClick={() => setOpen(false)} className="text-xl" style={{ color: "var(--color-text-muted)" }}>✕</button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day + Time */}
          <div>
            <label className={labelCls} style={labelStyle}>Day of Week *</label>
            <select name="dayOfWeek" required className={inputCls} style={inputStyle}>
              <option value="">Select day...</option>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Start Time *</label>
              <input name="startTime" type="time" required className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>End Time *</label>
              <input name="endTime" type="time" required className={inputCls} style={inputStyle} />
            </div>
          </div>

          {/* Section + Semester */}
          <div className="grid grid-cols-2 gap-4">
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
                  <option key={s.id} value={s.id}>
                    {s.batch?.program?.code} {s.batch?.name} — Sec {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                Semester * {currentSection?.batch?.program?.code && <span className="text-purple-400 font-normal">({currentSection.batch.program.code})</span>}
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
                  {!selectedSectionId ? "Select section first..." : filteredSemesters.length === 0 ? "No semesters found" : "Select semester..."}
                </option>
                {filteredSemesters.map((s) => (
                  <option key={s.id} value={s.id}>Sem {s.number} ({s.program.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject + Faculty */}
          <div>
            <label className={labelCls} style={labelStyle}>Subject *</label>
            <select name="subjectId" required className={inputCls} style={inputStyle}>
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Faculty *</label>
            <select name="facultyId" required className={inputCls} style={inputStyle}>
              <option value="">Select faculty...</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Room / Lab</label>
            <input name="room" placeholder="e.g., Room 101, Lab A3" className={inputCls} style={inputStyle} />
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
              {loading ? "Adding..." : "Add to Timetable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
