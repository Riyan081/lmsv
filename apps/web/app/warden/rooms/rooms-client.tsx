"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface StudentInfo {
  id: string;
  name: string;
  enrollmentNo?: string;
  email?: string;
  batch?: { id: string; name: string; startYear?: number; endYear?: number };
  department?: { id: string; name: string; code: string };
  section?: { id: string; name: string };
}

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  allocations: {
    id: string;
    student: StudentInfo;
  }[];
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
  const [viewMode, setViewMode] = useState<"rooms" | "students">("rooms");
  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [occupancyFilter, setOccupancyFilter] = useState<"all" | "available" | "full">("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"room" | "floor" | "occupancy">("room");

  const [showAllocate, setShowAllocate] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [vacating, setVacating] = useState<string | null>(null);

  const hostel = hostels.find((h) => h.id === selectedHostel);
  const rooms = hostel?.rooms || [];

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r._count.allocations, 0);

  // Extract all distinct floors and batches for filter dropdowns
  const floors = useMemo(() => {
    return Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
  }, [rooms]);

  const allStudents = useMemo(() => {
    const list: {
      allocationId: string;
      roomId: string;
      roomNumber: string;
      floor: number;
      student: StudentInfo;
    }[] = [];

    rooms.forEach((r) => {
      r.allocations.forEach((a) => {
        list.push({
          allocationId: a.id,
          roomId: r.id,
          roomNumber: r.roomNumber,
          floor: r.floor,
          student: a.student,
        });
      });
    });
    return list;
  }, [rooms]);

  const batches = useMemo(() => {
    const bSet = new Set<string>();
    allStudents.forEach((item) => {
      if (item.student.batch?.name) bSet.add(item.student.batch.name);
    });
    return Array.from(bSet).sort();
  }, [allStudents]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    let result = rooms.filter((r) => {
      if (floorFilter !== "all" && r.floor.toString() !== floorFilter) return false;
      const occupied = r._count.allocations;
      const isFull = occupied >= r.capacity;
      if (occupancyFilter === "available" && isFull) return false;
      if (occupancyFilter === "full" && !isFull) return false;

      if (batchFilter !== "all") {
        const hasBatch = r.allocations.some((a) => a.student.batch?.name === batchFilter);
        if (!hasBatch) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesRoom = r.roomNumber.toLowerCase().includes(q);
        const matchesStudent = r.allocations.some(
          (a) =>
            a.student.name.toLowerCase().includes(q) ||
            a.student.enrollmentNo?.toLowerCase().includes(q) ||
            a.student.email?.toLowerCase().includes(q)
        );
        if (!matchesRoom && !matchesStudent) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "floor") return a.floor - b.floor || a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
      if (sortBy === "occupancy") return b._count.allocations - a._count.allocations;
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
    });

    return result;
  }, [rooms, floorFilter, occupancyFilter, batchFilter, search, sortBy]);

  // Filtered students for batch-wise directory
  const filteredStudents = useMemo(() => {
    let result = allStudents.filter((item) => {
      if (floorFilter !== "all" && item.floor.toString() !== floorFilter) return false;
      if (batchFilter !== "all" && item.student.batch?.name !== batchFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.student.name.toLowerCase().includes(q);
        const matchesEnroll = item.student.enrollmentNo?.toLowerCase().includes(q);
        const matchesRoom = item.roomNumber.toLowerCase().includes(q);
        const matchesDept = item.student.department?.name.toLowerCase().includes(q) || item.student.department?.code.toLowerCase().includes(q);
        if (!matchesName && !matchesEnroll && !matchesRoom && !matchesDept) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      const batchA = a.student.batch?.name || "";
      const batchB = b.student.batch?.name || "";
      if (batchA !== batchB) return batchA.localeCompare(batchB);
      return a.student.name.localeCompare(b.student.name);
    });

    return result;
  }, [allStudents, floorFilter, batchFilter, search]);

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
      else alert(data.error || "Failed to vacate");
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
      {/* Hostel selector + occupancy stats bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 rounded-2xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Hostel:</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm border font-medium outline-none min-w-[220px]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-secondary)" }}
          >
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6 text-xs sm:text-sm">
          <span style={{ color: "var(--color-text-muted)" }}>
            Occupied: <strong className="text-amber-400 font-semibold">{totalOccupied}</strong>
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>
            Available: <strong className="text-emerald-400 font-semibold">{totalCapacity - totalOccupied}</strong>
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>
            Total Capacity: <strong className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{totalCapacity}</strong>
          </span>
        </div>
      </div>

      {/* Control bar: Search, Filters, View toggle */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search student, enrollment, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-xs border outline-none bg-white/5 transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Floor filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border bg-white/5 outline-none"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-secondary)" }}
          >
            <option value="all">All Floors</option>
            {floors.map((f) => (
              <option key={f} value={f.toString()}>Floor {f}</option>
            ))}
          </select>

          {/* Batch filter */}
          {batches.length > 0 && (
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border bg-white/5 outline-none"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-secondary)" }}
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>Batch {b}</option>
              ))}
            </select>
          )}

          {/* Occupancy status filter (for room view) */}
          {viewMode === "rooms" && (
            <select
              value={occupancyFilter}
              onChange={(e) => setOccupancyFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs border bg-white/5 outline-none"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-secondary)" }}
            >
              <option value="all">All Occupancy</option>
              <option value="available">Has Free Slots</option>
              <option value="full">Fully Occupied</option>
            </select>
          )}

          {/* Sort By (for room view) */}
          {viewMode === "rooms" && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs border bg-white/5 outline-none"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", background: "var(--color-bg-secondary)" }}
            >
              <option value="room">Sort: Room No</option>
              <option value="floor">Sort: Floor</option>
              <option value="occupancy">Sort: Occupancy</option>
            </select>
          )}

          {/* View toggle */}
          <div className="flex rounded-xl border p-0.5" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}>
            <button
              onClick={() => setViewMode("rooms")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "rooms" ? "btn-gradient shadow-sm" : "text-muted hover:text-white"
              }`}
            >
              🚪 Rooms ({filteredRooms.length})
            </button>
            <button
              onClick={() => setViewMode("students")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "students" ? "btn-gradient shadow-sm" : "text-muted hover:text-white"
              }`}
            >
              👥 Students ({filteredStudents.length})
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Rooms Grid */}
      {viewMode === "rooms" && (
        <>
          {filteredRooms.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <p className="text-4xl mb-3">🚪</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>No rooms match the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRooms.map((room) => {
                const occupied = room._count.allocations;
                const available = room.capacity - occupied;
                const isFull = available === 0;

                return (
                  <div
                    key={room.id}
                    className={`rounded-2xl border p-4 transition-all ${isFull ? "opacity-90" : ""}`}
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
                    <p className="text-xs mb-3 font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {occupied}/{room.capacity} occupied
                    </p>

                    {/* Occupants */}
                    <div className="space-y-1.5 mb-3 min-h-[50px]">
                      {room.allocations.length === 0 ? (
                        <p className="text-xs italic py-2" style={{ color: "var(--color-text-muted)" }}>Empty room</p>
                      ) : (
                        room.allocations.map((alloc) => (
                          <div key={alloc.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                            <div>
                              <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{alloc.student.name}</p>
                              <div className="flex gap-2 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                                {alloc.student.enrollmentNo && <span>{alloc.student.enrollmentNo}</span>}
                                {alloc.student.batch?.name && <span>• Batch {alloc.student.batch.name}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => handleVacate(alloc.id)}
                              disabled={vacating === alloc.id}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              {vacating === alloc.id ? "..." : "Vacate"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Allocate button */}
                    {!isFull && (
                      <>
                        {showAllocate === room.id ? (
                          <div className="mt-2 space-y-2 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                            <input
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                              placeholder="Enter Student Enrollment No, Email, or ID..."
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
                            className="w-full mt-2 px-3 py-2 rounded-lg text-xs border border-dashed hover:bg-white/5 transition-colors font-medium"
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
        </>
      )}

      {/* VIEW 2: Batch-wise & Student Directory View */}
      {viewMode === "students" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              👥 Resident Students Directory (Batch-wise)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5" style={{ color: "var(--color-text-muted)" }}>
              {filteredStudents.length} residents
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🎓</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No resident students match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left uppercase tracking-wider" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Enrollment No</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Room & Floor</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {filteredStudents.map((item) => (
                    <tr key={item.allocationId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {item.student.name}
                      </td>
                      <td className="py-3 px-4" style={{ color: "var(--color-text-secondary)" }}>
                        {item.student.enrollmentNo || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium">
                          {item.student.batch?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: "var(--color-text-secondary)" }}>
                        {item.student.department?.name || item.student.department?.code || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          Room {item.roomNumber} (Floor {item.floor})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleVacate(item.allocationId)}
                          disabled={vacating === item.allocationId}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          {vacating === item.allocationId ? "..." : "Vacate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
