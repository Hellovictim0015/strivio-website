import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  if (!auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = await queryOne("SELECT id, email, name FROM admins WHERE id = ?", [auth.id]);
  if (!admin) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  return Response.json({ admin });
}
