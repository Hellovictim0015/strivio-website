import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

// Block/unblock a user account.
export async function PATCH(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const user = await queryOne("SELECT id FROM users WHERE id = ?", [id]);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  if (!["active", "blocked"].includes(body.status)) {
    return Response.json({ error: "status must be 'active' or 'blocked'" }, { status: 400 });
  }

  await query("UPDATE users SET status = ? WHERE id = ?", [body.status, id]);
  const updated = await queryOne("SELECT id, email, name, status FROM users WHERE id = ?", [id]);
  return Response.json({ user: updated });
}
