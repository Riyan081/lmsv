import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import TimetableGrid from "./timetable-grid";

export default async function AdminTimetablePage() {
  const [slotsRes, batchesRes, programsRes] = await Promise.all([
    api.get("/api/timetable"),
    api.get("/api/batches"),
    api.get("/api/programs"),
  ]);

  const slots: any[] = slotsRes.data || [];
  const batches: any[] = batchesRes.data || [];
  const programs: any[] = programsRes.data || [];

  // Collect all semesters from programs
  const semesters: { id: string; label: string; programCode: string }[] = [];
  for (const p of programs) {
    for (const sem of p.semesters || []) {
      semesters.push({
        id: sem.id,
        label: `Sem ${sem.number} — ${p.code} (${p.name})`,
        programCode: p.code,
      });
    }
  }

  // Extract all unique sections from batches
  const sections: { id: string; label: string; programCode: string }[] = [];
  batches.forEach((b: any) => {
    (b.sections || []).forEach((s: any) => {
      sections.push({
        id: s.id,
        label: `${b.program?.code || ""} ${b.name} — Sec ${s.name}`,
        programCode: b.program?.code || "",
      });
    });
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Timetable"
        description="Weekly class schedule — assign lectures by section, faculty, and room."
      />
      <TimetableGrid slots={slots} sections={sections} semesters={semesters} />
    </div>
  );
}
