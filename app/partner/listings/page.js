"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES = {
  PENDING: "bg-orange-50 text-orange-500",
  APPROVED: "bg-[#EAF5D9] text-[#83C52B]",
  REJECTED: "bg-red-50 text-red-400",
};

export default function PartnerListings() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/partner/listings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleActive(listing) {
    setBusyId(listing.id);
    try {
      const method = listing.is_active ? "DELETE" : "PATCH";
      const res = await fetch(`/api/partner/listings/${listing.id}`, {
        method,
        headers: method === "PATCH" ? { "Content-Type": "application/json" } : undefined,
        body: method === "PATCH" ? JSON.stringify({ isActive: true }) : undefined,
      });
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  function downloadQr(listing, format) {
    window.open(`/api/partner/listings/${listing.id}/qr?format=${format}`, "_blank");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0B1F33] font-black text-2xl">My Listings</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-1">Manage your centers and their approval status</p>
        </div>
        <button onClick={() => router.push('/partner/listings/create')} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] transition-colors">
          + New Listing
        </button>
      </div>

      {!loading && listings.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-[#0B1F33]/50 mb-4">You haven&apos;t created any listings yet.</p>
          <button onClick={() => router.push('/partner/listings/create')} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm">Create your first listing</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {listings.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-36">
              <img src={l.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=360&fit=crop&auto=format"} alt={l.name} className="w-full h-full object-cover bg-gray-100" />
              <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[l.status]}`}>{l.status}</span>
              {!l.is_active && <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-800/80 text-white">Deactivated</span>}
            </div>
            <div className="p-4">
              <p className="text-[#0B1F33] font-bold text-base truncate">{l.name}</p>
              <p className="text-[#0B1F33]/50 text-xs mt-0.5">{l.category_name} · from ₹{Number(l.price).toLocaleString()}/{l.price_period} · {l.plans?.length || 0} plan(s)</p>
              {l.status === 'REJECTED' && l.rejection_reason && (
                <p className="text-red-400 text-xs mt-2 bg-red-50 rounded-lg px-2 py-1.5">Reason: {l.rejection_reason}</p>
              )}
              <p className="text-[#0B1F33]/40 text-xs mt-2">{l.booking_count} booking(s)</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => router.push(`/partner/listings/${l.id}/edit`)} className="text-xs font-bold px-3 py-2 rounded-xl bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]">Edit</button>
                <button onClick={() => downloadQr(l, 'png')} className="text-xs font-bold px-3 py-2 rounded-xl bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]">QR (PNG)</button>
                <button onClick={() => downloadQr(l, 'svg')} className="text-xs font-bold px-3 py-2 rounded-xl bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]">QR (SVG)</button>
                <button
                  onClick={() => toggleActive(l)}
                  disabled={busyId === l.id}
                  className={`text-xs font-bold px-3 py-2 rounded-xl ml-auto disabled:opacity-50 ${l.is_active ? 'bg-red-50 text-red-400 hover:bg-red-100' : 'bg-[#EAF5D9] text-[#83C52B] hover:bg-[#dcefc4]'}`}
                >
                  {l.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
