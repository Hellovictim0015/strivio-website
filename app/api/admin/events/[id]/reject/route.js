import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const event = await queryOne("SELECT id FROM events WHERE id = ?", [id]);
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const reason = body.reason?.toString().trim() || null;

  await query("UPDATE events SET status = 'REJECTED', rejection_reason = ? WHERE id = ?", [reason, id]);
  const updated = await queryOne("SELECT * FROM events WHERE id = ?", [id]);
  return Response.json({ event: updated });
}
