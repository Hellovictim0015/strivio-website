"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { categoryEmoji } from "@/lib/categoryIcon";

export default function UserHome() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, listRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/listings", { cache: "no-store" }),
        ]);
        const catData = await catRes.json();
        const listData = await listRes.json();
        setCategories(catData.categories || []);
        setListings((listData.listings || []).slice(0, 6));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0B1F33] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=600&fit=crop&auto=format"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#83C52B]/20 border border-[#83C52B]/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-[#83C52B] rounded-full animate-pulse"></div>
              <span className="text-[#83C52B] text-sm font-semibold">{listings.length > 0 ? `${listings.length}+ Centers` : "Discover Centers"}</span>
            </div>
            <h1 className="text-white font-black text-5xl leading-tight mb-4">
              Find Your Perfect<br /><span className="text-[#83C52B]">Fitness Space</span>
            </h1>
            <p className="text-white/60 text-lg mb-8">Discover gyms, sports academies and wellness centers near you. Book instantly, move freely.</p>

            {/* Search */}
            <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-2xl max-w-xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="flex-1 text-sm text-[#0B1F33] outline-none placeholder:text-[#0B1F33]/40 bg-transparent"
                  placeholder="Search gyms, yoga, swimming..."
                  onFocus={() => router.push('/user/search')}
                />
              </div>
              <button
                onClick={() => router.push('/user/centers')}
                className="bg-[#83C52B] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#74b024] transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-14">
        {/* Activity Categories */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-[#0B1F33] font-black text-2xl">Browse by Activity</h2>
              <p className="text-[#0B1F33]/50 text-sm mt-1">Find your favorite fitness activity</p>
            </div>
            <button onClick={() => router.push('/user/explore')} className="text-[#83C52B] font-semibold text-sm hover:underline">
              View all activities →
            </button>
          </div>
          {!loading && categories.length === 0 && (
            <p className="text-[#0B1F33]/40 text-sm">No activity categories yet. Check back soon.</p>
          )}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/user/centers?category=${cat.id}`)}
                className="bg-white rounded-2xl py-5 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:border-[#83C52B]/40 hover:shadow-md transition-all group overflow-hidden"
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <span className="text-3xl group-hover:scale-110 transition-transform">{categoryEmoji(cat.name)}</span>
                )}
                <span className="text-[#0B1F33] text-xs font-bold">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Nearby Centers */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-[#0B1F33] font-black text-2xl">Nearby Centers</h2>
              <p className="text-[#0B1F33]/50 text-sm mt-1">{listings.length} centers available</p>
            </div>
            <button onClick={() => router.push('/user/centers')} className="text-[#83C52B] font-semibold text-sm hover:underline">
              View all centers →
            </button>
          </div>
          {!loading && listings.length === 0 && (
            <p className="text-[#0B1F33]/40 text-sm">No approved centers yet. Check back soon.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map((center) => (
              <div
                key={center.id}
                onClick={() => router.push(`/user/center?id=${center.id}`)}
                role="button"
                tabIndex={0}
                className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={center.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=360&fit=crop&auto=format"}
                    alt={center.name}
                    className="w-full h-48 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EAF5D9] text-[#83C52B]">{center.category_name}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[#0B1F33] font-bold text-base truncate">{center.name}</p>
                      <p className="text-[#0B1F33]/50 text-xs mt-0.5">{center.city || center.partner_name}</p>
                    </div>
                    <span className="text-[#83C52B] font-bold text-sm flex-shrink-0">₹{Number(center.price).toLocaleString()}/{center.price_period}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-[#0B1F33] text-xs font-semibold group-hover:text-[#83C52B] transition-colors">View Details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-[#0B1F33] rounded-3xl overflow-hidden relative">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=300&fit=crop&auto=format" alt="CTA" className="absolute inset-0 w-full h-full object-cover opacity-15" />
          <div className="relative px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-white font-black text-3xl mb-2">Ready to Start Your Fitness Journey?</h2>
              <p className="text-white/60">Discover centers that fit your goals and book in seconds.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => router.push('/user/explore')} className="bg-[#83C52B] text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#74b024] transition-colors">
                Explore Centers
              </button>
              <button onClick={() => router.push('/user/events')} className="bg-white/10 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/20 transition-colors border border-white/20">
                View Events
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
