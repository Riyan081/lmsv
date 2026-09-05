import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import CreateBatchForm from "./create-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";

export default async function AdminBatchesPage() {
  const [res, programRes] = await Promise.all([
    api.get("/api/batches"),
    api.get("/api/programs"),
  ]);
  const batches = res.data || [];
  const programs = programRes.data || [];

  const columns = [
    {
      key: "name",
      label: "Batch",
      render: (row: any) => (
        <div>
          <div className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{row.name}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: "var(--color-text-muted)" }}>{row.id}</div>
        </div>
      ),
    },
    {
      key: "program",
      label: "Program",
      render: (row: any) => (
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
          {row.program?.code || "—"}
        </span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (row: any) => (
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400">
          {row.program?.department?.code || "—"}
        </span>
      ),
    },
    {
      key: "years",
      label: "Years",
      render: (row: any) => `${row.startYear} — ${row.endYear}`,
    },
    {
      key: "sections",
      label: "Sections",
      render: (row: any) => {
        const sectionNames = row.sections?.map((s: any) => s.name).join(", ");
        return (
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {sectionNames || <span style={{ color: "var(--color-text-muted)" }}>—</span>}
          </span>
        );
      },
    },
    {
      key: "students",
      label: "Students",
      render: (row: any) => (
        <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {row._count?.students ?? 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <DeleteRowButton
          url={`http://localhost:3001/api/batches/${row.id}`}
          label={`batch "${row.name}"`}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Batches"
        description={`${batches.length} batches across all programs.`}
        action={<CreateBatchForm programs={programs} batches={batches} />}
      />
      <DataTable
        columns={columns}
        data={batches}
        emptyMessage="No batches yet. Create your first batch."
        emptyIcon="👥"
      />
    </div>
  );
}
