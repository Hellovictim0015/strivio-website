import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { saveUploadedImage } from "@/lib/upload";
import { parseEventFields } from "@/lib/events";

async function requirePartner() {
  const cookieStore = await cookies();
  return getAuthFromCookieStore(cookieStore, "partner");
}

async function loadOwnEvent(id, partnerId) {
  const event = await queryOne("SELECT * FROM events WHERE id = ?", [id]);
  if (!event || event.partner_id !== partnerId) return null;
  return event;
}

export async function GET(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const event = await loadOwnEvent(id, auth.id);
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  return Response.json({ event });
}

// Editing resets the event to PENDING so admin can re-review the change.
export async function PUT(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const event = await loadOwnEvent(id, auth.id);
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  const formData = await request.formData();
  const { data, error } = parseEventFields(formData);
  if (error) return Response.json({ error }, { status: 400 });

  if (data.capacityType === "limited" && data.totalSlots < event.booked_slots) {
    return Response.json(
      { error: `Total slots cannot be less than the ${event.booked_slots} already registered` },
      { status: 400 }
    );
  }

  let imagePath = event.image;
  const imageFile = formData.get("image");
  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, "events");
    } catch (err) {
      return Response.json({ error: err.message }, { status: 400 });
    }
  }

  await query(
    `UPDATE events SET
      name = ?, description = ?, image = ?, price = ?, capacity_type = ?, total_slots = ?,
      location = ?, latitude = ?, longitude = ?, event_time = ?, status = 'PENDING', rejection_reason = NULL
     WHERE id = ?`,
    [
      data.name, data.description, imagePath, data.price, data.capacityType, data.totalSlots,
      data.location, data.latitude, data.longitude, data.eventTime, id,
    ]
  );

  const updated = await loadOwnEvent(id, auth.id);
  return Response.json({ event: updated });
}

// Deactivates (soft-delete) rather than hard-deleting, since registrations reference this event.
export async function DELETE(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const event = await loadOwnEvent(id, auth.id);
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  await query("UPDATE events SET is_active = 0 WHERE id = ?", [id]);
  return Response.json({ message: "Event deactivated" });
}

export async function PATCH(request, { params }) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const event = await loadOwnEvent(id, auth.id);
  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const isActive = body.isActive !== false;
  await query("UPDATE events SET is_active = ? WHERE id = ?", [isActive ? 1 : 0, id]);

  const updated = await loadOwnEvent(id, auth.id);
  return Response.json({ event: updated });
}
