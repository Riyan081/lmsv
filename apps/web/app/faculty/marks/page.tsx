import PageHeader from "../../../components/ui/page-header";
import EnterMarksForm from "./enter-form";

export default function FacultyMarksPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Exams & Marks"
        description="Create exams and enter marks for your subjects."
      />
      <EnterMarksForm />
    </div>
  );
}
