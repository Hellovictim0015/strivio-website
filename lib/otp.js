import bcrypt from "bcryptjs";
import { query, queryOne } from "./db";

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Creates and stores a new OTP for the given email/purpose, enforcing a resend cooldown.
// Returns { otp } on success, or { error, retryAfterSeconds } if the cooldown is active.
export async function createOtp(email, purpose) {
  const normalizedEmail = email.toLowerCase().trim();

  const recent = await queryOne(
    `SELECT id, last_sent_at FROM otps
     WHERE email = ? AND purpose = ? AND consumed_at IS NULL
     ORDER BY id DESC LIMIT 1`,
    [normalizedEmail, purpose]
  );

  if (recent) {
    const elapsedSeconds = (Date.now() - new Date(recent.last_sent_at).getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      return {
        error: "Please wait before requesting another OTP",
        retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds),
      };
    }
  }

  // Invalidate any prior unconsumed OTPs for this email/purpose.
  await query(
    `UPDATE otps SET consumed_at = NOW() WHERE email = ? AND purpose = ? AND consumed_at IS NULL`,
    [normalizedEmail, purpose]
  );

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await query(
    `INSERT INTO otps (email, purpose, otp_hash, max_attempts, expires_at, last_sent_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [normalizedEmail, purpose, otpHash, MAX_ATTEMPTS, expiresAt]
  );

  return { otp };
}

// Verifies an OTP. Returns { success: true } or { success: false, error }.
export async function verifyOtp(email, purpose, submittedOtp) {
  const normalizedEmail = email.toLowerCase().trim();

  const record = await queryOne(
    `SELECT * FROM otps WHERE email = ? AND purpose = ? AND consumed_at IS NULL
     ORDER BY id DESC LIMIT 1`,
    [normalizedEmail, purpose]
  );

  if (!record) {
    return { success: false, error: "No active OTP found. Please request a new one." };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, error: "OTP has expired. Please request a new one." };
  }

  if (record.attempts >= record.max_attempts) {
    return { success: false, error: "Too many incorrect attempts. Please request a new OTP." };
  }

  const isValid = await bcrypt.compare(String(submittedOtp), record.otp_hash);

  if (!isValid) {
    await query(`UPDATE otps SET attempts = attempts + 1 WHERE id = ?`, [record.id]);
    const remaining = record.max_attempts - (record.attempts + 1);
    return {
      success: false,
      error: remaining > 0 ? `Incorrect OTP. ${remaining} attempt(s) remaining.` : "Too many incorrect attempts. Please request a new OTP.",
    };
  }

  await query(`UPDATE otps SET consumed_at = NOW() WHERE id = ?`, [record.id]);
  return { success: true };
}
