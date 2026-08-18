import { api } from "../../../lib/api";
import PageHeader from "../../../components/ui/page-header";
import WardenRoomsClient from "./rooms-client";

export default async function WardenRoomsPage() {
  const hostelsRes = await api.get("/api/hostel");
  const hostels: any[] = hostelsRes.data || [];

  // Fetch rooms for each hostel
  const hostelsWithRooms = await Promise.all(
    hostels.map(async (h: any) => {
      const roomsRes = await api.get(`/api/hostel/${h.id}/rooms`);
      return { ...h, rooms: roomsRes.data || [] };
    })
  );

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Room Management"
        description="View and manage hostel rooms and student allocations."
      />
      <WardenRoomsClient hostels={hostelsWithRooms} />
    </div>
  );
}
