"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const statusColors = {
  confirmed: "bg-[#EAF5D9] text-[#83C52B]",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-400",
};

const tabs = ["All", "Confirmed", "Completed", "Cancelled"];

export default function PartnerBookings() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/partner/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab !== "All" && b.status !== activeTab.toLowerCase()) return false;
      if (search && !(b.user_name || b.user_email).toLowerCase().includes(search.toLowerCase()) && !b.booking_code.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [bookings, activeTab, search]);

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[#0B1F33] font-black text-2xl">Bookings</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-0.5">Manage and track all center bookings</p>
        </div>
        <button onClick={() => router.push('/partner/scanner')} className="flex items-center gap-2 bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] transition-colors">
          📷 Check-in a Booking
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === t ? 'bg-[#83C52B] text-white' : 'bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 flex items-center gap-2 bg-[#F5F7F3] rounded-xl px-3 py-2 max-w-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-xs text-[#0B1F33] outline-none flex-1 placeholder:text-[#0B1F33]/40" placeholder="Search by member or booking code..." />
          </div>
        </div>

        {!loading && filtered.length === 0 ? (
          <p className="text-[#0B1F33]/40 text-sm py-16 text-center">No bookings found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Member', 'Booking Code', 'Listing', 'Date', 'Session', 'Plan', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-[#F5F7F3] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#EAF5D9] rounded-full flex items-center justify-center text-xs font-bold text-[#0B1F33]">{(b.user_name || b.user_email)[0].toUpperCase()}</div>
                      <span className="text-[#0B1F33] font-semibold text-sm">{b.user_name || b.user_email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#83C52B] font-mono text-xs font-bold">{b.booking_code}</td>
                  <td className="px-5 py-4 text-[#0B1F33]/60 text-sm">{b.listing_name}</td>
                  <td className="px-5 py-4 text-[#0B1F33]/60 text-sm">{b.booking_date}</td>
                  <td className="px-5 py-4 text-[#0B1F33] text-sm font-medium">{b.session_label || "—"}</td>
                  <td className="px-5 py-4">
                    <span className="bg-[#F5F7F3] text-[#0B1F33] text-xs font-semibold px-2.5 py-1 rounded-full">{b.plan_name}{b.persons ? ` · ${b.persons}p` : ""}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[b.status]}`}>{b.status}{b.checked_in_at ? ' · checked in' : ''}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
          <p className="text-[#0B1F33]/40 text-xs">Showing {filtered.length} of {bookings.length} bookings</p>
        </div>
      </div>
    </div>
  );
}
