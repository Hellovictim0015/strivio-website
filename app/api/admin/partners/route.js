import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const partners = await query(
    `SELECT p.id, p.name, p.business_name, p.email, p.phone, p.city, p.status, p.created_at,
            (SELECT COUNT(*) FROM partner_listings pl WHERE pl.partner_id = p.id) AS listing_count,
            (SELECT COUNT(*) FROM bookings b WHERE b.partner_id = p.id) AS booking_count,
            (SELECT COALESCE(SUM(amount), 0) FROM bookings b WHERE b.partner_id = p.id AND b.status != 'cancelled') AS revenue
     FROM partners p
     ORDER BY p.created_at DESC`
  );

  return Response.json({ partners });
}
