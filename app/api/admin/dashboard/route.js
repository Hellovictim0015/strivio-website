import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const [totals, listingStatus, bookingsByDay, revenueByMonth] = await Promise.all([
    queryOne(
      `SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM partners) AS total_partners,
        (SELECT COUNT(*) FROM partner_listings) AS total_listings,
        (SELECT COUNT(*) FROM bookings) AS total_bookings`
    ),
    query(`SELECT status, COUNT(*) AS count FROM partner_listings GROUP BY status`),
    query(
      `SELECT DATE(booking_date) AS day, COUNT(*) AS count
       FROM bookings WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(booking_date) ORDER BY day ASC`
    ),
    query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COALESCE(SUM(amount), 0) AS revenue
       FROM bookings WHERE status != 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`
    ),
  ]);

  const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const row of listingStatus) statusCounts[row.status] = row.count;

  return Response.json({
    totalUsers: totals.total_users,
    totalPartners: totals.total_partners,
    totalListings: totals.total_listings,
    pendingListings: statusCounts.PENDING,
    approvedListings: statusCounts.APPROVED,
    rejectedListings: statusCounts.REJECTED,
    totalBookings: totals.total_bookings,
    bookingsByDay,
    revenueByMonth,
  });
}
