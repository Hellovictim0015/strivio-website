import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const users = await query(
    `SELECT u.id, u.email, u.name, u.status, u.created_at,
            (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) AS booking_count
     FROM users u
     ORDER BY u.created_at DESC`
  );

  return Response.json({ users });
}
