import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.user);
  return Response.json({ message: "Logged out" });
}
