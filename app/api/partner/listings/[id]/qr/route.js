import QRCode from "qrcode";
import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { queryOne } from "@/lib/db";

// Generates a downloadable QR code (PNG or SVG) pointing at the public listing page.
// GET /api/partner/listings/:id/qr?format=png|svg
export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "partner");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const listing = await queryOne("SELECT id, name, partner_id, qr_token FROM partner_listings WHERE id = ?", [id]);
  if (!listing || listing.partner_id !== auth.id) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "svg" ? "svg" : "png";
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const targetUrl = `${baseUrl}/public/listing/${listing.id}`;
  const filenameSafe = listing.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  if (format === "svg") {
    const svg = await QRCode.toString(targetUrl, { type: "svg", margin: 1, width: 512 });
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="strivio-${filenameSafe}-qr.svg"`,
      },
    });
  }

  const buffer = await QRCode.toBuffer(targetUrl, { type: "png", margin: 1, width: 512 });
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="strivio-${filenameSafe}-qr.png"`,
    },
  });
}
