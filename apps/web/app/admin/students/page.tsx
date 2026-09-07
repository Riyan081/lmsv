import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import CreateUserForm from "./create-form";
import StudentsClient from "./students-client";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ sectionId?: string; batchId?: string; departmentId?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};

  // Build query string from filters
  const params = new URLSearchParams();
  params.set("role", "student");
  if (sp.sectionId) params.set("sectionId", sp.sectionId);
  if (sp.batchId) params.set("batchId", sp.batchId);

  const [res, deptRes, batchRes] = await Promise.all([
    api.get(`/api/users?${params.toString()}`),
    api.get("/api/departments"),
    api.get("/api/batches"),
  ]);

  const students = res.data || [];
  const departments = deptRes.data || [];
  const batches = batchRes.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Students"
        description={`${students.length} enrolled students${sp.sectionId || sp.batchId ? " (filtered)" : " across all departments"}.`}
        action={
          <CreateUserForm
            role="student"
            departments={departments}
            batches={batches}
          />
        }
      />

      {/* Filter bar and grouped student list */}
      <StudentsClient
        students={students}
        departments={departments}
        batches={batches}
        activeSectionId={sp.sectionId}
        activeBatchId={sp.batchId}
        activeDeptId={sp.departmentId}
      />
    </div>
  );
}
