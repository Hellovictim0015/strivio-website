"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const STATUS_COLORS = { PENDING: "#f97316", APPROVED: "#83C52B", REJECTED: "#ef4444" };

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    { label: 'Total Users', value: data.totalUsers, icon: '👥', path: '/admin/users' },
    { label: 'Total Partners', value: data.totalPartners, icon: '🤝', path: '/admin/partners' },
    { label: 'Total Listings', value: data.totalListings, icon: '📋', path: '/admin/listings' },
    { label: 'Pending Approval', value: data.pendingListings, icon: '⏳', path: '/admin/listings?status=PENDING' },
    { label: 'Total Bookings', value: data.totalBookings, icon: '📅', path: '/admin/bookings' },
  ] : [];

  const statusPie = data ? [
    { name: 'Pending', value: data.pendingListings, color: STATUS_COLORS.PENDING },
    { name: 'Approved', value: data.approvedListings, color: STATUS_COLORS.APPROVED },
    { name: 'Rejected', value: data.rejectedListings, color: STATUS_COLORS.REJECTED },
  ].filter((s) => s.value > 0) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#0B1F33] font-black text-2xl">Admin Dashboard</h1>
        <p className="text-[#0B1F33]/50 text-sm mt-0.5">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {(loading ? Array(5).fill(null) : stats).map((s, i) => (
          <button
            key={s?.label || i}
            onClick={() => s && router.push(s.path)}
            className="bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s?.icon || "—"}</span>
            </div>
            <p className="text-[#0B1F33] font-black text-2xl">{s ? s.value : "—"}</p>
            <p className="text-[#0B1F33]/50 text-xs mt-1">{s?.label || "Loading…"}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#0B1F33] font-bold text-sm">Revenue Overview</h3>
              <p className="text-[#0B1F33]/40 text-xs">Monthly booking revenue (last 6 months)</p>
            </div>
          </div>
          {data?.revenueByMonth?.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.revenueByMonth} barSize={32}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#0B1F3370' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#0B1F3370' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0B1F33', border: 'none', borderRadius: 8, color: 'white', fontSize: 11 }} formatter={(v) => [`₹${v}`, 'Revenue']} cursor={{ fill: '#EAF5D9' }} />
                <Bar dataKey="revenue" fill="#83C52B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#0B1F33]/40 text-sm py-16 text-center">No revenue yet.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1F33] font-bold text-sm mb-1">Listing Status</h3>
          <p className="text-[#0B1F33]/40 text-xs mb-4">Approval pipeline breakdown</p>
          {statusPie.length ? (
            <>
              <div className="flex justify-center mb-4">
                <PieChart width={140} height={140}>
                  <Pie data={statusPie} cx={70} cy={70} innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {statusPie.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {statusPie.map((a) => (
                  <div key={a.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }}></div>
                    <span className="text-[#0B1F33] text-xs flex-1">{a.name}</span>
                    <span className="text-[#0B1F33] font-bold text-xs">{a.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[#0B1F33]/40 text-sm py-16 text-center">No listings yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-[#0B1F33] font-bold text-sm mb-1">Bookings (Last 7 Days)</h3>
        <p className="text-[#0B1F33]/40 text-xs mb-4">Daily booking volume</p>
        {data?.bookingsByDay?.length ? (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data.bookingsByDay} barSize={24}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#0B1F3370' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0B1F33', border: 'none', borderRadius: 8, color: 'white', fontSize: 11 }} cursor={{ fill: '#EAF5D9' }} />
              <Bar dataKey="count" fill="#0B1F33" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[#0B1F33]/40 text-sm py-16 text-center">No bookings in the last 7 days.</p>
        )}
      </div>
    </div>
  );
}
