"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=360&fit=crop&auto=format";

export default function PublicPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/partners/${params.id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("This business is not available."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen bg-[#F5F7F3] flex items-center justify-center text-[#0B1F33]/50">Loading…</div>;
  }

  if (error || !data?.partner) {
    return (
      <div className="min-h-screen bg-[#F5F7F3] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#0B1F33]/50 mb-4">{error || "Business not found."}</p>
          <button onClick={() => router.push('/')} className="text-[#83C52B] font-semibold">← Back to STRIVIO</button>
        </div>
      </div>
    );
  }

  const { partner, listings } = data;

  return (
    <div className="min-h-screen bg-[#F5F7F3]">
      <header className="bg-[#0B1F33] px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#83C52B] rounded-lg flex items-center justify-center">
            <span className="text-[#0B1F33] font-black text-sm">S</span>
          </div>
          <span className="text-white font-black text-xl tracking-wide">STRIVIO</span>
        </button>
        <button onClick={() => router.push('/user/login')} className="bg-[#83C52B] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#74b024] transition-colors">
          Login to Book
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h1 className="text-[#0B1F33] font-black text-3xl mb-1">{partner.business_name}</h1>
          <p className="text-[#0B1F33]/50 text-sm mb-4">{[partner.address, partner.city].filter(Boolean).join(", ") || "Address not provided"}</p>
          {partner.description && <p className="text-[#0B1F33]/70 leading-relaxed mb-4">{partner.description}</p>}
          <div className="flex gap-6 text-sm">
            {partner.phone && (
              <div>
                <p className="text-[#0B1F33]/40 text-xs font-semibold uppercase">Phone</p>
                <p className="text-[#0B1F33] font-bold mt-1">{partner.phone}</p>
              </div>
            )}
            <div>
              <p className="text-[#0B1F33]/40 text-xs font-semibold uppercase">Listings</p>
              <p className="text-[#0B1F33] font-bold mt-1">{listings.length} available</p>
            </div>
          </div>
        </div>

        <h2 className="text-[#0B1F33] font-black text-xl mb-4">Available Listings</h2>
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <p className="text-[#0B1F33]/50">No listings available from this business right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <div
                key={l.id}
                onClick={() => router.push(`/public/listing/${l.id}`)}
                role="button"
                tabIndex={0}
                className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <img src={l.images?.[0] || FALLBACK_IMG} alt={l.name} className="w-full h-40 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[#0B1F33] font-bold text-sm truncate">{l.name}</p>
                      <span className="inline-block bg-[#EAF5D9] text-[#83C52B] text-[10px] font-bold px-2.5 py-1 rounded-full mt-1">{l.category_name}</span>
                    </div>
                    <span className="text-[#83C52B] font-bold text-sm flex-shrink-0">₹{Number(l.price).toLocaleString()}/{l.price_period}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
