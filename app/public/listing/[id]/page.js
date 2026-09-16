"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format";
const PERIOD_LABELS = { day: "/day", session: "/session", month: "/month", quarter: "/quarter", year: "/year" };
function planTitle(p) {
  return p.label || { day: "Daily", session: "Per Session", month: "Monthly", quarter: "Quarterly", year: "Annual" }[p.period] || p.period;
}

export default function PublicListingPage() {
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/listings/${params.id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => setListing(d.listing))
      .catch(() => setError("This listing is not available."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen bg-[#F5F7F3] flex items-center justify-center text-[#0B1F33]/50">Loading…</div>;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#F5F7F3] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#0B1F33]/50 mb-4">{error || "Listing not found."}</p>
          <button onClick={() => router.push('/')} className="text-[#83C52B] font-semibold">← Back to STRIVIO</button>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [FALLBACK_IMG];
  const services = listing.services ? listing.services.split(/\n|,/).map((s) => s.trim()).filter(Boolean) : [];

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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="rounded-2xl overflow-hidden h-64 mb-6">
          <img src={images[0]} alt={listing.name} className="w-full h-full object-cover" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="text-[#0B1F33] font-black text-2xl">{listing.name}</h1>
            <span className="bg-[#EAF5D9] text-[#83C52B] text-xs font-bold px-3 py-1 rounded-full">{listing.category_name}</span>
          </div>
          <p className="text-[#0B1F33]/50 text-sm mb-4">{[listing.address, listing.city].filter(Boolean).join(", ") || "Address not provided"}</p>

          <p className="text-[#0B1F33]/70 leading-relaxed mb-6">{listing.description || "No description provided."}</p>

          {services.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[#0B1F33] font-bold text-sm mb-3">Services</h3>
              <div className="grid grid-cols-2 gap-2">
                {services.map((s) => (
                  <div key={s} className="flex items-center gap-2 bg-[#F5F7F3] rounded-xl px-3 py-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[#0B1F33] text-xs font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            {listing.phone && <div><p className="text-[#0B1F33]/40 text-xs font-semibold uppercase">Phone</p><p className="text-[#0B1F33] font-bold mt-1">{listing.phone}</p></div>}
            {(listing.opening_time || listing.closing_time) && (
              <div><p className="text-[#0B1F33]/40 text-xs font-semibold uppercase">Hours</p><p className="text-[#0B1F33] font-bold mt-1">{listing.opening_time || "—"} – {listing.closing_time || "—"}</p></div>
            )}
          </div>

          {listing.plans?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[#0B1F33] font-bold text-sm mb-3">Pricing Plans</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listing.plans.map((p) => (
                  <div key={p.id} className="rounded-xl border border-gray-100 p-4">
                    <p className="text-[#0B1F33] font-bold text-sm">{planTitle(p)}</p>
                    {p.persons && <p className="text-[#0B1F33]/50 text-xs mt-0.5">For {p.persons} {p.persons === 1 ? 'person' : 'persons'}</p>}
                    <p className="text-[#0B1F33] font-black text-xl mt-2">₹{Number(p.price).toLocaleString()}<span className="text-xs font-medium text-[#0B1F33]/50">{PERIOD_LABELS[p.period]}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-[#0B1F33] rounded-2xl px-6 py-4">
            <div>
              <p className="text-white/50 text-xs">Starting from</p>
              <p className="text-white font-black text-2xl">₹{Number(listing.price).toLocaleString()}<span className="text-sm font-medium text-white/50">/{listing.price_period}</span></p>
            </div>
            <button onClick={() => router.push('/user/login')} className="bg-[#83C52B] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#74b024] transition-colors">
              Login to Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
