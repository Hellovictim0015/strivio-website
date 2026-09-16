import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "user");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const registrations = await query(
    `SELECT r.id, r.registration_code, r.status, r.checked_in_at, r.created_at,
            e.id AS event_id, e.name AS event_name, e.image, e.location, e.event_time,
            p.business_name AS partner_name
     FROM event_registrations r
     JOIN events e ON e.id = r.event_id
     JOIN partners p ON p.id = e.partner_id
     WHERE r.user_id = ?
     ORDER BY e.event_time DESC`,
    [auth.id]
  );

  return Response.json({ registrations });
}
