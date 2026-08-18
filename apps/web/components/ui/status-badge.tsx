/**
 * Status badge component for displaying status labels with colors.
 */
type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

const VARIANT_MAP: Record<StatusVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  neutral: "bg-white/5 text-gray-400 border-white/10",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

/** Auto-detect variant from common status strings */
function detectVariant(status: string): StatusVariant {
  const lower = status.toLowerCase();
  if (["present", "approved", "active", "resolved", "success", "completed"].includes(lower)) return "success";
  if (["pending", "late", "in_progress", "open"].includes(lower)) return "warning";
  if (["absent", "rejected", "banned", "failed"].includes(lower)) return "danger";
  if (["admin", "premium"].includes(lower)) return "purple";
  return "neutral";
}

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  const v = variant || detectVariant(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${VARIANT_MAP[v]}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
