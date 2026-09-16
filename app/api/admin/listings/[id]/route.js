import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const listing = await queryOne(
    `SELECT pl.*, c.name AS category_name, p.business_name AS partner_name, p.email AS partner_email, p.phone AS partner_phone
     FROM partner_listings pl
     JOIN categories c ON c.id = pl.category_id
     JOIN partners p ON p.id = pl.partner_id
     WHERE pl.id = ?`,
    [id]
  );
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

  listing.images = Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || "[]");
  return Response.json({ listing });
}
