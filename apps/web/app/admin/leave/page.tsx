import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import AdminLeaveClient from "./leave-client";

export default async function AdminLeavePage() {
  const res = await api.get("/api/leave?limit=100");
  const leaves = res.data?.records || res.data || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Leave Management"
        description="Review and manage leave applications from students and faculty."
      />
      <AdminLeaveClient leaves={leaves} />
    </div>
  );
}
