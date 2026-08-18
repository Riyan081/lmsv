import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import CreateUserForm from "./create-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";

export default async function AdminStudentsPage() {
  const res = await api.get("/api/users?role=student");
  const students = res.data || [];

  const [deptRes, batchRes] = await Promise.all([
    api.get("/api/departments"),
    api.get("/api/batches?includeSections=true"),
  ]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row: any) => (
        <div>
          <div className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{row.name}</div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: "enrollmentNo",
      label: "Enrollment",
      render: (row: any) => (
        <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
          {row.enrollmentNo || "—"}
        </span>
      ),
    },
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
      key: "batch",
      label: "Batch",
      render: (row: any) => row.batch?.name || "—",
    },
    {
      key: "section",
      label: "Section",
      render: (row: any) => row.section?.name || "—",
    },
    {
      key: "gender",
      label: "Gender",
      render: (row: any) => (
        <span className="text-xs capitalize" style={{ color: "var(--color-text-secondary)" }}>
          {row.gender || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row: any) => (
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {row.phone || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <DeleteRowButton
          url={`http://localhost:3001/api/users/${row.id}`}
          label={`student "${row.name}"`}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Students"
        description={`${students.length} enrolled students across all departments.`}
        action={
          <CreateUserForm
            role="student"
            departments={deptRes.data || []}
            batches={batchRes.data || []}
          />
        }
      />
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students yet. Add your first student."
        emptyIcon="🎓"
      />
    </div>
  );
}
