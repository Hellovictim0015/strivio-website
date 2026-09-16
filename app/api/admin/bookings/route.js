import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

// GET /api/admin/bookings?status=&partnerId=
export async function GET(request) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const partnerId = searchParams.get("partnerId");

  const conditions = [];
  const params = [];
  if (status && ["confirmed", "completed", "cancelled"].includes(status)) {
    conditions.push("b.status = ?");
    params.push(status);
  }
  if (partnerId) {
    conditions.push("b.partner_id = ?");
    params.push(partnerId);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const bookings = await query(
    `SELECT b.id, b.booking_code, b.plan_name, b.persons, b.session_label, b.booking_date, b.status, b.amount, b.created_at,
            u.email AS user_email, u.name AS user_name,
            p.business_name AS partner_name,
            pl.name AS listing_name
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN partners p ON p.id = b.partner_id
     JOIN partner_listings pl ON pl.id = b.listing_id
     ${where}
     ORDER BY b.created_at DESC`,
    params
  );

  return Response.json({ bookings });
}
