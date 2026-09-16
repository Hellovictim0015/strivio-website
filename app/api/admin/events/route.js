import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

// GET /api/admin/events?status=PENDING|APPROVED|REJECTED (omit for all)
export async function GET(request) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const conditions = [];
  const params = [];
  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    conditions.push("e.status = ?");
    params.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const events = await query(
    `SELECT e.*, p.business_name AS partner_name, p.email AS partner_email
     FROM events e
     JOIN partners p ON p.id = e.partner_id
     ${where}
     ORDER BY e.created_at DESC`,
    params
  );

  return Response.json({ events });
}
