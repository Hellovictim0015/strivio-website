"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const tabs = ["All", "Active", "Disabled"];

const statusStyles = {
  active: "bg-[#EAF5D9] text-[#83C52B]",
  disabled: "bg-red-50 text-red-400",
};

export default function AdminPartners() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/partners", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPartners(d.partners || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (activeTab === "All") return partners;
    return partners.filter((p) => p.status === activeTab.toLowerCase());
  }, [partners, activeTab]);

  async function toggleStatus(partner) {
    setBusyId(partner.id);
    try {
      const newStatus = partner.status === "active" ? "disabled" : "active";
      await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0B1F33] font-black text-2xl">Partners</h1>
          <p className="text-[#0B1F33]/50 text-sm">{partners.length} total partners</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex gap-2">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === t ? 'bg-[#83C52B] text-white' : 'bg-[#F5F7F3] text-[#0B1F33]'}`}>
              {t}
            </button>
          ))}
        </div>

        {!loading && filtered.length === 0 ? (
          <p className="text-[#0B1F33]/40 text-sm py-16 text-center">No partners found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Business Name', 'Owner', 'City', 'Listings', 'Bookings', 'Revenue', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-[#F5F7F3] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#EAF5D9] rounded-xl flex items-center justify-center text-xs font-bold text-[#0B1F33]">
                        {p.business_name[0].toUpperCase()}
                      </div>
                      <span className="text-[#0B1F33] font-semibold text-sm">{p.business_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#0B1F33]/70 text-sm">{p.name}</td>
                  <td className="px-5 py-4 text-[#0B1F33]/70 text-sm">{p.city || "—"}</td>
                  <td className="px-5 py-4 text-[#0B1F33] font-bold text-sm">{p.listing_count}</td>
                  <td className="px-5 py-4 text-[#0B1F33] font-bold text-sm">{p.booking_count}</td>
                  <td className="px-5 py-4 text-[#0B1F33] font-bold text-sm">₹{Number(p.revenue).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/admin/partners/${p.id}`)} className="text-[#83C52B] text-xs font-semibold hover:underline">View</button>
                      <span className="text-gray-200">|</span>
                      <button onClick={() => toggleStatus(p)} disabled={busyId === p.id}
                        className={`text-xs font-semibold disabled:opacity-50 ${p.status === 'active' ? 'text-red-400' : 'text-[#83C52B]'}`}>
                        {p.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
