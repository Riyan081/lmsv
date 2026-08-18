/**
 * Reusable stat card for dashboards.
 * Shows a metric with icon, value, label, and optional trend indicator.
 */
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color?: "purple" | "blue" | "green" | "red" | "amber" | "cyan";
}

const COLOR_MAP = {
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  green: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
};

export default function StatCard({ icon, label, value, trend, color = "purple" }: StatCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div
      className="rounded-2xl p-5 border backdrop-blur-xl transition-all duration-200 hover:border-white/[0.12]"
      style={{
        background: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center text-lg`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
