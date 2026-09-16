import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const partner = await queryOne(
    "SELECT id, name, business_name, email, phone, address, city, description, status, created_at FROM partners WHERE id = ?",
    [id]
  );
  if (!partner) return Response.json({ error: "Partner not found" }, { status: 404 });

  const listings = await query(
    `SELECT pl.id, pl.name, pl.status, pl.price, pl.is_active, pl.created_at, c.name AS category_name
     FROM partner_listings pl JOIN categories c ON c.id = pl.category_id
     WHERE pl.partner_id = ? ORDER BY pl.created_at DESC`,
    [id]
  );

  return Response.json({ partner, listings });
}

// Enable/disable a partner account.
export async function PATCH(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const partner = await queryOne("SELECT id FROM partners WHERE id = ?", [id]);
  if (!partner) return Response.json({ error: "Partner not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  if (!["active", "disabled"].includes(body.status)) {
    return Response.json({ error: "status must be 'active' or 'disabled'" }, { status: 400 });
  }

  await query("UPDATE partners SET status = ? WHERE id = ?", [body.status, id]);
  const updated = await queryOne(
    "SELECT id, name, business_name, email, status FROM partners WHERE id = ?",
    [id]
  );
  return Response.json({ partner: updated });
}
