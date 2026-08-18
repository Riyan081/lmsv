/**
 * Reusable page header with title, description, and optional action button.
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
