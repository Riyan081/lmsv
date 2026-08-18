import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import StatusBadge from "../../../components/ui/status-badge";

export default async function AdminExamsPage() {
  const res = await api.get("/api/exams?limit=30");
  const exams = res.data || [];

  const columns = [
    {
      key: "name",
      label: "Exam Name",
      render: (row: any) => (
        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{row.name}</span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (row: any) => (
        <div>
          <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{row.subject?.name}</span>
          <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-white/5" style={{ color: "var(--color-text-muted)" }}>
            {row.subject?.code}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row: any) => <StatusBadge status={row.type} variant="info" />,
    },
    {
      key: "totalMarks",
      label: "Total Marks",
      render: (row: any) => (
        <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{row.totalMarks}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (row: any) => (
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {new Date(row.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "_count",
      label: "Results",
      render: (row: any) => (
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {row._count?.results ?? 0} entered
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Exams" description="View and manage all examinations." />
      <DataTable columns={columns} data={exams} emptyMessage="No exams created yet." emptyIcon="📝" />
    </div>
  );
}
