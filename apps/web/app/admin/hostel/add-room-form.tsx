"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddRoomModal({ hostelId, hostelName }: { hostelId: string; hostelName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("http://localhost:3001/api/hostel/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hostelId,
          roomNumber: form.get("roomNumber") as string,
          floor: parseInt(form.get("floor") as string, 10),
          capacity: parseInt(form.get("capacity") as string, 10),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create room");
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-xl border border-dashed hover:bg-white/5 transition-colors font-medium"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        + Add Room
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
          >
            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
              Add Room to {hostelName}
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
              Configure room number, floor level, and student bed capacity.
            </p>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  Room Number *
                </label>
                <input
                  name="roomNumber"
                  required
                  placeholder="e.g. 101, 102, 201"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                    Floor *
                  </label>
                  <input
                    name="floor"
                    type="number"
                    min={0}
                    max={20}
                    defaultValue={1}
                    required
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                    Capacity (Beds) *
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    min={1}
                    max={10}
                    defaultValue={2}
                    required
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
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
                  {loading ? "Adding..." : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
