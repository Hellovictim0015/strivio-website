import { cookies } from "next/headers";
import { getAuthFromCookieStore } from "@/lib/auth";
import { query } from "@/lib/db";

async function requirePartner() {
  const cookieStore = await cookies();
  return getAuthFromCookieStore(cookieStore, "partner");
}

export async function GET() {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const sessions = await query(
    "SELECT * FROM partner_sessions WHERE partner_id = ? ORDER BY sort_order ASC, id ASC",
    [auth.id]
  );
  return Response.json({ sessions });
}

// Wholesale-replaces the partner's session slots (same pattern as listing plans).
// Booking records only ever store a text snapshot of the session label, so
// replacing the live rows never breaks past bookings.
export async function PUT(request) {
  const auth = await requirePartner();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const rawSessions = Array.isArray(body.sessions) ? body.sessions : [];

  if (rawSessions.length > 10) {
    return Response.json({ error: "At most 10 session slots are allowed" }, { status: 400 });
  }

  const sessions = [];
  for (const s of rawSessions) {
    const label = s?.label?.toString().trim();
    if (!label) {
      return Response.json({ error: "Each session slot needs a label" }, { status: 400 });
    }
    sessions.push({
      label,
      startTime: s?.startTime?.toString().trim() || null,
      endTime: s?.endTime?.toString().trim() || null,
    });
  }

  await query("DELETE FROM partner_sessions WHERE partner_id = ?", [auth.id]);
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    await query(
      "INSERT INTO partner_sessions (partner_id, label, start_time, end_time, sort_order) VALUES (?, ?, ?, ?, ?)",
      [auth.id, s.label, s.startTime, s.endTime, i]
    );
  }

  const updated = await query(
    "SELECT * FROM partner_sessions WHERE partner_id = ? ORDER BY sort_order ASC, id ASC",
    [auth.id]
  );
  return Response.json({ sessions: updated });
}
