import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return encoder.encode(secret);
}

export const COOKIE_NAMES = {
  user: "strivio_user_token",
  partner: "strivio_partner_token",
  admin: "strivio_admin_token",
};

const EXPIRY = {
  user: "30d",
  partner: "7d",
  admin: "1d",
};

export async function signToken({ role, id, email, name }) {
  return new SignJWT({ role, id, email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY[role] || "7d")
    .sign(getSecret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

const isProd = process.env.NODE_ENV === "production";

export function cookieOptions(role) {
  const maxAgeSeconds = { user: 60 * 60 * 24 * 30, partner: 60 * 60 * 24 * 7, admin: 60 * 60 * 24 }[role] || 60 * 60 * 24 * 7;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

// Reads and verifies the auth cookie for a given role from a Next.js Route Handler
// (request.cookies) or from the `cookies()` store in a Server Component.
export async function getAuthFromCookieStore(cookieStore, role) {
  const cookie = cookieStore.get(COOKIE_NAMES[role]);
  if (!cookie?.value) return null;
  const payload = await verifyToken(cookie.value);
  if (!payload || payload.role !== role) return null;
  return payload;
}

// Convenience for Route Handlers: pass the incoming `request` (NextRequest).
export async function requireAuth(request, role) {
  return getAuthFromCookieStore(request.cookies, role);
}
