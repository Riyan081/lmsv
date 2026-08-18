import PageHeader from "../../../components/ui/page-header";
import MarkAttendanceForm from "./mark-form";

export default function FacultyAttendancePage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Mark Attendance"
        description="Select a subject and mark today's attendance for your class."
      />
      <MarkAttendanceForm />
    </div>
  );
}
