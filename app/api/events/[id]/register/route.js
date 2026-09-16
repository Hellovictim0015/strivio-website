import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

function generateRegistrationCode() {
  const digits = String(Math.floor(10000 + Math.random() * 90000));
  return `EVT-${digits}`;
}

export async function POST(request, { params }) {
  const cookieStore = await cookies();
  const auth = await getAuthFromCookieStore(cookieStore, "user");
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  const event = await queryOne(
    `SELECT e.* FROM events e JOIN partners p ON p.id = e.partner_id
     WHERE e.id = ? AND e.status = 'APPROVED' AND e.is_active = 1 AND p.status = 'active'`,
    [id]
  );
  if (!event) return Response.json({ error: "This event is not available" }, { status: 404 });

  const existing = await queryOne(
    "SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ? AND status = 'confirmed'",
    [id, auth.id]
  );
  if (existing) return Response.json({ error: "You're already registered for this event" }, { status: 409 });

  // Atomically claim a slot: only increments if there's room (or capacity is unlimited).
  const claim = await query(
    `UPDATE events SET booked_slots = booked_slots + 1
     WHERE id = ? AND (capacity_type = 'unlimited' OR booked_slots < total_slots)`,
    [id]
  );
  if (claim.affectedRows === 0) {
    return Response.json({ error: "This event is full" }, { status: 409 });
  }

  let registrationCode = generateRegistrationCode();
  try {
    for (let i = 0; i < 5; i++) {
      const clash = await queryOne("SELECT id FROM event_registrations WHERE registration_code = ?", [registrationCode]);
      if (!clash) break;
      registrationCode = generateRegistrationCode();
    }

    const result = await query(
      "INSERT INTO event_registrations (registration_code, event_id, user_id, status) VALUES (?, ?, ?, 'confirmed')",
      [registrationCode, id, auth.id]
    );

    const registration = await queryOne(
      `SELECT r.*, e.name AS event_name, e.event_time, e.location FROM event_registrations r
       JOIN events e ON e.id = r.event_id WHERE r.id = ?`,
      [result.insertId]
    );
    return Response.json({ registration }, { status: 201 });
  } catch (err) {
    // Roll back the slot claim if the registration insert failed (e.g. a concurrent duplicate).
    await query("UPDATE events SET booked_slots = booked_slots - 1 WHERE id = ?", [id]);
    if (err.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "You're already registered for this event" }, { status: 409 });
    }
    throw err;
  }
}
