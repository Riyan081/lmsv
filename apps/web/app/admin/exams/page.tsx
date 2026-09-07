import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import CreateExamForm from "./create-exam-form";
import AdminExamsClient from "./exams-client";

export default async function AdminExamsPage() {
  const [res, subjectsRes] = await Promise.all([
    api.get("/api/exams?limit=100"),
    api.get("/api/subjects"),
  ]);
  const exams = res.data || [];
  const subjects = subjectsRes.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Exams"
        description={`${exams.length} exam${exams.length !== 1 ? "s" : ""} — create exams and enter student marks.`}
        action={<CreateExamForm subjects={subjects} />}
      />
      <AdminExamsClient exams={exams} />
    </div>
  );
}
