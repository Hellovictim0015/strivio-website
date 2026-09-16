import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

// GET /api/admin/listings?status=PENDING|APPROVED|REJECTED (omit for all)
export async function GET(request) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const conditions = [];
  const params = [];
  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    conditions.push("pl.status = ?");
    params.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const listings = await query(
    `SELECT pl.id, pl.name, pl.price, pl.price_period, pl.city, pl.status, pl.is_active, pl.images,
            pl.created_at, pl.rejection_reason,
            c.name AS category_name,
            p.id AS partner_id, p.business_name AS partner_name, p.email AS partner_email
     FROM partner_listings pl
     JOIN categories c ON c.id = pl.category_id
     JOIN partners p ON p.id = pl.partner_id
     ${where}
     ORDER BY pl.created_at DESC`,
    params
  );

  const parsed = listings.map((l) => ({ ...l, images: Array.isArray(l.images) ? l.images : JSON.parse(l.images || "[]") }));
  return Response.json({ listings: parsed });
}
