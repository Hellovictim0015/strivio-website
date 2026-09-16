import { query } from "@/lib/db";

// Public: dynamic category list for "Browse by Activity". Admin-created categories
// automatically appear here — nothing is hardcoded on the frontend.
export async function GET() {
  const categories = await query(
    "SELECT id, name, description, image, status FROM categories WHERE status = 'active' ORDER BY name ASC"
  );
  return Response.json({ categories });
}
