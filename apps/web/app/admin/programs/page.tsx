import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import CreateProgramForm from "./create-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";

export default async function AdminProgramsPage() {
  const [res, deptRes] = await Promise.all([
    api.get("/api/programs"),
    api.get("/api/departments"),
  ]);
  const programs = res.data || [];
  const departments = deptRes.data || [];

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (row: any) => (
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {row.code}
        </span>
      ),
    },
    { key: "name", label: "Program Name" },
    {
      key: "department",
      label: "Department",
      render: (row: any) => (
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400">
          {row.department?.code || "—"}
        </span>
      ),
    },
    {
      key: "durationYears",
      label: "Duration",
      render: (row: any) => `${row.durationYears} years (${row.totalSemesters} sem)`,
    },
    {
      key: "batches",
      label: "Batches",
      render: (row: any) => row._count?.batches ?? 0,
    },
    {
      key: "semesters",
      label: "Semesters",
      render: (row: any) => row._count?.semesters ?? 0,
    },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <DeleteRowButton
          url={`http://localhost:3001/api/programs/${row.id}`}
          label={`program "${row.name}"`}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Programs"
        description={`${programs.length} academic programs across all departments.`}
        action={<CreateProgramForm departments={departments} />}
      />
      <DataTable
        columns={columns}
        data={programs}
        emptyMessage="No programs yet. Create your first program."
        emptyIcon="📚"
      />
    </div>
  );
}
