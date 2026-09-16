"use client";

import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const chartData = [
  { month: 'Mar', revenue: 38000 },
  { month: 'Apr', revenue: 42000 },
  { month: 'May', revenue: 35000 },
  { month: 'Jun', revenue: 52000 },
  { month: 'Jul', revenue: 48000 },
  { month: 'Aug', revenue: 48500 },
];

const transactions = [
  { id: 'STR-28491', customer: 'Shivani Patidar', amount: '₹999', date: '28 Aug', status: 'Paid' },
  { id: 'STR-28490', customer: 'Rahul Mehta', amount: '₹2,499', date: '27 Aug', status: 'Paid' },
  { id: 'STR-28489', customer: 'Priya Sharma', amount: '₹999', date: '27 Aug', status: 'Pending' },
  { id: 'STR-28488', customer: 'Arjun Kumar', amount: '₹999', date: '26 Aug', status: 'Refunded' },
];

const events = [
  { title: 'Football League', date: 'Aug 30–31', reg: '48/64', img: '⚽' },
  { title: 'Yoga Workshop', date: 'Sep 5', reg: '22/30', img: '🧘' },
  { title: 'Zumba Weekend', date: 'Sep 13', reg: '18/50', img: '🎵' },
];

export default function PartnerPayments() {
  const router = useRouter();

  return (
    <div className="flex flex-col bg-[#F5F7F3]">
      <div className="bg-white px-5 pt-5 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-[#F5F7F3]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-[#0B1F33] font-black text-xl">Payments & Events</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-6">
        {/* Revenue Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Today's Revenue", value: '₹4.8K', sub: '+12%' },
            { label: 'Monthly Revenue', value: '₹48.5K', sub: '+8%' },
            { label: 'Pending', value: '₹2.1K', sub: '3 pending' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center">
              <p className="text-[#0B1F33] font-black text-base">{s.value}</p>
              <p className="text-[#0B1F33]/40 text-[9px] mt-0.5 leading-tight">{s.label}</p>
              <span className="text-[#83C52B] text-[9px] font-bold">{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[#0B1F33] font-bold text-sm mb-3">Revenue Trend</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#0B1F3380' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#0B1F33', border: 'none', borderRadius: 8, color: 'white', fontSize: 11 }}
                formatter={(v) => [`₹${(v / 1000).toFixed(0)}K`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#83C52B" strokeWidth={2.5} dot={{ fill: '#83C52B', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#0B1F33] font-bold text-sm">Recent Transactions</p>
            <button className="text-[#83C52B] text-xs font-semibold">Export</button>
          </div>
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#EAF5D9] rounded-full flex items-center justify-center text-xs font-bold text-[#0B1F33]">
                    {t.customer[0]}
                  </div>
                  <div>
                    <p className="text-[#0B1F33] text-xs font-semibold">{t.customer}</p>
                    <p className="text-[#0B1F33]/40 text-[9px]">{t.id} · {t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#0B1F33] font-bold text-xs">{t.amount}</p>
                  <span className={`text-[9px] font-bold ${
                    t.status === 'Paid' ? 'text-[#83C52B]' : t.status === 'Pending' ? 'text-orange-500' : 'text-red-400'
                  }`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#0B1F33] font-bold text-sm">Events</p>
            <button className="bg-[#83C52B] text-white text-xs font-bold px-3 py-1.5 rounded-full">+ Create</button>
          </div>
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.title} className="bg-white rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EAF5D9] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {e.img}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0B1F33] font-bold text-sm">{e.title}</p>
                  <p className="text-[#0B1F33]/40 text-xs">{e.date} · {e.reg} registered</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button className="text-[#83C52B] text-[10px] font-semibold">Edit</button>
                  <button className="text-[#0B1F33]/50 text-[10px] font-semibold">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
