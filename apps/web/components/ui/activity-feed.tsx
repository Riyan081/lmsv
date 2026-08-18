/**
 * Activity feed component for displaying recent platform activity.
 */
interface ActivityItem {
  id: string;
  description: string;
  action: string;
  module: string;
  createdAt: string;
  user?: { name: string; role: string } | null;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

const ACTION_ICONS: Record<string, string> = {
  create: "➕",
  update: "✏️",
  delete: "🗑️",
  approve: "✅",
  reject: "❌",
  login: "🔑",
  logout: "🚪",
};

const MODULE_COLORS: Record<string, string> = {
  auth: "text-blue-400",
  department: "text-purple-400",
  attendance: "text-emerald-400",
  leave: "text-amber-400",
  exam: "text-cyan-400",
  hostel: "text-pink-400",
  announcement: "text-orange-400",
  calendar: "text-indigo-400",
  timetable: "text-teal-400",
  system: "text-gray-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ items, maxItems = 20 }: ActivityFeedProps) {
  const displayed = items.slice(0, maxItems);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Recent Activity
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {displayed.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No activity yet
            </p>
          </div>
        ) : (
          displayed.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3 flex items-start gap-3 transition-colors duration-100 hover:bg-white/[0.02]"
            >
              <span className="text-base mt-0.5 shrink-0">
                {ACTION_ICONS[item.action] || "📌"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: "var(--color-text-primary)" }}>
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item.user && (
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {item.user.name}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${MODULE_COLORS[item.module] || "text-gray-400"}`}>
                    {item.module}
                  </span>
                </div>
              </div>
              <span className="text-[11px] shrink-0 mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {timeAgo(item.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
