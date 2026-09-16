import { query } from "@/lib/db";

// Public: only APPROVED + active listings are ever returned to normal users.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category");
  const city = searchParams.get("city");
  const search = searchParams.get("q");

  const conditions = ["pl.status = 'APPROVED'", "pl.is_active = 1", "p.status = 'active'"];
  const params = [];

  if (categoryId) {
    conditions.push("pl.category_id = ?");
    params.push(categoryId);
  }
  if (city) {
    conditions.push("pl.city LIKE ?");
    params.push(`%${city}%`);
  }
  if (search) {
    conditions.push("(pl.name LIKE ? OR pl.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const listings = await query(
    `SELECT pl.id, pl.name, pl.description, pl.price, pl.price_period, pl.address, pl.city, pl.phone,
            pl.opening_time, pl.closing_time, pl.images, pl.created_at,
            c.id AS category_id, c.name AS category_name,
            p.business_name AS partner_name
     FROM partner_listings pl
     JOIN categories c ON c.id = pl.category_id
     JOIN partners p ON p.id = pl.partner_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY pl.created_at DESC`,
    params
  );

  const parsed = listings.map((l) => ({ ...l, images: safeParseImages(l.images) }));
  return Response.json({ listings: parsed });
}

function safeParseImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}
