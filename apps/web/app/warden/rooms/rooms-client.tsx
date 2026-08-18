"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  allocations: { id: string; student: { id: string; name: string; enrollmentNo?: string } }[];
  _count: { allocations: number };
}

interface Hostel {
  id: string;
  name: string;
  type: string;
  _count?: { rooms: number };
  rooms: Room[];
}

export default function WardenRoomsClient({ hostels }: { hostels: Hostel[] }) {
  const router = useRouter();
  const [selectedHostel, setSelectedHostel] = useState<string>(hostels[0]?.id || "");
  const [showAllocate, setShowAllocate] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [vacating, setVacating] = useState<string | null>(null);

  const hostel = hostels.find((h) => h.id === selectedHostel);
  const rooms = hostel?.rooms || [];
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r._count.allocations, 0);

  const handleAllocate = async (roomId: string) => {
    if (!studentId.trim()) return;
    setAllocating(true);
    try {
      const res = await fetch("http://localhost:3001/api/hostel/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roomId,
          studentId: studentId.trim(),
          allocatedDate: new Date().toISOString().split("T")[0],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAllocate(null);
        setStudentId("");
        router.refresh();
      } else {
        alert(data.error || "Failed to allocate room");
      }
    } finally {
      setAllocating(false);
    }
  };

  const handleVacate = async (allocationId: string) => {
    if (!confirm("Vacate this room allocation?")) return;
    setVacating(allocationId);
    try {
      const res = await fetch(`http://localhost:3001/api/hostel/allocate/${allocationId}/vacate`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) router.refresh();
    } finally {
      setVacating(null);
    }
  };

  if (hostels.length === 0) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <div className="text-5xl mb-4">🏠</div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>No hostels found</p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Ask an admin to create hostels first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hostel selector + stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Hostel:</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm border bg-white/5 outline-none min-w-[200px]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-card)" }}
          >
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 text-sm">
          <span style={{ color: "var(--color-text-muted)" }}>
            Occupied: <strong className="text-amber-400">{totalOccupied}</strong>
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>
            Available: <strong className="text-emerald-400">{totalCapacity - totalOccupied}</strong>
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>
            Total: <strong style={{ color: "var(--color-text-primary)" }}>{totalCapacity}</strong>
          </span>
        </div>
      </div>

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="text-4xl mb-3">🚪</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No rooms in this hostel yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const occupied = room._count.allocations;
            const available = room.capacity - occupied;
            const isFull = available === 0;

            return (
              <div
                key={room.id}
                className={`rounded-2xl border p-4 transition-all ${isFull ? "opacity-80" : ""}`}
                style={{ background: "var(--color-bg-card)", borderColor: isFull ? "rgba(239,68,68,0.3)" : "var(--color-border)" }}
              >
                {/* Room header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                      Room {room.roomNumber}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      Floor {room.floor}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isFull ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                    {isFull ? "Full" : `${available} free`}
                  </span>
                </div>

                {/* Capacity bar */}
                <div className="h-1.5 rounded-full bg-white/5 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(occupied / room.capacity) * 100}%`,
                      background: isFull ? "#ef4444" : occupied > 0 ? "#f59e0b" : "#22c55e",
                    }}
                  />
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                  {occupied}/{room.capacity} occupied
                </p>

                {/* Current occupants */}
                {room.allocations.map((alloc) => (
                  <div key={alloc.id} className="flex items-center justify-between mb-1.5 px-2 py-1.5 rounded-lg bg-white/5">
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{alloc.student.name}</p>
                      {alloc.student.enrollmentNo && (
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{alloc.student.enrollmentNo}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleVacate(alloc.id)}
                      disabled={vacating === alloc.id}
                      className="text-xs px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      {vacating === alloc.id ? "..." : "Vacate"}
                    </button>
                  </div>
                ))}

                {/* Allocate button */}
                {!isFull && (
                  <>
                    {showAllocate === room.id ? (
                      <div className="mt-2 space-y-2">
                        <input
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="Student ID..."
                          className="w-full px-3 py-2 rounded-lg text-xs border bg-white/5 outline-none"
                          style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowAllocate(null); setStudentId(""); }}
                            className="flex-1 px-2 py-1.5 rounded-lg text-xs border hover:bg-white/5 transition-colors"
                            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAllocate(room.id)}
                            disabled={allocating}
                            className="flex-1 btn-gradient text-xs disabled:opacity-50"
                          >
                            {allocating ? "..." : "Allocate"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAllocate(room.id)}
                        className="w-full mt-2 px-3 py-2 rounded-lg text-xs border border-dashed hover:bg-white/5 transition-colors"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                      >
                        + Allocate Student
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
