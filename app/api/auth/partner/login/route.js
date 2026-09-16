import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { queryOne } from "@/lib/db";
import { signToken, cookieOptions, COOKIE_NAMES } from "@/lib/auth";
import { isValidEmail } from "@/lib/validate";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = body || {};
  if (!isValidEmail(email) || !password) {
    return Response.json({ error: "Please provide email and password" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const partner = await queryOne(
    "SELECT id, email, password_hash, name, business_name, status FROM partners WHERE email = ?",
    [normalizedEmail]
  );

  if (!partner || !partner.password_hash) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, partner.password_hash);
  if (!isValid) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (partner.status === "disabled") {
    return Response.json({ error: "Your account has been disabled. Contact Strivio support." }, { status: 403 });
  }

  const token = await signToken({ role: "partner", id: partner.id, email: partner.email, name: partner.name });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.partner, token, cookieOptions("partner"));

  return Response.json({
    partner: { id: partner.id, email: partner.email, name: partner.name, businessName: partner.business_name },
  });
}
