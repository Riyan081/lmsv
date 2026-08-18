import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import StatusBadge from "../../../components/ui/status-badge";
import CreateAnnouncementForm from "./create-form";

export default async function AdminAnnouncementsPage() {
  const res = await api.get("/api/announcements?limit=30");
  const announcements = res.data || [];

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row: any) => (
        <div>
          <div className="flex items-center gap-2">
            {row.isPinned && <span className="text-xs">📌</span>}
            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{row.title}</span>
          </div>
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--color-text-muted)" }}>{row.content}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row: any) => <StatusBadge status={row.type} variant="info" />,
    },
    {
      key: "createdBy",
      label: "Created By",
      render: (row: any) => (
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{row.createdBy?.name || "—"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row: any) => (
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Announcements"
        description="Create and manage announcements for the institution."
        action={<CreateAnnouncementForm />}
      />
      <DataTable columns={columns} data={announcements} emptyMessage="No announcements yet." emptyIcon="📢" />
    </div>
  );
}
