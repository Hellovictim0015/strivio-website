"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlansEditor, { newPlan } from "../PlansEditor";

export default function CreateListing() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", categoryId: "", description: "",
    address: "", city: "", phone: "", openingTime: "", closingTime: "", services: "",
    latitude: "", longitude: "",
  });
  const [locating, setLocating] = useState(false);
  const [plans, setPlans] = useState([newPlan()]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("latitude", pos.coords.latitude.toFixed(7));
        update("longitude", pos.coords.longitude.toFixed(7));
        setLocating(false);
      },
      () => {
        setError("Could not get your location — please enter it manually");
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("plans", JSON.stringify(plans.map(({ period, price, persons, label }) => ({ period, price, persons: persons || null, label }))));
      files.forEach((f) => fd.append("images", f));

      const res = await fetch("/api/partner/listings", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create listing");
        return;
      }
      router.push("/partner/listings");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.push('/partner/listings')} className="flex items-center gap-2 text-[#0B1F33]/50 hover:text-[#0B1F33] text-sm font-medium mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Listings
      </button>
      <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Create New Listing</h1>
      <p className="text-[#0B1F33]/50 text-sm mb-6">Your listing will be reviewed by our team before it goes live.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Business / Center name</label>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Category</label>
            <select required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Phone</label>
            <input required value={form.phone} onChange={(e) => update("phone", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <PlansEditor plans={plans} onChange={setPlans} />

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">City</label>
            <input value={form.city} onChange={(e) => update("city", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Address</label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#0B1F33]/60 text-xs font-semibold block">Location coordinates (optional — lets nearby users find this center)</label>
              <button type="button" onClick={useCurrentLocation} disabled={locating} className="text-[#83C52B] text-xs font-bold hover:underline disabled:opacity-50">
                {locating ? "Locating…" : "📍 Use my current location"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.0000001" min="-90" max="90" placeholder="Latitude, e.g. 12.9716" value={form.latitude} onChange={(e) => update("latitude", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              <input type="number" step="0.0000001" min="-180" max="180" placeholder="Longitude, e.g. 77.5946" value={form.longitude} onChange={(e) => update("longitude", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
            </div>
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Opening time</label>
            <input placeholder="6:00 AM" value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Closing time</label>
            <input placeholder="10:00 PM" value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] resize-none" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Services / details (one per line)</label>
            <textarea rows={3} placeholder={"Personal Training\nGroup Classes\nLocker Access"} value={form.services} onChange={(e) => update("services", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] resize-none" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Photos (JPG/PNG/WEBP, up to 5MB each)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full text-sm text-[#0B1F33]" />
            {files.length > 0 && <p className="text-[#0B1F33]/40 text-xs mt-1">{files.length} file(s) selected</p>}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3 hover:bg-[#74b024] transition-colors disabled:opacity-60">
          {loading ? "Submitting…" : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
