import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { saveUploadedImage } from "@/lib/upload";

async function requireAdmin() {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "admin");
  return auth;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const categories = await query(
    `SELECT c.id, c.name, c.description, c.image, c.status, c.created_at, c.updated_at,
            (SELECT COUNT(*) FROM partner_listings pl WHERE pl.category_id = c.id) AS listing_count
     FROM categories c ORDER BY c.created_at DESC`
  );
  return Response.json({ categories });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const imageFile = formData.get("image");

  if (!name) {
    return Response.json({ error: "Category name is required" }, { status: 400 });
  }

  const existing = await queryOne("SELECT id FROM categories WHERE name = ?", [name]);
  if (existing) {
    return Response.json({ error: "A category with this name already exists" }, { status: 409 });
  }

  let imagePath = null;
  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, "categories");
    } catch (err) {
      return Response.json({ error: err.message }, { status: 400 });
    }
  }

  const result = await query(
    "INSERT INTO categories (name, description, image, status) VALUES (?, ?, ?, 'active')",
    [name, description, imagePath]
  );

  const category = await queryOne("SELECT * FROM categories WHERE id = ?", [result.insertId]);
  return Response.json({ category }, { status: 201 });
}
