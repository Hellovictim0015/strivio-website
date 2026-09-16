import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "partner");
  if (!auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const partner = await queryOne(
    "SELECT id, email, name, business_name, phone, address, city, description, status, created_at FROM partners WHERE id = ?",
    [auth.id]
  );
  if (!partner || partner.status === "disabled") {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  return Response.json({ partner });
}

// Lets a partner edit their own business profile (name/business/phone/address/city/description).
export async function PATCH(request) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "partner");
  if (!auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const partner = await queryOne("SELECT * FROM partners WHERE id = ?", [auth.id]);
  if (!partner || partner.status === "disabled") {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = body.name?.toString().trim() || partner.name;
  const businessName = body.businessName?.toString().trim() || partner.business_name;
  const phone = body.phone?.toString().trim() || partner.phone;
  const address = body.address !== undefined ? body.address?.toString().trim() || null : partner.address;
  const city = body.city !== undefined ? body.city?.toString().trim() || null : partner.city;
  const description = body.description !== undefined ? body.description?.toString().trim() || null : partner.description;

  if (!name || !businessName || !phone) {
    return Response.json({ error: "Name, business name and phone are required" }, { status: 400 });
  }
  if (!/^[\d+\-\s()]{7,20}$/.test(phone)) {
    return Response.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }

  await query(
    `UPDATE partners SET name = ?, business_name = ?, phone = ?, address = ?, city = ?, description = ? WHERE id = ?`,
    [name, businessName, phone, address, city, description, auth.id]
  );

  const updated = await queryOne(
    "SELECT id, email, name, business_name, phone, address, city, description, status, created_at FROM partners WHERE id = ?",
    [auth.id]
  );
  return Response.json({ partner: updated });
}
