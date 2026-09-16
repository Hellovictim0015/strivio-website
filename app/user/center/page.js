"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format";
const tabs = ["Overview", "Plans", "Details", "Location"];
const PERIOD_LABELS = { day: "/day", session: "/session", month: "/month", quarter: "/quarter", year: "/year" };

function CenterDetailsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) {
      setError("No center selected");
      setLoading(false);
      return;
    }
    fetch(`/api/listings/${id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => setListing(d.listing))
      .catch(() => setError("This center could not be found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-8 py-16 text-center text-[#0B1F33]/50">Loading…</div>;
  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16 text-center">
        <p className="text-[#0B1F33]/50 mb-4">{error || "Center not found."}</p>
        <button onClick={() => router.push("/user/centers")} className="text-[#83C52B] font-semibold">← Back to centers</button>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [FALLBACK_IMG];
  const services = listing.services
    ? listing.services.split(/\n|,/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:h-72 max-w-7xl mx-auto px-8 pt-8">
        <div className="md:col-span-2 rounded-2xl overflow-hidden relative group cursor-pointer h-56 md:h-full" onClick={() => setActiveImg(0)}>
          <img src={images[activeImg] || images[0]} alt={listing.name} className="w-full h-full object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="grid grid-rows-2 gap-2 h-40 md:h-full">
          {(images.slice(1, 3).length ? images.slice(1, 3) : [images[0]]).map((img, i) => (
            <div key={i} className="rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setActiveImg(i + 1)}>
              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-[#0B1F33] font-black text-3xl">{listing.name}</h1>
                  <span className="bg-[#EAF5D9] text-[#83C52B] text-xs font-bold px-3 py-1 rounded-full">{listing.category_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#0B1F33]/60 flex-wrap">
                  {listing.city && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {listing.address ? `${listing.address}, ` : ""}{listing.city}
                    </span>
                  )}
                  {(listing.opening_time || listing.closing_time) && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {listing.opening_time || "—"} – {listing.closing_time || "—"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 mb-6">
              <div className="flex gap-1">
                {tabs.map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === t ? 'border-[#83C52B] text-[#83C52B]' : 'border-transparent text-[#0B1F33]/50 hover:text-[#0B1F33]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "Overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-[#0B1F33] font-bold text-base mb-3">About {listing.name}</h3>
                  <p className="text-[#0B1F33]/60 leading-relaxed">{listing.description || "No description provided."}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-[#0B1F33] font-bold text-base mb-1">Managed by</h3>
                  <p className="text-[#0B1F33]/60 text-sm">{listing.partner_name}</p>
                </div>
              </div>
            )}

            {activeTab === "Plans" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(listing.plans || []).map((p) => (
                  <div key={p.id} className="rounded-2xl p-5 border-2 border-gray-100 bg-white hover:border-[#83C52B]/40 transition-colors">
                    <p className="text-[#0B1F33] font-bold text-sm mb-1">{p.label || PERIOD_LABELS[p.period]?.replace('/', 'Per ').replace(/^./, (c) => c.toUpperCase()) || p.period}</p>
                    {p.persons && <p className="text-[#0B1F33]/50 text-xs mb-2">For {p.persons} {p.persons === 1 ? 'person' : 'persons'}</p>}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-[#0B1F33] font-black text-2xl">₹{Number(p.price).toLocaleString()}</span>
                      <span className="text-[#0B1F33]/50 text-xs">{PERIOD_LABELS[p.period]}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/user/booking?listingId=${listing.id}&planId=${p.id}`)}
                      className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-2.5 text-sm hover:bg-[#74b024] transition-colors"
                    >
                      Book This Plan
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Details" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {services.length === 0 ? (
                  <p className="text-[#0B1F33]/50 text-sm">No additional details provided.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map((s) => (
                      <div key={s} className="flex items-center gap-2 bg-[#F5F7F3] rounded-xl px-3 py-2.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        <span className="text-[#0B1F33] text-xs font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Location" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="bg-[#F5F7F3] rounded-xl h-40 flex items-center justify-center mb-3">
                  <div className="text-center">
                    <span className="text-5xl">🗺️</span>
                    <p className="text-[#0B1F33]/40 text-sm mt-2">{listing.address || listing.city || "Address not provided"}</p>
                  </div>
                </div>
                <p className="text-[#0B1F33]/60 text-sm">{[listing.address, listing.city].filter(Boolean).join(", ") || "No address on file."}</p>
                {listing.phone && <p className="text-[#0B1F33]/60 text-sm mt-2">📞 {listing.phone}</p>}
              </div>
            )}
          </div>

          <aside className="w-full md:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <p className="text-[#0B1F33]/50 text-xs font-semibold uppercase tracking-wider mb-1">Starting from</p>
              <p className="text-[#0B1F33] font-black text-3xl mb-5">₹{Number(listing.price).toLocaleString()}<span className="text-base font-medium text-[#0B1F33]/50">/{listing.price_period}</span></p>
              <button onClick={() => setActiveTab("Plans")} className="w-full bg-[#83C52B] text-white font-bold rounded-2xl py-3.5 text-sm hover:bg-[#74b024] transition-colors mb-3">
                View Plans & Book
              </button>
              {listing.phone && (
                <a href={`tel:${listing.phone}`} className="block text-center w-full bg-[#F5F7F3] text-[#0B1F33] font-bold rounded-2xl py-3 text-sm border border-gray-100">
                  📞 Contact Center
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CenterDetails() {
  return (
    <Suspense fallback={null}>
      <CenterDetailsInner />
    </Suspense>
  );
}
