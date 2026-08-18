import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import ActivityLogClient from "./activity-log-client";

export default async function ActivityLogPage() {
  const [logsRes, statsRes] = await Promise.all([
    api.get("/api/activity-log?limit=200"),
    api.get("/api/activity-log/stats"),
  ]);

  // api.get() returns the raw JSON body: { success, data: ActivityLog[], pagination }
  // For stats (sendSuccess): { success, data: statsObject }
  const logs: any[] = Array.isArray(logsRes.data) ? logsRes.data : [];
  const stats = statsRes.data;

  return (
    <div>
      <PageHeader
        title="Activity Log"
        description="Monitor all platform activity, filter by module or action, and audit user behaviour in real time."
      />
      <ActivityLogClient logs={logs} stats={stats} />
    </div>
  );
}
