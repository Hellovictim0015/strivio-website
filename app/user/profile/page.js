"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";

export default function Profile() {
  const router = useRouter();
  const { identity, logout } = useSession('user');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch("/api/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingCount = bookings.filter((b) => b.status === 'confirmed' && b.booking_date >= today).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  const menuSections = useMemo(() => [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Personal Information', sub: identity?.email || '—' },
        { icon: '🔔', label: 'Notifications', sub: 'Booking alerts, offers, reminders' },
      ],
    },
    {
      title: 'Fitness',
      items: [
        { icon: '📅', label: 'Booking History', sub: `${bookings.length} sessions total · ${upcomingCount} upcoming` },
      ],
    },
  ], [identity, bookings, upcomingCount]);

  const displayName = identity?.name || identity?.email?.split('@')[0] || 'Member';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="grid grid-cols-3 gap-8">
        {/* Left: Profile Card */}
        <div className="space-y-4">
          {/* Avatar + Info */}
          <div className="bg-[#0B1F33] rounded-2xl p-6 text-center">
            <div className="w-20 h-20 bg-[#83C52B] rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4">{initial}</div>
            <h2 className="text-white font-black text-xl">{displayName}</h2>
            <p className="text-white/40 text-xs mt-1">{identity?.email}</p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {[
              { label: 'Upcoming Sessions', value: upcomingCount, color: '#83C52B' },
              { label: 'Completed Sessions', value: completedCount, color: '#0B1F33' },
              { label: 'Total Bookings', value: bookings.length, color: '#0B1F33' },
            ].map((s) => (
              <div key={s.label} className="px-5 py-3.5 flex items-center justify-between">
                <span className="text-[#0B1F33]/60 text-sm">{s.label}</span>
                <span className="font-black text-lg" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          <button onClick={logout} className="w-full bg-red-50 text-red-400 font-semibold text-sm rounded-xl py-3 border border-red-100 hover:bg-red-100 transition-colors">
            Logout
          </button>
          <button onClick={() => router.push('/')} className="w-full text-[#0B1F33]/40 font-semibold text-xs py-1">
            ← Back to Mode Select
          </button>
        </div>

        {/* Right: Menu */}
        <div className="col-span-2 space-y-6">
          <div>
            <h1 className="text-[#0B1F33] font-black text-3xl">My Profile</h1>
            <p className="text-[#0B1F33]/50 text-sm mt-1">Manage your account, memberships and preferences</p>
          </div>

          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[#0B1F33]/40 text-xs font-bold uppercase tracking-widest mb-3">{section.title}</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {section.items.map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F5F7F3] transition-colors group">
                    <div className="w-10 h-10 bg-[#F5F7F3] group-hover:bg-[#EAF5D9] rounded-xl flex items-center justify-center text-xl transition-colors flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0B1F33] font-semibold text-sm">{item.label}</p>
                      <p className="text-[#0B1F33]/40 text-xs mt-0.5 truncate">{item.sub}</p>
                    </div>
                    <svg className="text-[#0B1F33]/20 group-hover:text-[#83C52B] transition-colors flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
