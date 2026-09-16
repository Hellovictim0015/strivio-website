import { query } from "@/lib/db";

// Public: only APPROVED + active events from active partners, soonest first.
export async function GET() {
  const events = await query(
    `SELECT e.id, e.name, e.description, e.image, e.price, e.capacity_type, e.total_slots, e.booked_slots,
            e.location, e.latitude, e.longitude, e.event_time,
            p.business_name AS partner_name
     FROM events e
     JOIN partners p ON p.id = e.partner_id
     WHERE e.status = 'APPROVED' AND e.is_active = 1 AND p.status = 'active' AND e.event_time >= NOW()
     ORDER BY e.event_time ASC`
  );
  return Response.json({ events });
}
