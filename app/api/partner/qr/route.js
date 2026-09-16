import QRCode from "qrcode";
import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { queryOne } from "@/lib/db";

// Generates the partner's business-level QR code (PNG or SVG), pointing at the
// public business profile page that lists ALL of their approved listings.
// GET /api/partner/qr?format=png|svg
export async function GET(request) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "partner");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const partner = await queryOne("SELECT id, business_name FROM partners WHERE id = ?", [auth.id]);
  if (!partner) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "svg" ? "svg" : "png";
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const targetUrl = `${baseUrl}/public/partner/${partner.id}`;
  const filenameSafe = partner.business_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  if (format === "svg") {
    const svg = await QRCode.toString(targetUrl, { type: "svg", margin: 1, width: 512 });
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="strivio-${filenameSafe}-business-qr.svg"`,
      },
    });
  }

  const buffer = await QRCode.toBuffer(targetUrl, { type: "png", margin: 1, width: 512 });
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="strivio-${filenameSafe}-business-qr.png"`,
    },
  });
}
