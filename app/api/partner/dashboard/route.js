import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "partner");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const [listingCounts, bookingCount, recentBookings] = await Promise.all([
    query(
      `SELECT status, COUNT(*) AS count FROM partner_listings WHERE partner_id = ? GROUP BY status`,
      [auth.id]
    ),
    queryOne(`SELECT COUNT(*) AS count FROM bookings WHERE partner_id = ?`, [auth.id]),
    query(
      `SELECT b.id, b.booking_code, b.plan_name, b.persons, b.session_label, b.booking_date, b.status, b.amount, b.created_at,
              u.email AS user_email, u.name AS user_name, pl.name AS listing_name
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN partner_listings pl ON pl.id = b.listing_id
       WHERE b.partner_id = ?
       ORDER BY b.created_at DESC LIMIT 8`,
      [auth.id]
    ),
  ]);

  const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  let totalListings = 0;
  for (const row of listingCounts) {
    counts[row.status] = row.count;
    totalListings += row.count;
  }

  return Response.json({
    totalListings,
    approvedListings: counts.APPROVED,
    pendingListings: counts.PENDING,
    rejectedListings: counts.REJECTED,
    totalBookings: bookingCount?.count || 0,
    recentBookings,
  });
}
