import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "user");
  if (!auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await queryOne("SELECT id, email, name, status, created_at FROM users WHERE id = ?", [auth.id]);
  if (!user || user.status === "blocked") {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  return Response.json({ user });
}
