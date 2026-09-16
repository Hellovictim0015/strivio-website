import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { queryOne } from "@/lib/db";

// Used by the confirmation page and the user's QR pass — owner-only.
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "user");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const booking = await queryOne(
    `SELECT b.*, pl.name AS listing_name, pl.address, pl.city, pl.phone, pl.images, c.name AS category_name,
            p.business_name AS partner_name
     FROM bookings b
     JOIN partner_listings pl ON pl.id = b.listing_id
     JOIN categories c ON c.id = pl.category_id
     JOIN partners p ON p.id = b.partner_id
     WHERE b.id = ?`,
    [id]
  );

  if (!booking || booking.user_id !== auth.id) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  booking.images = Array.isArray(booking.images) ? booking.images : JSON.parse(booking.images || "[]");
  return Response.json({ booking });
}
