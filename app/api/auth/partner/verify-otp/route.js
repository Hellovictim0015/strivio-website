import { SignJWT } from "jose";
import { verifyOtp } from "@/lib/otp";
import { isValidEmail, isValidOtp } from "@/lib/validate";

const encoder = new TextEncoder();

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
  const result = await verifyOtp(normalizedEmail, "partner_register", otp);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  // Short-lived registration token proving this email was OTP-verified.
  // Sent back to the client and passed to /api/auth/partner/register — never stored as a cookie.
  const registrationToken = await new SignJWT({ purpose: "partner_register", email: normalizedEmail })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(encoder.encode(process.env.JWT_SECRET));

  return Response.json({ verified: true, registrationToken });
}
