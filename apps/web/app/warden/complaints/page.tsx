import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import ComplaintsClient from "./complaints-client";

export default async function WardenComplaintsPage() {
  const res = await api.get("/api/hostel/complaints?limit=50");
  const complaints: any[] = res.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Hostel Complaints"
        description="Review and resolve student complaints about rooms and facilities."
      />
      <ComplaintsClient complaints={complaints} />
    </div>
  );
}
