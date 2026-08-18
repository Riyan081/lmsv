import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import CreateSubjectForm from "./create-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";

export default async function AdminSubjectsPage() {
  const [res, deptRes] = await Promise.all([
    api.get("/api/subjects"),
    api.get("/api/departments"),
  ]);
  const subjects = res.data || [];
  const departments = deptRes.data || [];

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (row: any) => (
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {row.code}
        </span>
      ),
    },
    { key: "name", label: "Subject Name" },
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
      key: "semester",
      label: "Semester",
      render: (row: any) => (
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Sem {row.semester?.number} ({row.semester?.program?.code})
        </span>
      ),
    },
    {
      key: "credits",
      label: "Credits",
      render: (row: any) => (
        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {row.credits}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row: any) => {
        const colors: Record<string, string> = {
          theory: "text-blue-400 bg-blue-500/10",
          practical: "text-orange-400 bg-orange-500/10",
          elective: "text-cyan-400 bg-cyan-500/10",
        };
        return (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${colors[row.type] || ""}`}>
            {row.type}
          </span>
        );
      },
    },
    {
      key: "faculty",
      label: "Faculty",
      render: (row: any) => (
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {row._count?.facultySubjects ?? 0} assigned
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <DeleteRowButton
          url={`http://localhost:3001/api/subjects/${row.id}`}
          label={`subject "${row.name}"`}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Subjects"
        description={`${subjects.length} subjects across all departments.`}
        action={<CreateSubjectForm departments={departments} />}
      />
      <DataTable
        columns={columns}
        data={subjects}
        emptyMessage="No subjects yet. Create your first subject."
        emptyIcon="📖"
      />
    </div>
  );
}
