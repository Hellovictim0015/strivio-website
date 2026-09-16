"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";

const quickActions = [
  { icon: '➕', label: 'Add New Listing', sub: 'Create a new center listing', path: '/partner/listings/create', color: '#EAF5D9' },
  { icon: '📷', label: 'Scan QR Code', sub: 'Verify member attendance', path: '/partner/scanner', color: '#EAF5D9' },
  { icon: '📋', label: 'Manage Listings', sub: 'Edit, view status & QR codes', path: '/partner/listings', color: '#F5F7F3' },
  { icon: '📅', label: 'View Bookings', sub: "See all bookings", path: '/partner/bookings', color: '#F5F7F3' },
];

export default function PartnerDashboard() {
  const router = useRouter();
  const { identity } = useSession('partner');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const displayName = identity?.name || 'Partner';
  const businessName = identity?.business_name || 'Your Business';

  return (
    <div>
      <div className="mb-6">
        <p className="text-[#83C52B] text-sm font-semibold">Welcome back, {displayName} 👋</p>
        <h1 className="text-[#0B1F33] font-black text-2xl mt-0.5">{businessName}</h1>
        <p className="text-[#0B1F33]/50 text-sm">Here&apos;s your listings and bookings overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Listings', value: stats?.totalListings ?? '—', icon: '📋', color: '#0B1F33' },
          { label: 'Approved', value: stats?.approvedListings ?? '—', icon: '✅', color: '#83C52B' },
          { label: 'Pending Review', value: stats?.pendingListings ?? '—', icon: '⏳', color: '#0B1F33' },
          { label: 'Total Bookings', value: stats?.totalBookings ?? '—', icon: '📅', color: '#83C52B' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className="text-[#0B1F33] font-black text-2xl">{s.value}</p>
            <p className="text-[#0B1F33]/50 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {stats?.rejectedListings > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-red-500 text-sm font-semibold">{stats.rejectedListings} listing(s) were rejected. <button onClick={() => router.push('/partner/listings')} className="underline">Review them</button></p>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#0B1F33] font-bold">Recent Bookings</h3>
            <button onClick={() => router.push('/partner/bookings')} className="text-[#83C52B] text-xs font-semibold hover:underline">View All →</button>
          </div>
          {!loading && (!stats?.recentBookings || stats.recentBookings.length === 0) ? (
            <p className="text-[#0B1F33]/40 text-sm py-8 text-center">No bookings yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider pb-3">Member</th>
                  <th className="text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider pb-3">Listing</th>
                  <th className="text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider pb-3">Date</th>
                  <th className="text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentBookings || []).map((b) => (
                  <tr key={b.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#EAF5D9] rounded-full flex items-center justify-center text-xs font-bold text-[#0B1F33]">{(b.user_name || b.user_email)[0].toUpperCase()}</div>
                        <span className="text-[#0B1F33] font-semibold text-sm">{b.user_name || b.user_email}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#0B1F33]/60 text-sm">{b.listing_name}</td>
                    <td className="py-3 text-[#0B1F33]/60 text-sm">{b.booking_date}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-[#EAF5D9] text-[#83C52B]' : b.status === 'cancelled' ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-gray-500'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#0B1F33] font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((a) => (
              <button key={a.label} onClick={() => router.push(a.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7F3] transition-colors text-left group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: a.color }}>
                  {a.icon}
                </div>
                <div>
                  <p className="text-[#0B1F33] font-bold text-sm group-hover:text-[#83C52B] transition-colors">{a.label}</p>
                  <p className="text-[#0B1F33]/40 text-xs">{a.sub}</p>
                </div>
                <svg className="ml-auto text-[#0B1F33]/20 group-hover:text-[#83C52B] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
