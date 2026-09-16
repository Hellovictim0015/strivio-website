"use client";

import { useEffect, useState } from "react";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=500&fit=crop&auto=format";

function capacityLabel(e) {
  if (e.capacity_type === "unlimited") return "Open registration";
  const remaining = e.total_slots - e.booked_slots;
  return remaining > 0 ? `${e.booked_slots}/${e.total_slots} registered` : "Full";
}

function isFull(e) {
  return e.capacity_type === "limited" && e.booked_slots >= e.total_slots;
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/events", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/events/registrations", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { registrations: [] })),
    ]).then(([eventsData, regData]) => {
      setEvents(eventsData.events || []);
      setRegisteredIds(new Set((regData.registrations || []).map((r) => r.event_id)));
    }).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function register(eventId) {
    setBusyId(eventId);
    setMessage("");
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not register");
        return;
      }
      setMessage(`Registered! Your code: ${data.registration.registration_code}`);
      load();
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const [featured, ...rest] = events;

  if (!loading && events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 text-center">
        <h1 className="text-[#0B1F33] font-black text-2xl mb-2">No upcoming events</h1>
        <p className="text-[#0B1F33]/50">Check back soon — partners haven&apos;t published any events yet.</p>
      </div>
    );
  }

  return (
    <div>
      {featured && (
        <div className="relative h-80 overflow-hidden">
          <img src={featured.image || FALLBACK_IMG} alt={featured.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F33]/90 via-[#0B1F33]/50 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-8">
              <span className="bg-[#83C52B] text-white text-xs font-black px-3 py-1.5 rounded-full mb-4 inline-block">⚡ FEATURED EVENT</span>
              <h1 className="text-white font-black text-4xl mb-3 max-w-xl">{featured.name}</h1>
              <div className="flex items-center gap-5 text-white/70 text-sm mb-5 flex-wrap">
                <span className="flex items-center gap-1.5">📅 {new Date(featured.event_time).toLocaleString()}</span>
                {featured.location && <span className="flex items-center gap-1.5">📍 {featured.location}</span>}
                <span className="flex items-center gap-1.5">👥 {capacityLabel(featured)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => register(featured.id)}
                  disabled={busyId === featured.id || registeredIds.has(featured.id) || isFull(featured)}
                  className="bg-[#83C52B] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#74b024] transition-colors disabled:opacity-50"
                >
                  {registeredIds.has(featured.id) ? "✓ Registered" : isFull(featured) ? "Full" : busyId === featured.id ? "Registering…" : "Register Now →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[#0B1F33] font-black text-2xl">Upcoming Events</h2>
            <p className="text-[#0B1F33]/50 text-sm mt-1">Find and join fitness events near you</p>
          </div>
        </div>

        {message && <p className="text-[#83C52B] text-sm font-semibold mb-4 bg-[#EAF5D9] rounded-xl px-4 py-2.5">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rest.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="relative overflow-hidden">
                <img src={e.image || FALLBACK_IMG} alt={e.name} className="w-full h-44 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${isFull(e) ? 'bg-red-50 text-red-400' : 'bg-[#EAF5D9] text-[#83C52B]'}`}>
                  {isFull(e) ? "Full" : "Open"}
                </span>
                {e.price > 0 && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#0B1F33]">₹{Number(e.price).toLocaleString()}</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-[#0B1F33] font-bold text-sm mb-3">{e.name}</h3>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#0B1F33]/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {new Date(e.event_time).toLocaleString()}
                  </div>
                  {e.location && (
                    <div className="flex items-center gap-2 text-xs text-[#0B1F33]/50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {e.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[#0B1F33]/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {capacityLabel(e)}
                  </div>
                </div>
                <button
                  onClick={() => register(e.id)}
                  disabled={busyId === e.id || registeredIds.has(e.id) || isFull(e)}
                  className="w-full bg-[#0B1F33] text-white font-bold rounded-xl py-2.5 text-xs hover:bg-[#071525] transition-colors disabled:opacity-50"
                >
                  {registeredIds.has(e.id) ? "✓ Registered" : isFull(e) ? "Full" : busyId === e.id ? "Registering…" : "Register →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
