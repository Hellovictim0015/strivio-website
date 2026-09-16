import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { saveUploadedImage } from "@/lib/upload";
import { parseEventFields } from "@/lib/events";

async function requirePartner() {
  const cookieStore = await cookies();
  return getAuthFromCookieStore(cookieStore, "partner");
}

export async function GET() {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const events = await query(
    "SELECT * FROM events WHERE partner_id = ? ORDER BY event_time DESC",
    [auth.id]
  );
  return Response.json({ events });
}

export async function POST(request) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();
  const { data, error } = parseEventFields(formData);
  if (error) return Response.json({ error }, { status: 400 });

  const imageFile = formData.get("image");
  if (!imageFile || typeof imageFile !== "object" || imageFile.size === 0) {
    return Response.json({ error: "An event image is required" }, { status: 400 });
  }

  let imagePath;
  try {
    imagePath = await saveUploadedImage(imageFile, "events");
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO events
      (partner_id, name, description, image, price, capacity_type, total_slots, location, latitude, longitude, event_time, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
    [
      auth.id,
      data.name,
      data.description,
      imagePath,
      data.price,
      data.capacityType,
      data.totalSlots,
      data.location,
      data.latitude,
      data.longitude,
      data.eventTime,
    ]
  );

  const event = await queryOne("SELECT * FROM events WHERE id = ?", [result.insertId]);
  return Response.json({ event }, { status: 201 });
}
