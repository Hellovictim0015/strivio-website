import { queryOne } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Event not found" }, { status: 404 });

  const event = await queryOne(
    `SELECT e.id, e.name, e.description, e.image, e.price, e.capacity_type, e.total_slots, e.booked_slots,
            e.location, e.latitude, e.longitude, e.event_time,
            p.id AS partner_id, p.business_name AS partner_name, p.phone AS partner_phone
     FROM events e
     JOIN partners p ON p.id = e.partner_id
     WHERE e.id = ? AND e.status = 'APPROVED' AND e.is_active = 1 AND p.status = 'active'`,
    [id]
  );

  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });
  return Response.json({ event });
}
