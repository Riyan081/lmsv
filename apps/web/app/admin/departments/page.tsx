import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import CreateDepartmentForm from "./create-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";

export default async function DepartmentsPage() {
  const res = await api.get("/api/departments");
  const departments = res.data || [];

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (row: any) => (
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          {row.code}
        </span>
      ),
    },
    { key: "name", label: "Department Name" },
    {
      key: "description",
      label: "Description",
      render: (row: any) => (
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "_count",
      label: "Programs",
      render: (row: any) => row._count?.programs ?? 0,
    },
    {
      key: "users",
      label: "Members",
      render: (row: any) => row._count?.users ?? 0,
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (row: any) => row._count?.subjects ?? 0,
    },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <DeleteRowButton
          url={`http://localhost:3001/api/departments/${row.id}`}
          label={`department "${row.name}"`}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Departments"
        description="Manage academic departments in your institution."
        action={<CreateDepartmentForm />}
      />

      <DataTable
        columns={columns}
        data={departments}
        emptyMessage="No departments yet. Create your first department to get started."
        emptyIcon="🏛️"
      />
    </div>
  );
}
