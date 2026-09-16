import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { saveUploadedImages } from "@/lib/upload";
import { parsePlans, cheapestPlan } from "@/lib/plans";
import { parseLatLng } from "@/lib/geo";

async function requirePartner() {
  const cookieStore = await cookies();
  return getAuthFromCookieStore(cookieStore, "partner");
}

export async function GET() {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const listings = await query(
    `SELECT pl.*, c.name AS category_name,
            (SELECT COUNT(*) FROM bookings b WHERE b.listing_id = pl.id) AS booking_count
     FROM partner_listings pl
     JOIN categories c ON c.id = pl.category_id
     WHERE pl.partner_id = ?
     ORDER BY pl.created_at DESC`,
    [auth.id]
  );

  const listingIds = listings.map((l) => l.id);
  const plans = listingIds.length
    ? await query(
        `SELECT * FROM listing_plans WHERE listing_id IN (${listingIds.map(() => "?").join(",")}) ORDER BY price ASC`,
        listingIds
      )
    : [];

  const parsed = listings.map((l) => ({
    ...l,
    images: Array.isArray(l.images) ? l.images : JSON.parse(l.images || "[]"),
    plans: plans.filter((p) => p.listing_id === l.id),
  }));
  return Response.json({ listings: parsed });
}

export async function POST(request) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const categoryId = formData.get("categoryId")?.toString();
  const address = formData.get("address")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;
  const phone = formData.get("phone")?.toString().trim() || null;
  const openingTime = formData.get("openingTime")?.toString().trim() || null;
  const closingTime = formData.get("closingTime")?.toString().trim() || null;
  const services = formData.get("services")?.toString().trim() || null;
  const imageFiles = formData.getAll("images").filter((f) => typeof f === "object" && f.size > 0);

  if (!name || !categoryId) {
    return Response.json({ error: "Name and category are required" }, { status: 400 });
  }

  const { plans, error: plansError } = parsePlans(formData.get("plans")?.toString());
  if (plansError) {
    return Response.json({ error: plansError }, { status: 400 });
  }

  const { latitude, longitude, error: latLngError } = parseLatLng(formData);
  if (latLngError) {
    return Response.json({ error: latLngError }, { status: 400 });
  }

  const category = await queryOne("SELECT id FROM categories WHERE id = ? AND status = 'active'", [categoryId]);
  if (!category) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }

  if (imageFiles.length === 0) {
    return Response.json({ error: "At least one listing image is required" }, { status: 400 });
  }

  let imageUrls;
  try {
    imageUrls = await saveUploadedImages(imageFiles, "listings");
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  const qrToken = randomUUID();
  const cheapest = cheapestPlan(plans);

  const result = await query(
    `INSERT INTO partner_listings
      (partner_id, category_id, name, description, price, price_period, address, city, phone, opening_time, closing_time, latitude, longitude, services, images, status, qr_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
    [
      auth.id,
      categoryId,
      name,
      description,
      cheapest.price,
      cheapest.period,
      address,
      city,
      phone,
      openingTime,
      closingTime,
      latitude,
      longitude,
      services,
      JSON.stringify(imageUrls),
      qrToken,
    ]
  );

  const listingId = result.insertId;
  for (const p of plans) {
    await query(
      `INSERT INTO listing_plans (listing_id, period, price, persons, label) VALUES (?, ?, ?, ?, ?)`,
      [listingId, p.period, p.price, p.persons, p.label]
    );
  }

  const listing = await queryOne("SELECT * FROM partner_listings WHERE id = ?", [listingId]);
  listing.images = Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || "[]");
  listing.plans = await query("SELECT * FROM listing_plans WHERE listing_id = ? ORDER BY price ASC", [listingId]);
  return Response.json({ listing }, { status: 201 });
}
