"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES = {
  PENDING: "bg-orange-50 text-orange-500",
  APPROVED: "bg-[#EAF5D9] text-[#83C52B]",
  REJECTED: "bg-red-50 text-red-400",
};

export default function PartnerEvents() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/partner/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleActive(event) {
    setBusyId(event.id);
    try {
      const method = event.is_active ? "DELETE" : "PATCH";
      const res = await fetch(`/api/partner/events/${event.id}`, {
        method,
        headers: method === "PATCH" ? { "Content-Type": "application/json" } : undefined,
        body: method === "PATCH" ? JSON.stringify({ isActive: true }) : undefined,
      });
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0B1F33] font-black text-2xl">My Events</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-1">Create and manage events — approved events appear on the user side</p>
        </div>
        <button onClick={() => router.push('/partner/events/create')} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] transition-colors">
          + New Event
        </button>
      </div>

      {!loading && events.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-[#0B1F33]/50 mb-4">You haven&apos;t created any events yet.</p>
          <button onClick={() => router.push('/partner/events/create')} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm">Create your first event</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {events.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-36">
              <img src={e.image || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=360&fit=crop&auto=format"} alt={e.name} className="w-full h-full object-cover bg-gray-100" />
              <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[e.status]}`}>{e.status}</span>
              {!e.is_active && <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-800/80 text-white">Deactivated</span>}
            </div>
            <div className="p-4">
              <p className="text-[#0B1F33] font-bold text-base truncate">{e.name}</p>
              <p className="text-[#0B1F33]/50 text-xs mt-0.5">{new Date(e.event_time).toLocaleString()}</p>
              <p className="text-[#0B1F33]/50 text-xs mt-0.5">{e.location || "No location set"}</p>
              <p className="text-[#0B1F33]/40 text-xs mt-2">
                {e.capacity_type === "unlimited" ? "Unlimited capacity" : `${e.booked_slots}/${e.total_slots} registered`} · ₹{Number(e.price).toLocaleString()}
              </p>
              {e.status === 'REJECTED' && e.rejection_reason && (
                <p className="text-red-400 text-xs mt-2 bg-red-50 rounded-lg px-2 py-1.5">Reason: {e.rejection_reason}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => router.push(`/partner/events/${e.id}/edit`)} className="text-xs font-bold px-3 py-2 rounded-xl bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]">Edit</button>
                <button
                  onClick={() => toggleActive(e)}
                  disabled={busyId === e.id}
                  className={`text-xs font-bold px-3 py-2 rounded-xl ml-auto disabled:opacity-50 ${e.is_active ? 'bg-red-50 text-red-400 hover:bg-red-100' : 'bg-[#EAF5D9] text-[#83C52B] hover:bg-[#dcefc4]'}`}
                >
                  {e.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
