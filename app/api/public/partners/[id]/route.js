import { query, queryOne } from "@/lib/db";

// Public: the partner's business profile + all their APPROVED, active listings.
// This is what a "Business QR Code" scan lands on — full center info and every
// listing that business currently offers, in one place. No login required.
export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Not found" }, { status: 404 });

  const partner = await queryOne(
    `SELECT id, business_name, name, phone, address, city, description
     FROM partners WHERE id = ? AND status = 'active'`,
    [id]
  );
  if (!partner) {
    return Response.json({ error: "This business is not available" }, { status: 404 });
  }

  const listings = await query(
    `SELECT pl.id, pl.name, pl.description, pl.price, pl.price_period, pl.images,
            c.name AS category_name
     FROM partner_listings pl
     JOIN categories c ON c.id = pl.category_id
     WHERE pl.partner_id = ? AND pl.status = 'APPROVED' AND pl.is_active = 1
     ORDER BY pl.created_at DESC`,
    [id]
  );

  const parsedListings = listings.map((l) => ({
    ...l,
    images: Array.isArray(l.images) ? l.images : JSON.parse(l.images || "[]"),
  }));

  return Response.json({ partner, listings: parsedListings });
}
