import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { saveUploadedImages } from "@/lib/upload";
import { parsePlans, cheapestPlan } from "@/lib/plans";

async function requirePartner() {
  const cookieStore = await cookies();
  return getAuthFromCookieStore(cookieStore, "partner");
}

async function loadOwnListing(id, partnerId) {
  const listing = await queryOne("SELECT * FROM partner_listings WHERE id = ?", [id]);
  if (!listing || listing.partner_id !== partnerId) return null;
  listing.images = Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || "[]");
  listing.plans = await query("SELECT * FROM listing_plans WHERE listing_id = ? ORDER BY price ASC", [id]);
  return listing;
}

export async function GET(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const listing = await loadOwnListing(id, auth.id);
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

  return Response.json({ listing });
}

// Editing content resets the listing to PENDING so admin can re-review the change.
export async function PUT(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const listing = await loadOwnListing(id, auth.id);
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim() || listing.name;
  const description = formData.get("description")?.toString().trim() ?? listing.description;
  const categoryId = formData.get("categoryId")?.toString() || listing.category_id;
  const address = formData.get("address")?.toString().trim() ?? listing.address;
  const city = formData.get("city")?.toString().trim() ?? listing.city;
  const phone = formData.get("phone")?.toString().trim() ?? listing.phone;
  const openingTime = formData.get("openingTime")?.toString().trim() ?? listing.opening_time;
  const closingTime = formData.get("closingTime")?.toString().trim() ?? listing.closing_time;
  const services = formData.get("services")?.toString().trim() ?? listing.services;
  const newImageFiles = formData.getAll("images").filter((f) => typeof f === "object" && f.size > 0);
  const keepExisting = formData.get("keepExistingImages") !== "false";

  const { plans, error: plansError } = parsePlans(formData.get("plans")?.toString());
  if (plansError) {
    return Response.json({ error: plansError }, { status: 400 });
  }

  const category = await queryOne("SELECT id FROM categories WHERE id = ?", [categoryId]);
  if (!category) return Response.json({ error: "Invalid category" }, { status: 400 });

  let images = keepExisting ? listing.images : [];
  if (newImageFiles.length > 0) {
    try {
      const uploaded = await saveUploadedImages(newImageFiles, "listings");
      images = [...images, ...uploaded];
    } catch (err) {
      return Response.json({ error: err.message }, { status: 400 });
    }
  }
  if (images.length === 0) {
    return Response.json({ error: "At least one listing image is required" }, { status: 400 });
  }

  const cheapest = cheapestPlan(plans);

  await query(
    `UPDATE partner_listings SET
      name = ?, description = ?, category_id = ?, price = ?, price_period = ?, address = ?, city = ?,
      phone = ?, opening_time = ?, closing_time = ?, services = ?, images = ?, status = 'PENDING', rejection_reason = NULL
     WHERE id = ?`,
    [name, description, categoryId, cheapest.price, cheapest.period, address, city, phone, openingTime, closingTime, services, JSON.stringify(images), id]
  );

  // Wholesale-replace plans; any bookings referencing an old plan keep their
  // historical plan_name/amount/persons snapshot and just lose the plan_id link (ON DELETE SET NULL).
  await query("DELETE FROM listing_plans WHERE listing_id = ?", [id]);
  for (const p of plans) {
    await query(
      `INSERT INTO listing_plans (listing_id, period, price, persons, label) VALUES (?, ?, ?, ?, ?)`,
      [id, p.period, p.price, p.persons, p.label]
    );
  }

  const updated = await loadOwnListing(id, auth.id);
  return Response.json({ listing: updated });
}

// Deactivates (soft-delete) rather than hard-deleting, since bookings reference this listing.
export async function DELETE(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const listing = await loadOwnListing(id, auth.id);
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

  await query("UPDATE partner_listings SET is_active = 0 WHERE id = ?", [id]);
  return Response.json({ message: "Listing deactivated" });
}

// Reactivate a previously deactivated listing.
export async function PATCH(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const listing = await loadOwnListing(id, auth.id);
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const isActive = body.isActive !== false;
  await query("UPDATE partner_listings SET is_active = ? WHERE id = ?", [isActive ? 1 : 0, id]);

  const updated = await loadOwnListing(id, auth.id);
  return Response.json({ listing: updated });
}
