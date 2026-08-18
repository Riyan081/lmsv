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

interface CreateSubjectFormProps {
  departments: Department[];
}

export default function CreateSubjectForm({ departments }: CreateSubjectFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const router = useRouter();

  // Fetch all semesters on mount (from all programs)
  useEffect(() => {
    if (!open) return;
    setLoadingSemesters(true);
    fetch("http://localhost:3001/api/programs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        // Programs come with semesters included via getAll
        // But programService.getAll() doesn't include semesters. Fetch each program's semesters.
        // Instead, fetch via /api/programs/:id or just use a flat list approach.
        // For now we fetch all programs then their semesters using /api/programs/:id
        // Since programs.getAll includes _count.semesters, we need a different approach:
        // We'll just show semester number + program code for UX
        const programs: any[] = data.data || [];
        return Promise.all(
          programs.map((p: any) =>
            fetch(`http://localhost:3001/api/programs/${p.id}`, { credentials: "include" })
              .then((r) => r.json())
              .then((pd) => pd.data?.semesters?.map((s: any) => ({ ...s, program: { name: p.name, code: p.code } })) || [])
          )
        );
      })
      .then((nestedSemesters) => {
        setSemesters(nestedSemesters.flat().sort((a, b) => a.number - b.number));
      })
      .catch(() => setSemesters([]))
      .finally(() => setLoadingSemesters(false));
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      code: (form.get("code") as string).toUpperCase(),
      credits: Number(form.get("credits")),
      type: form.get("type") as string,
      semesterId: form.get("semesterId") as string,
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
                No semesters found. Create programs first — semesters are auto-generated with programs.
              </p>
            )}
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
              {loading ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
