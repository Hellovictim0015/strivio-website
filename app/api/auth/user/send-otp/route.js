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

  const existingUser = await queryOne("SELECT status FROM users WHERE email = ?", [normalizedEmail]);
  if (existingUser && existingUser.status === "blocked") {
    return Response.json({ error: "This account has been blocked. Contact support." }, { status: 403 });
  }

  const result = await createOtp(normalizedEmail, "user_login");
  if (result.error) {
    return Response.json({ error: result.error, retryAfterSeconds: result.retryAfterSeconds }, { status: 429 });
  }

  await sendOtpEmail(normalizedEmail, result.otp, { purpose: "user_login" });

  return Response.json({ message: "OTP sent to your email" });
}
