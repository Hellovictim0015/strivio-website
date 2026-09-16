import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

// Used by the partner QR/booking scanner to check a user in for their booking.
export async function POST(request) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "partner");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const code = body.code?.toString().trim().toUpperCase();
  if (!code) return Response.json({ error: "Booking code is required" }, { status: 400 });

  const booking = await queryOne(
    `SELECT b.*, u.name AS user_name, u.email AS user_email, pl.name AS listing_name
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN partner_listings pl ON pl.id = b.listing_id
     WHERE b.booking_code = ?`,
    [code]
  );

  if (!booking || booking.partner_id !== auth.id) {
    return Response.json({ error: "Booking not found for your centers" }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return Response.json({ error: "This booking was cancelled" }, { status: 409 });
  }
  if (booking.checked_in_at) {
    return Response.json({ error: "This booking has already been checked in", booking }, { status: 409 });
  }

  await query("UPDATE bookings SET checked_in_at = NOW(), status = 'completed' WHERE id = ?", [booking.id]);
  const updated = await queryOne(
    `SELECT b.*, u.name AS user_name, u.email AS user_email, pl.name AS listing_name
     FROM bookings b JOIN users u ON u.id = b.user_id JOIN partner_listings pl ON pl.id = b.listing_id
     WHERE b.id = ?`,
    [booking.id]
  );

  return Response.json({ booking: updated });
}
