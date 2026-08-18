import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import TimetableGrid from "./timetable-grid";

export default async function AdminTimetablePage() {
  const [slotsRes, batchesRes] = await Promise.all([
    api.get("/api/timetable"),
    api.get("/api/batches"),
  ]);

  const slots: any[] = slotsRes.data || [];
  const batches: any[] = batchesRes.data || [];

  // Extract all unique sections from batches
  const sections: { id: string; label: string }[] = [];
  batches.forEach((b: any) => {
    (b.sections || []).forEach((s: any) => {
      sections.push({
        id: s.id,
        label: `${b.program?.code || ""} ${b.name} — Sec ${s.name}`,
      });
    });
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Timetable"
        description="Weekly class schedule — assign lectures by section, faculty, and room."
      />
      <TimetableGrid slots={slots} sections={sections} />
    </div>
  );
}
