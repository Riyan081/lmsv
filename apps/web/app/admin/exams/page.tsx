import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import StatusBadge from "../../../components/ui/status-badge";
import CreateExamForm from "./create-exam-form";
import EnterMarksForm from "./enter-marks-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";

export default async function AdminExamsPage() {
  const [res, subjectsRes] = await Promise.all([
    api.get("/api/exams?limit=100"),
    api.get("/api/subjects"),
  ]);
  const exams = res.data || [];
  const subjects = subjectsRes.data || [];

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
          {new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "_count",
      label: "Results",
      render: (row: any) => (
        <span className={`text-sm font-medium ${row._count?.results > 0 ? "text-emerald-400" : ""}`} style={row._count?.results === 0 ? { color: "var(--color-text-muted)" } : {}}>
          {row._count?.results ?? 0} entered
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <EnterMarksForm exam={row} />
          <DeleteRowButton
            url={`http://localhost:3001/api/exams/${row.id}`}
            label={`exam "${row.name}"`}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Exams"
        description={`${exams.length} exam${exams.length !== 1 ? "s" : ""} — create exams and enter student marks.`}
        action={<CreateExamForm subjects={subjects} />}
      />
      <DataTable
        columns={columns}
        data={exams}
        emptyMessage="No exams created yet. Create your first exam."
        emptyIcon="📝"
      />
    </div>
  );
}
