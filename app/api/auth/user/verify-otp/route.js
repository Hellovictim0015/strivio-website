import { cookies } from "next/headers";
import { verifyOtp } from "@/lib/otp";
import { signToken, cookieOptions, COOKIE_NAMES } from "@/lib/auth";
import { isValidEmail, isValidOtp } from "@/lib/validate";
import { query, queryOne } from "@/lib/db";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, otp } = body || {};
  if (!isValidEmail(email) || !isValidOtp(otp)) {
    return Response.json({ error: "Please provide a valid email and 6-digit OTP" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const result = await verifyOtp(normalizedEmail, "user_login", otp);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  let user = await queryOne("SELECT id, email, name, status FROM users WHERE email = ?", [normalizedEmail]);
  if (!user) {
    const insertResult = await query("INSERT INTO users (email) VALUES (?)", [normalizedEmail]);
    user = { id: insertResult.insertId, email: normalizedEmail, name: null, status: "active" };
  }

  if (user.status === "blocked") {
    return Response.json({ error: "This account has been blocked. Contact support." }, { status: 403 });
  }

  const token = await signToken({ role: "user", id: user.id, email: user.email, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.user, token, cookieOptions("user"));

  return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
}
