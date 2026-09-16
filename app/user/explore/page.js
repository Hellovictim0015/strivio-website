"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryEmoji } from "@/lib/categoryIcon";

export default function Explore() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selected) params.set("category", selected);
    if (search) params.set("q", search);
    fetch(`/api/listings?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .finally(() => setLoading(false));
  }, [selected, search]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[#0B1F33] font-black text-3xl">Explore</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-1">Discover fitness centers and activities near you</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 w-full md:w-80">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm text-[#0B1F33] outline-none flex-1 placeholder:text-[#0B1F33]/40" placeholder="Search activities, centers..." />
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-[#0B1F33] font-bold text-lg mb-4">Browse by Activity</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(String(c.id))}
              className={`bg-white rounded-2xl py-5 flex flex-col items-center gap-2 shadow-sm border transition-all group ${selected === String(c.id) ? 'border-[#83C52B]' : 'border-gray-100 hover:border-[#83C52B]/40 hover:shadow-md'}`}
            >
              {c.image ? (
                <img src={c.image} alt={c.name} className="w-9 h-9 rounded-full object-cover group-hover:scale-110 transition-transform" />
              ) : (
                <span className="text-3xl group-hover:scale-110 transition-transform">{categoryEmoji(c.name)}</span>
              )}
              <span className="text-[#0B1F33] text-xs font-bold">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-[#0B1F33] font-semibold text-sm mr-2">Filter:</span>
        <button onClick={() => setSelected("")} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${!selected ? 'bg-[#83C52B] text-white' : 'bg-white text-[#0B1F33] border border-gray-100 hover:border-[#83C52B]/40'}`}>
          All
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setSelected(String(c.id))}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${selected === String(c.id) ? 'bg-[#83C52B] text-white' : 'bg-white text-[#0B1F33] border border-gray-100 hover:border-[#83C52B]/40'}`}>
            {c.name}
          </button>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#0B1F33] font-bold text-lg">{listings.length} Centers Found</h2>
          <button onClick={() => router.push('/user/centers')} className="text-[#83C52B] text-sm font-semibold hover:underline">See all →</button>
        </div>
        {!loading && listings.length === 0 && <p className="text-[#0B1F33]/40 text-sm">No centers found.</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/user/center?id=${c.id}`)}
              role="button"
              tabIndex={0}
              className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="relative overflow-hidden">
                <img src={c.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=360&fit=crop&auto=format"} alt={c.name} className="w-full h-44 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full text-[#0B1F33]">{c.category_name}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <p className="text-[#0B1F33] font-bold text-sm">{c.name}</p>
                  <span className="text-[#83C52B] font-bold text-sm">₹{Number(c.price).toLocaleString()}/{c.price_period}</span>
                </div>
                <p className="text-[#0B1F33]/40 text-xs mt-2">{c.city || c.partner_name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
