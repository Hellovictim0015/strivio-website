import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { saveUploadedImage } from "@/lib/upload";

async function requireAdmin() {
  const cookieStore = await cookies();
  return getAuthFromCookieStore(cookieStore, "admin");
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const category = await queryOne("SELECT * FROM categories WHERE id = ?", [id]);
  if (!category) return Response.json({ error: "Category not found" }, { status: 404 });

  const contentType = request.headers.get("content-type") || "";
  let name, description, status, imageFile;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    name = formData.get("name")?.toString().trim();
    description = formData.get("description")?.toString().trim();
    status = formData.get("status")?.toString().trim();
    imageFile = formData.get("image");
  } else {
    const body = await request.json();
    ({ name, description, status } = body || {});
  }

  if (name && name !== category.name) {
    const clash = await queryOne("SELECT id FROM categories WHERE name = ? AND id != ?", [name, id]);
    if (clash) return Response.json({ error: "A category with this name already exists" }, { status: 409 });
  }

  if (status && !["active", "inactive"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  let imagePath = category.image;
  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, "categories");
    } catch (err) {
      return Response.json({ error: err.message }, { status: 400 });
    }
  }

  await query(
    "UPDATE categories SET name = ?, description = ?, image = ?, status = ? WHERE id = ?",
    [
      name?.trim() || category.name,
      description !== undefined ? description || null : category.description,
      imagePath,
      status || category.status,
      id,
    ]
  );

  const updated = await queryOne("SELECT * FROM categories WHERE id = ?", [id]);
  return Response.json({ category: updated });
}

// Categories are soft-deleted (status -> inactive) rather than hard-deleted, since
// existing partner listings reference category_id via a foreign key.
export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const category = await queryOne("SELECT id FROM categories WHERE id = ?", [id]);
  if (!category) return Response.json({ error: "Category not found" }, { status: 404 });

  await query("UPDATE categories SET status = 'inactive' WHERE id = ?", [id]);
  return Response.json({ message: "Category deactivated" });
}
