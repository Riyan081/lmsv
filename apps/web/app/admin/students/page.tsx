import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import DataTable from "../../../components/ui/data-table";
import CreateUserForm from "./create-form";
import DeleteRowButton from "../../../components/ui/delete-row-button";
import StudentsClient from "./students-client";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams?: { sectionId?: string; batchId?: string; departmentId?: string };
}) {
  // Build query string from filters
  const params = new URLSearchParams();
  params.set("role", "student");
  if (searchParams?.sectionId) params.set("sectionId", searchParams.sectionId);
  if (searchParams?.batchId) params.set("batchId", searchParams.batchId);

  const [res, deptRes, batchRes] = await Promise.all([
    api.get(`/api/users?${params.toString()}`),
    api.get("/api/departments"),
    api.get("/api/batches"),
  ]);

  const students = res.data || [];
  const departments = deptRes.data || [];
  const batches = batchRes.data || [];

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
      label: "Dept",
      render: (row: any) => (
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400">
          {row.department?.code || "—"}
        </span>
      ),
    },
    {
      key: "batch",
      label: "Batch",
      render: (row: any) => (
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {row.batch?.name || "—"}
        </span>
      ),
    },
    {
      key: "section",
      label: "Section",
      render: (row: any) =>
        row.section ? (
          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
            {row.section.name}
          </span>
        ) : (
          <span style={{ color: "var(--color-text-muted)" }}>—</span>
        ),
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
        description={`${students.length} enrolled students${searchParams?.sectionId || searchParams?.batchId ? " (filtered)" : " across all departments"}.`}
        action={
          <CreateUserForm
            role="student"
            departments={departments}
            batches={batches}
          />
        }
      />

      {/* Filter bar */}
      <StudentsClient
        students={students}
        departments={departments}
        batches={batches}
        columns={columns}
        activeSectionId={searchParams?.sectionId}
        activeBatchId={searchParams?.batchId}
        activeDeptId={searchParams?.departmentId}
      />
    </div>
  );
}
