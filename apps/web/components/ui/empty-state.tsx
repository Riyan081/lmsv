/**
 * Empty state component for pages with no data.
 */
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div
      className="rounded-2xl border p-16 text-center animate-fade-in-up"
      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
