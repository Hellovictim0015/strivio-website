"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const tabs = ["Upcoming", "Completed", "Cancelled"];
const FALLBACK_IMG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&h=120&fit=crop&auto=format";

export default function UserBookings() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const grouped = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status === "confirmed" && b.booking_date >= today);
    const completed = bookings.filter((b) => b.status === "completed" || (b.status === "confirmed" && b.booking_date < today));
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    return { Upcoming: upcoming, Completed: completed, Cancelled: cancelled };
  }, [bookings, today]);

  const data = grouped[activeTab] || [];

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[#0B1F33] font-black text-3xl">My Bookings</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-1">Track and manage all your fitness sessions</p>
        </div>
        <button onClick={() => router.push('/user/centers')} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] transition-colors">
          + Book New Session
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Upcoming Sessions", value: grouped.Upcoming.length, color: "#83C52B", bg: "#EAF5D9" },
          { label: "Completed Sessions", value: grouped.Completed.length, color: "#0B1F33", bg: "#F5F7F3" },
          { label: "Cancelled", value: grouped.Cancelled.length, color: "#0B1F33", bg: "#F5F7F3" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl" style={{ background: s.bg, color: s.color }}>
              {s.value}
            </div>
            <p className="text-[#0B1F33] font-semibold text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-gray-100 mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === t ? 'border-[#83C52B] text-[#83C52B]' : 'border-transparent text-[#0B1F33]/40 hover:text-[#0B1F33]'}`}>
            {t}
          </button>
        ))}
      </div>

      {!loading && data.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📭</span>
          <p className="text-[#0B1F33]/40">No {activeTab.toLowerCase()} bookings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden hover:shadow-md transition-shadow">
              <img src={b.images?.[0] || FALLBACK_IMG} alt={b.listing_name} className="w-28 h-28 object-cover flex-shrink-0 bg-gray-100" />
              <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-[#0B1F33] font-bold text-base">{b.listing_name}</p>
                  <p className="text-[#0B1F33]/50 text-sm mt-0.5">{b.plan_name} Plan{b.persons ? ` · ${b.persons} persons` : ""} · {b.category_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#0B1F33]/60">
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      {b.booking_date}
                    </span>
                    {b.session_label && (
                      <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {b.session_label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    activeTab === 'Upcoming' ? 'bg-[#EAF5D9] text-[#83C52B]' : activeTab === 'Cancelled' ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-[#0B1F33]/50'
                  }`}>
                    {activeTab === 'Upcoming' ? '● Upcoming' : activeTab === 'Cancelled' ? '✕ Cancelled' : '✓ Completed'}
                  </span>
                  {activeTab === 'Upcoming' && (
                    <button onClick={() => router.push(`/user/qr?bookingId=${b.id}`)} className="bg-[#0B1F33] text-white text-xs font-bold px-4 py-2 rounded-xl">
                      View QR
                    </button>
                  )}
                  <span className="text-[#0B1F33]/30 text-xs font-mono">{b.booking_code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
