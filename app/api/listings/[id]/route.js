import { query, queryOne } from "@/lib/db";

// Public detail endpoint. Also used by the QR-code landing page
// (/public/listing/[id]) which requires no login.
export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Listing not found" }, { status: 404 });

  const listing = await queryOne(
    `SELECT pl.id, pl.name, pl.description, pl.price, pl.price_period, pl.address, pl.city, pl.phone,
            pl.opening_time, pl.closing_time, pl.services, pl.images, pl.created_at,
            c.id AS category_id, c.name AS category_name,
            p.id AS partner_id, p.business_name AS partner_name
     FROM partner_listings pl
     JOIN categories c ON c.id = pl.category_id
     JOIN partners p ON p.id = pl.partner_id
     WHERE pl.id = ? AND pl.status = 'APPROVED' AND pl.is_active = 1 AND p.status = 'active'`,
    [id]
  );

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  listing.images = Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || "[]");
  listing.plans = await query("SELECT id, period, price, persons, label FROM listing_plans WHERE listing_id = ? ORDER BY price ASC", [id]);
  listing.sessions = await query(
    "SELECT id, label, start_time, end_time FROM partner_sessions WHERE partner_id = ? ORDER BY sort_order ASC, id ASC",
    [listing.partner_id]
  );
  return Response.json({ listing });
}
