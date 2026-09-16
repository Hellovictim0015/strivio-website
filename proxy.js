import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAMES } from "@/lib/auth";

const PUBLIC_AUTH_PATHS = {
  user: ["/user/login", "/user/verify-otp"],
  partner: ["/partner/login", "/partner/register", "/partner/verify-otp"],
  admin: ["/admin/login"],
};

const HOME_PATH = { user: "/user", partner: "/partner", admin: "/admin" };

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const role = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/partner")
    ? "partner"
    : pathname.startsWith("/user")
    ? "user"
    : null;

  if (!role) return NextResponse.next();

  const isPublicAuthPath = PUBLIC_AUTH_PATHS[role].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const token = request.cookies.get(COOKIE_NAMES[role])?.value;
  const payload = token ? await verifyToken(token) : null;
  const isAuthed = !!payload && payload.role === role;

  if (isPublicAuthPath) {
    // Already logged in — skip the login/register/verify screens.
    if (isAuthed) {
      return NextResponse.redirect(new URL(HOME_PATH[role], request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthed) {
    const loginUrl = new URL(`/${role}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/partner/:path*", "/admin/:path*"],
};
