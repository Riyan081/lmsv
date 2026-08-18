"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../lib/api-base";

interface DeleteRowButtonProps {
  /** Full API URL to DELETE, e.g. "http://localhost:3001/api/departments/abc123" */
  url: string;
  /** Confirmation message shown before delete */
  label?: string;
}

/**
 * Reusable inline delete button for admin data tables.
 * On click shows confirm dialog → calls DELETE API → refreshes page.
 */
export default function DeleteRowButton({ url, label = "this item" }: DeleteRowButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${label}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${url.replace(API_BASE, "")}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
