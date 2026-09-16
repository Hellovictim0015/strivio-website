"use client";

import { useEffect, useMemo, useState } from "react";

const statusColors = {
  confirmed: "bg-[#EAF5D9] text-[#83C52B]",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-400",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = status ? `?status=${status}` : "";
    fetch(`/api/admin/bookings${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, [status]);

  const filtered = useMemo(() => {
    if (!search) return bookings;
    const q = search.toLowerCase();
    return bookings.filter((b) =>
      b.booking_code.toLowerCase().includes(q) ||
      (b.user_name || b.user_email).toLowerCase().includes(q) ||
      b.partner_name.toLowerCase().includes(q) ||
      b.listing_name.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#0B1F33] font-black text-2xl">All Bookings</h1>
        <p className="text-[#0B1F33]/50 text-sm mt-0.5">Platform-wide booking activity</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-[#F5F7F3] text-[#0B1F33] text-xs font-bold px-3 py-2 rounded-xl outline-none">
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex-1 flex items-center gap-2 bg-[#F5F7F3] rounded-xl px-3 py-2 max-w-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-xs text-[#0B1F33] outline-none flex-1 placeholder:text-[#0B1F33]/40" placeholder="Search booking, member, partner..." />
          </div>
        </div>

        {!loading && filtered.length === 0 ? (
          <p className="text-[#0B1F33]/40 text-sm py-16 text-center">No bookings found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Booking Code', 'Member', 'Partner', 'Listing', 'Date', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-[#F5F7F3] transition-colors">
                  <td className="px-5 py-4 text-[#83C52B] font-mono text-xs font-bold">{b.booking_code}</td>
                  <td className="px-5 py-4 text-[#0B1F33] text-sm font-semibold">{b.user_name || b.user_email}</td>
                  <td className="px-5 py-4 text-[#0B1F33]/60 text-sm">{b.partner_name}</td>
                  <td className="px-5 py-4 text-[#0B1F33]/60 text-sm">{b.listing_name}</td>
                  <td className="px-5 py-4 text-[#0B1F33]/60 text-sm">{b.booking_date}</td>
                  <td className="px-5 py-4 text-[#0B1F33] text-sm font-semibold">₹{Number(b.amount).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[#0B1F33]/40 text-xs">Showing {filtered.length} of {bookings.length} bookings</p>
        </div>
      </div>
    </div>
  );
}
