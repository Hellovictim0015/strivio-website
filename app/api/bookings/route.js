import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { planDisplayName } from "@/lib/plans";

function generateBookingCode() {
  const digits = String(Math.floor(10000 + Math.random() * 90000));
  return `STR-${digits}`;
}

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "user");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const bookings = await query(
    `SELECT b.id, b.booking_code, b.plan_name, b.persons, b.session_label, b.booking_date, b.status, b.amount, b.created_at,
            pl.id AS listing_id, pl.name AS listing_name, pl.city, pl.images,
            c.name AS category_name
     FROM bookings b
     JOIN partner_listings pl ON pl.id = b.listing_id
     JOIN categories c ON c.id = pl.category_id
     WHERE b.user_id = ?
     ORDER BY b.booking_date DESC, b.created_at DESC`,
    [auth.id]
  );

  const parsed = bookings.map((b) => ({ ...b, images: Array.isArray(b.images) ? b.images : JSON.parse(b.images || "[]") }));
  return Response.json({ bookings: parsed });
}

export async function POST(request) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "user");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const listingId = Number(body.listingId);
  const planId = Number(body.planId);
  const sessionLabel = body.sessionLabel?.toString().trim() || null;
  const bookingDate = body.bookingDate?.toString().trim();

  if (!Number.isFinite(listingId) || !Number.isFinite(planId) || !bookingDate || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
    return Response.json({ error: "listingId, planId and a valid bookingDate (YYYY-MM-DD) are required" }, { status: 400 });
  }

  const listing = await queryOne(
    `SELECT pl.id, pl.partner_id FROM partner_listings pl
     JOIN partners p ON p.id = pl.partner_id
     WHERE pl.id = ? AND pl.status = 'APPROVED' AND pl.is_active = 1 AND p.status = 'active'`,
    [listingId]
  );
  if (!listing) {
    return Response.json({ error: "This listing is not available for booking" }, { status: 404 });
  }

  const plan = await queryOne("SELECT * FROM listing_plans WHERE id = ? AND listing_id = ?", [planId, listingId]);
  if (!plan) {
    return Response.json({ error: "Selected plan is not available for this listing" }, { status: 400 });
  }

  let bookingCode = generateBookingCode();
  for (let i = 0; i < 5; i++) {
    const clash = await queryOne("SELECT id FROM bookings WHERE booking_code = ?", [bookingCode]);
    if (!clash) break;
    bookingCode = generateBookingCode();
  }

  const result = await query(
    `INSERT INTO bookings (booking_code, user_id, partner_id, listing_id, plan_id, plan_name, persons, session_label, booking_date, amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
    [bookingCode, auth.id, listing.partner_id, listingId, plan.id, planDisplayName(plan), plan.persons, sessionLabel, bookingDate, plan.price]
  );

  const booking = await queryOne(
    `SELECT b.*, pl.name AS listing_name, pl.city, pl.images, c.name AS category_name
     FROM bookings b
     JOIN partner_listings pl ON pl.id = b.listing_id
     JOIN categories c ON c.id = pl.category_id
     WHERE b.id = ?`,
    [result.insertId]
  );
  booking.images = Array.isArray(booking.images) ? booking.images : JSON.parse(booking.images || "[]");

  return Response.json({ booking }, { status: 201 });
}
