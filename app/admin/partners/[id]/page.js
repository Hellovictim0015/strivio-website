"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const STATUS_STYLES = {
  PENDING: "bg-orange-50 text-orange-500",
  APPROVED: "bg-[#EAF5D9] text-[#83C52B]",
  REJECTED: "bg-red-50 text-red-400",
};

export default function AdminPartnerDetail() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/partners/${params.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-[#0B1F33]/50 text-sm">Loading…</p>;
  if (!data?.partner) return <p className="text-red-500 text-sm">Partner not found.</p>;

  const { partner, listings } = data;

  return (
    <div>
      <button onClick={() => router.push('/admin/partners')} className="flex items-center gap-2 text-[#0B1F33]/50 hover:text-[#0B1F33] text-sm font-medium mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Partners
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[#0B1F33] font-black text-2xl">{partner.business_name}</h1>
            <p className="text-[#0B1F33]/50 text-sm mt-1">{partner.name} · {partner.email} · {partner.phone}</p>
            <p className="text-[#0B1F33]/40 text-sm mt-1">{[partner.address, partner.city].filter(Boolean).join(", ") || "No address"}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${partner.status === 'active' ? 'bg-[#EAF5D9] text-[#83C52B]' : 'bg-red-50 text-red-400'}`}>{partner.status}</span>
        </div>
        {partner.description && <p className="text-[#0B1F33]/60 text-sm mt-4">{partner.description}</p>}
      </div>

      <h2 className="text-[#0B1F33] font-bold text-lg mb-3">Listings ({listings.length})</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {listings.length === 0 ? (
          <p className="text-[#0B1F33]/40 text-sm py-10 text-center">No listings from this partner yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Category', 'Price', 'Status', 'Active'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 text-[#0B1F33] font-semibold text-sm">{l.name}</td>
                  <td className="px-5 py-3 text-[#0B1F33]/60 text-sm">{l.category_name}</td>
                  <td className="px-5 py-3 text-[#0B1F33]/60 text-sm">₹{Number(l.price).toLocaleString()}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[l.status]}`}>{l.status}</span></td>
                  <td className="px-5 py-3 text-[#0B1F33]/60 text-sm">{l.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
