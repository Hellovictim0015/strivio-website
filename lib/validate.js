export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim()) && email.length <= 191;
}

export function isValidOtp(otp) {
  return typeof otp === "string" && /^\d{6}$/.test(otp.trim());
}

// At least 8 chars, one letter, one number.
export function isStrongPassword(password) {
  return typeof password === "string" && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function jsonError(message, status = 400, extra = {}) {
  return Response.json({ error: message, ...extra }, { status });
}
