"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { distanceKm } from "@/lib/geo";

const NEARBY_RADIUS_KM = 2.5;

function ListingCard({ c, router, distance }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="relative overflow-hidden">
        <img
          src={c.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=360&fit=crop&auto=format"}
          alt={c.name}
          className="w-full h-48 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EAF5D9] text-[#83C52B]">{c.category_name}</span>
        </div>
        {distance != null && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#0B1F33]">📍 {distance.toFixed(1)} km</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[#0B1F33] font-bold text-base">{c.name}</p>
            <p className="text-[#0B1F33]/50 text-xs mt-0.5">{c.city || c.partner_name}</p>
          </div>
          <span className="text-[#83C52B] font-bold text-sm flex-shrink-0 ml-2">₹{Number(c.price).toLocaleString()}/{c.price_period}</span>
        </div>
        <button onClick={() => router.push(`/user/center?id=${c.id}`)} className="w-full bg-[#0B1F33] text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-[#071525] transition-colors mt-3">
          View Details
        </button>
      </div>
    </div>
  );
}

function CenterListingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sort, setSort] = useState("recommended");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    fetch(`/api/listings?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationDenied(true)
    );
  }

  useEffect(() => {
    requestLocation();
  }, []);

  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      if (sort === "price_low") return a.price - b.price;
      if (sort === "price_high") return b.price - a.price;
      return 0;
    });
  }, [listings, sort]);

  const withDistance = useMemo(() => {
    return sortedListings.map((c) => ({
      ...c,
      distance:
        userLocation && c.latitude != null && c.longitude != null
          ? distanceKm(userLocation.lat, userLocation.lng, Number(c.latitude), Number(c.longitude))
          : null,
    }));
  }, [sortedListings, userLocation]);

  const hasDistances = userLocation && withDistance.some((c) => c.distance != null);
  const nearby = hasDistances ? withDistance.filter((c) => c.distance != null && c.distance <= NEARBY_RADIUS_KM) : [];
  const others = hasDistances ? withDistance.filter((c) => !(c.distance != null && c.distance <= NEARBY_RADIUS_KM)) : withDistance;

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[#0B1F33] font-black text-3xl">Fitness Centers Near You</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-1">{listings.length} centers found</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveCategory("")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${!activeCategory ? 'bg-[#83C52B] text-white' : 'bg-white text-[#0B1F33] border border-gray-100 hover:border-[#83C52B]/40'}`}>
              All
            </button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(String(c.id))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeCategory === String(c.id) ? 'bg-[#83C52B] text-white' : 'bg-white text-[#0B1F33] border border-gray-100 hover:border-[#83C52B]/40'}`}>
                {c.name}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm text-[#0B1F33] outline-none">
            <option value="recommended">Sort: Recommended</option>
            <option value="price_low">Sort: Price (Low to High)</option>
            <option value="price_high">Sort: Price (High to Low)</option>
          </select>
        </div>
      </div>

      {locationDenied && !userLocation && (
        <div className="bg-[#F5F7F3] rounded-xl px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[#0B1F33]/50 text-sm">Enable location to see centers within {NEARBY_RADIUS_KM} km of you.</p>
          <button onClick={requestLocation} className="text-[#83C52B] text-xs font-bold hover:underline">Enable location</button>
        </div>
      )}

      {!loading && sortedListings.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-[#0B1F33]/50">No centers found for this filter yet.</p>
        </div>
      )}

      {hasDistances ? (
        <>
          <section className="mb-10">
            <h2 className="text-[#0B1F33] font-bold text-lg mb-4">Nearby (within {NEARBY_RADIUS_KM} km)</h2>
            {nearby.length === 0 ? (
              <p className="text-[#0B1F33]/40 text-sm">No centers within {NEARBY_RADIUS_KM} km of you yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nearby.map((c) => <ListingCard key={c.id} c={c} router={router} distance={c.distance} />)}
              </div>
            )}
          </section>

          {others.length > 0 && (
            <section>
              <h2 className="text-[#0B1F33] font-bold text-lg mb-4">Other Centers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {others.map((c) => <ListingCard key={c.id} c={c} router={router} distance={c.distance} />)}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {withDistance.map((c) => <ListingCard key={c.id} c={c} router={router} distance={c.distance} />)}
        </div>
      )}
    </div>
  );
}

export default function CenterListing() {
  return (
    <Suspense fallback={null}>
      <CenterListingInner />
    </Suspense>
  );
}
