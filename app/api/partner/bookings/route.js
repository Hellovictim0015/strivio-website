import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "partner");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const bookings = await query(
    `SELECT b.id, b.booking_code, b.plan_name, b.persons, b.session_label, b.booking_date, b.status, b.amount,
            b.checked_in_at, b.created_at,
            u.email AS user_email, u.name AS user_name,
            pl.id AS listing_id, pl.name AS listing_name
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN partner_listings pl ON pl.id = b.listing_id
     WHERE b.partner_id = ?
     ORDER BY b.booking_date DESC, b.created_at DESC`,
    [auth.id]
  );

  return Response.json({ bookings });
}
