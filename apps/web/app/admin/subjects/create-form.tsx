"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Semester {
  id: string;
  number: number;
  program: { name: string; code: string };
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department?: { code: string };
}

interface Section {
  id: string;
  name: string;
  batch?: { name: string; program?: { code: string } };
}

interface Batch {
  id: string;
  name: string;
  program?: { code: string };
  sections?: Section[];
}

interface CreateSubjectFormProps {
  departments: Department[];
  faculty: Faculty[];
  batches: Batch[];
}

export default function CreateSubjectForm({ departments, faculty, batches }: CreateSubjectFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [createdSubjectId, setCreatedSubjectId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  // Faculty assignment fields
  const [assignFaculty, setAssignFaculty] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignDone, setAssignDone] = useState(false);

  const router = useRouter();

  const allSections: (Section & { batchName: string; programCode: string })[] = batches.flatMap((b) =>
    (b.sections || []).map((s) => ({
      ...s,
      batchName: b.name,
      programCode: b.program?.code || "",
    }))
  );

  const filteredSections = selectedBatchId
    ? allSections.filter((s) => {
        const batch = batches.find((b) => b.id === selectedBatchId);
        return batch?.sections?.some((bs) => bs.id === s.id);
      })
    : allSections;

  // Fetch semesters when modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingSemesters(true);
    fetch("http://localhost:3001/api/programs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const programs: any[] = data.data || [];
        return Promise.all(
          programs.map((p: any) =>
            fetch(`http://localhost:3001/api/programs/${p.id}`, { credentials: "include" })
              .then((r) => r.json())
              .then((pd) => pd.data?.semesters?.map((s: any) => ({ ...s, program: { name: p.name, code: p.code } })) || [])
          )
        );
      })
      .then((nested) => setSemesters(nested.flat().sort((a, b) => a.number - b.number)))
      .catch(() => setSemesters([]))
      .finally(() => setLoadingSemesters(false));
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const semId = form.get("semesterId") as string;
    setSelectedSemesterId(semId);

    const body = {
      name: form.get("name") as string,
      code: (form.get("code") as string).toUpperCase(),
      credits: Number(form.get("credits")),
      type: form.get("type") as string,
      semesterId: semId,
      departmentId: form.get("departmentId") as string,
    };

    try {
      const res = await fetch("http://localhost:3001/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create subject");
        return;
      }

      // If no faculty to assign, done
      if (!assignFaculty) {
        setOpen(false);
        router.refresh();
        return;
      }

      // Store created subject ID and show faculty assignment step
      setCreatedSubjectId(data.data.id);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createdSubjectId) return;
    setAssignLoading(true);
    setAssignError("");

    const form = new FormData(e.currentTarget);
    const body = {
      facultyId: form.get("facultyId") as string,
      sectionId: form.get("sectionId") as string,
      semesterId: selectedSemesterId,
    };

    try {
      const res = await fetch(`http://localhost:3001/api/subjects/${createdSubjectId}/assign-faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setAssignError(data.error || "Failed to assign faculty");
        return;
      }

      setAssignDone(true);
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 800);
    } catch {
      setAssignError("Failed to connect to server");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedSubjectId(null);
    setSelectedSemesterId("");
    setAssignFaculty(false);
    setSelectedFacultyId("");
    setSelectedBatchId("");
    setAssignError("");
    setAssignDone(false);
    setError("");
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = { borderColor: "var(--color-border)", color: "var(--color-text-primary)" };
  const labelCls = "block text-xs font-medium mb-1.5";
  const labelStyle = { color: "var(--color-text-secondary)" };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-gradient text-sm">
        + Add Subject
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-md rounded-2xl border p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
      >
        {/* ── Step 1: Create Subject ── */}
        {!createdSubjectId && (
          <>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Create Subject
            </h3>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls} style={labelStyle}>Subject Name *</label>
                <input name="name" required placeholder="e.g., Data Structures and Algorithms" className={inputCls} style={inputStyle} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Subject Code *</label>
                  <input name="code" required placeholder="e.g., CS301" className={`${inputCls} uppercase`} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Credits *</label>
                  <select name="credits" required className={inputCls} style={inputStyle}>
                    <option value="">Select...</option>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Credit{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Type *</label>
                  <select name="type" required className={inputCls} style={inputStyle}>
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="elective">Elective</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Department *</label>
                  <select name="departmentId" required className={inputCls} style={inputStyle}>
                    <option value="">Select dept...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Semester *</label>
                <select name="semesterId" required className={inputCls} style={inputStyle} disabled={loadingSemesters}>
                  <option value="">{loadingSemesters ? "Loading semesters..." : "Select semester..."}</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      Sem {s.number} — {s.program.code}
                    </option>
                  ))}
                </select>
                {semesters.length === 0 && !loadingSemesters && (
                  <p className="text-xs mt-1 text-amber-400">
                    No semesters found. Create programs first.
                  </p>
                )}
              </div>

              {/* Optional: assign faculty right away */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: "var(--color-border)" }}
                onClick={() => setAssignFaculty(!assignFaculty)}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${assignFaculty ? "bg-purple-500 border-purple-500" : ""}`}
                  style={!assignFaculty ? { borderColor: "var(--color-border)" } : {}}
                >
                  {assignFaculty && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Also assign a faculty member for this subject
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
                  {loading ? "Creating..." : "Create Subject"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Step 2: Assign Faculty ── */}
        {createdSubjectId && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✅</span>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Subject Created!
                </h3>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Now assign a faculty member for this subject.
                </p>
              </div>
            </div>

            {assignDone && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                ✅ Faculty assigned successfully!
              </div>
            )}

            {assignError && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignFaculty} className="space-y-4">
              <div>
                <label className={labelCls} style={labelStyle}>Faculty *</label>
                <select
                  name="facultyId"
                  required
                  className={inputCls}
                  style={inputStyle}
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                >
                  <option value="">Select faculty...</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}{f.department ? ` (${f.department.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Batch (to filter sections)</label>
                <select
                  className={inputCls}
                  style={inputStyle}
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                >
                  <option value="">All batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}{b.program ? ` (${b.program.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} style={labelStyle}>Section *</label>
                <select name="sectionId" required className={inputCls} style={inputStyle}>
                  <option value="">Select section...</option>
                  {filteredSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name} — {s.batchName} ({s.programCode})
                    </option>
                  ))}
                </select>
                {filteredSections.length === 0 && (
                  <p className="text-xs mt-1 text-amber-400">No sections found. Create sections under batches first.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                  Skip & Close
                </button>
                <button type="submit" disabled={assignLoading || assignDone} className="flex-1 btn-gradient text-sm disabled:opacity-50">
                  {assignLoading ? "Assigning..." : "Assign Faculty"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
