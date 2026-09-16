"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";

const centers = [
  { name: 'PowerFit Gym', partner: 'Ramesh Gupta', activity: 'Gym', location: 'Shivajinagar', bookings: 324, status: 'Active' },
  { name: 'Urban Yoga Studio', partner: 'Anita Menon', activity: 'Yoga', location: 'Indiranagar', bookings: 286, status: 'Active' },
  { name: 'Elite Sports Arena', partner: 'Suresh Rao', activity: 'Football', location: 'Koramangala', bookings: 198, status: 'Active' },
  { name: 'Move Dance Academy', partner: 'Sanjay Reddy', activity: 'Dance', location: 'HSR Layout', bookings: 165, status: 'Active' },
  { name: 'AquaFit Swimming Club', partner: 'Kavitha Nair', activity: 'Swimming', location: 'Whitefield', bookings: 142, status: 'Inactive' },
  { name: 'GreenField Cricket', partner: 'Vijay Kumar', activity: 'Cricket', location: 'Marathahalli', bookings: 42, status: 'Inactive' },
];

const monthlyRevenue = [
  { month: 'Mar', value: 18.2 }, { month: 'Apr', value: 22.5 }, { month: 'May', value: 19.8 },
  { month: 'Jun', value: 25.1 }, { month: 'Jul', value: 27.4 }, { month: 'Aug', value: 28.4 },
];

const peakHours = [
  { hour: '6 AM', bookings: 120 }, { hour: '8 AM', bookings: 280 }, { hour: '10 AM', bookings: 190 },
  { hour: '12 PM', bookings: 150 }, { hour: '4 PM', bookings: 220 }, { hour: '6 PM', bookings: 340 }, { hour: '8 PM', bookings: 290 },
];

const popular = [
  { name: 'PowerFit Gym', bookings: 324 },
  { name: 'Urban Yoga', bookings: 286 },
  { name: 'Elite Sports', bookings: 198 },
  { name: 'Move Dance', bookings: 165 },
  { name: 'AquaFit', bookings: 142 },
];

const activities = [
  { name: 'Gym', users: 4730, color: '#83C52B' },
  { name: 'Yoga', users: 2740, color: '#0B1F33' },
  { name: 'Dance', users: 1870, color: '#EAF5D9' },
  { name: 'Swimming', users: 1620, color: '#4a9a1a' },
  { name: 'Sports', users: 1490, color: '#071525' },
];

export default function AdminCenters() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#0B1F33] font-black text-2xl">Centers & Analytics</h1>
        <p className="text-[#0B1F33]/50 text-sm">920 total centers · Platform analytics</p>
      </div>

      {/* Centers Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[#0B1F33] font-bold">Center Management</h3>
          <button className="bg-[#83C52B] text-white text-xs font-bold px-4 py-2 rounded-xl">+ Add Center</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Center', 'Partner', 'Activity', 'Location', 'Bookings', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {centers.map((c) => (
              <tr key={c.name} className="border-b border-gray-50 hover:bg-[#F5F7F3]">
                <td className="px-5 py-3.5 text-[#0B1F33] font-semibold text-sm">{c.name}</td>
                <td className="px-5 py-3.5 text-[#0B1F33]/60 text-sm">{c.partner}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-[#EAF5D9] text-[#0B1F33] text-xs font-semibold px-2.5 py-1 rounded-full">{c.activity}</span>
                </td>
                <td className="px-5 py-3.5 text-[#0B1F33]/60 text-sm">{c.location}</td>
                <td className="px-5 py-3.5 text-[#0B1F33] font-bold text-sm">{c.bookings}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'Active' ? 'bg-[#EAF5D9] text-[#83C52B]' : 'bg-gray-100 text-gray-400'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="text-[#83C52B] text-xs font-semibold">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analytics */}
      <h2 className="text-[#0B1F33] font-bold text-lg mb-4">Reports & Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Popular activities */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1F33] font-bold text-sm mb-3">Popular Activities</h3>
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-[#0B1F33] text-xs font-medium w-16">{a.name}</span>
                <div className="flex-1 bg-[#F5F7F3] rounded-full h-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ background: a.color === '#EAF5D9' ? '#83C52B' : a.color, width: `${(a.users / 4730) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[#0B1F33]/60 text-xs w-12 text-right">{(a.users / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1F33] font-bold text-sm mb-1">Monthly Revenue</h3>
          <p className="text-[#0B1F33]/40 text-xs mb-3">In lakhs (₹)</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#0B1F3370' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0B1F33', border: 'none', borderRadius: 8, color: 'white', fontSize: 11 }} formatter={(v) => [`₹${v}L`, 'Revenue']} />
              <Line type="monotone" dataKey="value" stroke="#83C52B" strokeWidth={2.5} dot={{ fill: '#83C52B', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Peak Booking Hours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1F33] font-bold text-sm mb-1">Peak Booking Hours</h3>
          <p className="text-[#0B1F33]/40 text-xs mb-3">Bookings by time of day</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={peakHours} barSize={22}>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#0B1F3370' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0B1F33', border: 'none', borderRadius: 8, color: 'white', fontSize: 11 }} cursor={{ fill: '#EAF5D9' }} />
              <Bar dataKey="bookings" fill="#83C52B" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most Booked Centers */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1F33] font-bold text-sm mb-3">Most Booked Centers</h3>
          <div className="space-y-3">
            {popular.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-[#83C52B] text-white' : 'bg-[#F5F7F3] text-[#0B1F33]'}`}>
                  {i + 1}
                </span>
                <span className="text-[#0B1F33] text-xs font-medium flex-1">{c.name}</span>
                <span className="text-[#0B1F33] font-bold text-xs">{c.bookings}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
