import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import GatePassClient from "./gate-pass-client";

export default async function WardenGatePassPage() {
  const res = await api.get("/api/hostel/gate-pass?limit=50");
  const passes: any[] = res.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Gate Pass Requests"
        description="Approve or reject student gate pass requests."
      />
      <GatePassClient passes={passes} />
    </div>
  );
}
