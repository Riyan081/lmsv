"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CreateUserFormProps {
  role: "student" | "faculty" | "warden";
  departments: any[];
  batches: any[];
}

export default function CreateUserForm({ role, departments, batches }: CreateUserFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  // Dynamically load sections when batch changes
  useEffect(() => {
    if (!selectedBatchId) { setSections([]); return; }
    const batch = batches.find((b: any) => b.id === selectedBatchId);
    // Sections are included in the batch object from the API
    setSections(batch?.sections || []);
  }, [selectedBatchId, batches]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body: Record<string, any> = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      role,
      phone: (form.get("phone") as string) || undefined,
      gender: (form.get("gender") as string) || undefined,
      departmentId: (form.get("departmentId") as string) || undefined,
    };

    if (role === "student") {
      body.enrollmentNo = (form.get("enrollmentNo") as string) || undefined;
      body.batchId = (form.get("batchId") as string) || undefined;
      body.sectionId = (form.get("sectionId") as string) || undefined;
      body.guardianName = (form.get("guardianName") as string) || undefined;
      body.guardianPhone = (form.get("guardianPhone") as string) || undefined;
    }

    if (role === "faculty") {
      body.employeeId = (form.get("employeeId") as string) || undefined;
    }

    try {
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || `Failed to create ${role}`);
        return;
      }

      setOpen(false);
      setSelectedBatchId("");
      router.refresh();
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 transition-colors";
  const inputStyle = { borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-card)" };
  const labelCls = "block text-xs font-medium mb-1.5";
  const labelStyle = { color: "var(--color-text-secondary)" };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-gradient text-sm">
        + Add {role === "student" ? "Student" : role === "faculty" ? "Faculty" : "Warden"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Add New {role === "student" ? "Student" : role === "faculty" ? "Faculty Member" : "Warden"}
            </h3>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Full Name *</label>
                  <input name="name" required placeholder="e.g., Rahul Sharma" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Email *</label>
                  <input name="email" type="email" required placeholder="e.g., rahul@college.com" className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Password *</label>
                  <input name="password" type="password" required placeholder="Min 6 characters" minLength={6} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Phone</label>
                  <input name="phone" placeholder="e.g., 9876543210" className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Gender</label>
                  <select name="gender" className={inputCls} style={inputStyle}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Department</label>
                  <select name="departmentId" className={inputCls} style={inputStyle}>
                    <option value="">Select department...</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student-specific fields */}
              {role === "student" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls} style={labelStyle}>Enrollment No</label>
                      <input name="enrollmentNo" placeholder="e.g., CSE2024001" className={`${inputCls} uppercase`} style={inputStyle} />
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>Batch</label>
                      <select
                        name="batchId"
                        className={inputCls}
                        style={inputStyle}
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                      >
                        <option value="">Select batch...</option>
                        {batches.map((b: any) => (
                          <option key={b.id} value={b.id}>
                            {b.program?.code} — {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Section — only shown after batch is selected */}
                  <div>
                    <label className={labelCls} style={labelStyle}>
                      Section {selectedBatchId ? "" : <span className="text-xs opacity-50">(select a batch first)</span>}
                    </label>
                    <select
                      name="sectionId"
                      className={inputCls}
                      style={inputStyle}
                      disabled={sections.length === 0}
                    >
                      <option value="">{sections.length === 0 ? "No sections available" : "Select section..."}</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>Section {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls} style={labelStyle}>Guardian Name</label>
                      <input name="guardianName" placeholder="e.g., Mr. Vijay Sharma" className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>Guardian Phone</label>
                      <input name="guardianPhone" placeholder="e.g., 9876543210" className={inputCls} style={inputStyle} />
                    </div>
                  </div>
                </>
              )}

              {/* Faculty-specific fields */}
              {role === "faculty" && (
                <div>
                  <label className={labelCls} style={labelStyle}>Employee ID</label>
                  <input name="employeeId" placeholder="e.g., FAC010" className={`${inputCls} uppercase`} style={inputStyle} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSelectedBatchId(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-gradient text-sm disabled:opacity-50">
                  {loading ? "Creating..." : `Create ${role === "student" ? "Student" : "Faculty"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
