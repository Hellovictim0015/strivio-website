"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const priceOptions = [
  { label: "Any price", max: null },
  { label: "Under ₹1000", max: 1000 },
  { label: "₹1000–₹2000", max: 2000 },
  { label: "₹2000+", max: null },
];

export default function Search() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(priceOptions[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    const t = setTimeout(() => {
      fetch(`/api/listings?${params.toString()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setResults(d.listings || []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, selectedCategory]);

  const filtered = results.filter((r) => {
    if (selectedPrice.label === "Under ₹1000") return r.price < 1000;
    if (selectedPrice.label === "₹1000–₹2000") return r.price >= 1000 && r.price <= 2000;
    if (selectedPrice.label === "₹2000+") return r.price > 2000;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-[#0B1F33] font-black text-3xl mb-2">Search & Filters</h1>
        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 border border-gray-100 max-w-2xl shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent text-sm text-[#0B1F33] outline-none flex-1 placeholder:text-[#0B1F33]/40" placeholder="Search gyms, yoga, dance classes..." autoFocus />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-[#0B1F33] font-black text-base mb-5">Filters</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-[#0B1F33] font-bold text-xs uppercase tracking-wider mb-3">Activity</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory("")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${!selectedCategory ? 'bg-[#83C52B] text-white' : 'bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]'}`}>
                    All
                  </button>
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => setSelectedCategory(String(c.id))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${selectedCategory === String(c.id) ? 'bg-[#83C52B] text-white' : 'bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[#0B1F33] font-bold text-xs uppercase tracking-wider mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceOptions.map((p) => (
                    <label key={p.label} className="flex items-center gap-3 cursor-pointer group">
                      <div onClick={() => setSelectedPrice(p)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPrice.label === p.label ? 'border-[#83C52B] bg-[#83C52B]' : 'border-gray-300 group-hover:border-[#83C52B]'}`}>
                        {selectedPrice.label === p.label && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-[#0B1F33]/70 text-sm">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[#0B1F33] font-semibold text-sm">
              <span className="font-black text-xl text-[#0B1F33]">{filtered.length}</span>
              <span className="text-[#0B1F33]/50 ml-2">centers found</span>
            </p>
          </div>

          {!loading && filtered.length === 0 && <p className="text-[#0B1F33]/40 text-sm py-10">No results. Try a different filter.</p>}

          <div className="space-y-4">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/user/center?id=${c.id}`)}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex text-left hover:shadow-md transition-shadow group"
              >
                <img src={c.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=300&fit=crop&auto=format"} alt={c.name} className="w-40 md:w-56 h-40 object-cover flex-shrink-0 bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
                <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[#0B1F33] font-bold text-base truncate">{c.name}</p>
                        <span className="inline-block bg-[#EAF5D9] text-[#83C52B] text-[10px] font-bold px-2.5 py-1 rounded-full mt-1">{c.category_name}</span>
                      </div>
                      <span className="text-[#83C52B] font-black text-lg flex-shrink-0">₹{Number(c.price).toLocaleString()}</span>
                    </div>
                    <p className="text-[#0B1F33]/50 text-sm mt-3">{c.city || c.partner_name}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="bg-[#0B1F33] text-white text-xs font-bold px-5 py-2.5 rounded-xl">View Details</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
