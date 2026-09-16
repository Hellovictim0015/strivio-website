import QRCode from "qrcode";
import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { queryOne } from "@/lib/db";

// Renders a PNG QR code encoding this booking's code, for the owning user to show
// at check-in. The partner scanner reads this same code via /api/partner/bookings/checkin.
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "user");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const booking = await queryOne("SELECT id, user_id, booking_code FROM bookings WHERE id = ?", [id]);
  if (!booking || booking.user_id !== auth.id) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  const buffer = await QRCode.toBuffer(booking.booking_code, { type: "png", margin: 1, width: 512 });
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}
