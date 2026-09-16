"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STATUS_STYLES = {
  PENDING: "bg-orange-50 text-orange-500",
  APPROVED: "bg-[#EAF5D9] text-[#83C52B]",
  REJECTED: "bg-red-50 text-red-400",
};

function AdminEventsInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("status") || "ALL");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    setLoading(true);
    const params = tab !== "ALL" ? `?status=${tab}` : "";
    fetch(`/api/admin/events${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [tab]);

  async function approve(id) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/events/${id}/approve`, { method: "POST" });
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/events/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectingId(null);
      setRejectReason("");
      load();
    } finally {
      setBusyId(null);
    }
  }

  const tabs = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#0B1F33] font-black text-2xl">Event Approvals</h1>
        <p className="text-[#0B1F33]/50 text-sm mt-0.5">Review and approve partner-submitted events</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${tab === t ? 'bg-[#83C52B] text-white' : 'bg-white text-[#0B1F33] border border-gray-100 hover:border-[#83C52B]/40'}`}>
            {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {!loading && events.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-[#0B1F33]/50">No events found.</p>
        </div>
      )}

      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <img src={e.image || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=150&fit=crop&auto=format"} alt={e.name} className="w-full md:w-32 h-32 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[#0B1F33] font-bold text-base">{e.name}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[e.status]}`}>{e.status}</span>
                    {!e.is_active && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Deactivated by partner</span>}
                  </div>
                  <p className="text-[#0B1F33]/50 text-xs mt-1">{new Date(e.event_time).toLocaleString()} · {e.location || "—"} · ₹{Number(e.price).toLocaleString()}</p>
                  <p className="text-[#0B1F33]/50 text-xs mt-1">{e.capacity_type === "unlimited" ? "Unlimited capacity" : `${e.booked_slots}/${e.total_slots} registered`}</p>
                  <p className="text-[#0B1F33]/40 text-xs mt-1">By {e.partner_name} ({e.partner_email})</p>
                  {e.rejection_reason && <p className="text-red-400 text-xs mt-1">Rejection reason: {e.rejection_reason}</p>}
                </div>
                {e.status === "PENDING" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approve(e.id)} disabled={busyId === e.id}
                      className="bg-[#83C52B] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#74b024] disabled:opacity-60">
                      Approve
                    </button>
                    <button onClick={() => setRejectingId(rejectingId === e.id ? null : e.id)}
                      className="bg-red-50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-100">
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {rejectingId === e.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={rejectReason}
                    onChange={(ev) => setRejectReason(ev.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="flex-1 px-3 py-2 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
                  />
                  <button onClick={() => reject(e.id)} disabled={busyId === e.id} className="bg-red-400 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-60">
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminEvents() {
  return (
    <Suspense fallback={null}>
      <AdminEventsInner />
    </Suspense>
  );
}
