import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { isValidEmail } from "@/lib/validate";
import { queryOne } from "@/lib/db";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email } = body || {};
  if (!isValidEmail(email)) {
    return Response.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingPartner = await queryOne(
    "SELECT id, password_hash FROM partners WHERE email = ?",
    [normalizedEmail]
  );
  if (existingPartner?.password_hash) {
    return Response.json(
      { error: "An account already exists with this email. Please login instead." },
      { status: 409 }
    );
  }

  const result = await createOtp(normalizedEmail, "partner_register");
  if (result.error) {
    return Response.json({ error: result.error, retryAfterSeconds: result.retryAfterSeconds }, { status: 429 });
  }

  await sendOtpEmail(normalizedEmail, result.otp, { purpose: "partner_register" });

  return Response.json({ message: "OTP sent to your email" });
}
