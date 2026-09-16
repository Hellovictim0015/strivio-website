import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query, queryOne } from "@/lib/db";
import { signToken, cookieOptions, COOKIE_NAMES } from "@/lib/auth";
import { isValidEmail, isStrongPassword } from "@/lib/validate";

const encoder = new TextEncoder();

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    registrationToken,
    name,
    businessName,
    phone,
    address,
    city,
    description,
    password,
  } = body || {};

  if (!registrationToken) {
    return Response.json({ error: "Missing verification token. Please verify your email again." }, { status: 400 });
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(registrationToken, encoder.encode(process.env.JWT_SECRET)));
  } catch {
    return Response.json({ error: "Verification expired. Please verify your email again." }, { status: 400 });
  }

  if (payload.purpose !== "partner_register" || !isValidEmail(payload.email)) {
    return Response.json({ error: "Invalid verification token." }, { status: 400 });
  }
  const email = payload.email;

  if (!name?.trim() || !businessName?.trim() || !phone?.trim()) {
    return Response.json({ error: "Name, business name and phone are required" }, { status: 400 });
  }
  if (!/^[\d+\-\s()]{7,20}$/.test(phone.trim())) {
    return Response.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }
  if (!isStrongPassword(password)) {
    return Response.json(
      { error: "Password must be at least 8 characters and include a letter and a number" },
      { status: 400 }
    );
  }

  const existing = await queryOne("SELECT id, password_hash FROM partners WHERE email = ?", [email]);
  if (existing?.password_hash) {
    return Response.json({ error: "An account already exists with this email. Please login instead." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let partnerId;

  if (existing) {
    await query(
      `UPDATE partners SET password_hash = ?, name = ?, business_name = ?, phone = ?, address = ?, city = ?, description = ?, email_verified_at = NOW()
       WHERE id = ?`,
      [passwordHash, name.trim(), businessName.trim(), phone.trim(), address?.trim() || null, city?.trim() || null, description?.trim() || null, existing.id]
    );
    partnerId = existing.id;
  } else {
    const result = await query(
      `INSERT INTO partners (email, password_hash, name, business_name, phone, address, city, description, email_verified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [email, passwordHash, name.trim(), businessName.trim(), phone.trim(), address?.trim() || null, city?.trim() || null, description?.trim() || null]
    );
    partnerId = result.insertId;
  }

  const token = await signToken({ role: "partner", id: partnerId, email, name: name.trim() });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.partner, token, cookieOptions("partner"));

  return Response.json({
    partner: { id: partnerId, email, name: name.trim(), businessName: businessName.trim() },
  });
}
