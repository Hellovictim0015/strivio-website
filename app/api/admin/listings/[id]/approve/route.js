import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const listing = await queryOne("SELECT id FROM partner_listings WHERE id = ?", [id]);
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

  await query("UPDATE partner_listings SET status = 'APPROVED', rejection_reason = NULL WHERE id = ?", [id]);
  const updated = await queryOne("SELECT * FROM partner_listings WHERE id = ?", [id]);
  return Response.json({ listing: updated });
}
