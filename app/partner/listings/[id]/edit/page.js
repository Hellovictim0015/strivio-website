"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PlansEditor, { newPlan } from "../../PlansEditor";

export default function EditListing() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [plans, setPlans] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/partner/listings/${id}`, { cache: "no-store" }).then((r) => r.json()),
    ]).then(([catData, listingData]) => {
      setCategories(catData.categories || []);
      const l = listingData.listing;
      if (l) {
        setForm({
          name: l.name, categoryId: String(l.category_id), description: l.description || "",
          address: l.address || "", city: l.city || "",
          phone: l.phone || "", openingTime: l.opening_time || "", closingTime: l.closing_time || "",
          services: l.services || "",
        });
        setPlans(
          (l.plans && l.plans.length > 0 ? l.plans : [{ period: l.price_period, price: l.price, persons: null, label: null }]).map((p) => ({
            key: `existing-${p.id ?? Math.random()}`,
            period: p.period,
            price: p.price,
            persons: p.persons ?? "",
            label: p.label ?? "",
          }))
        );
        setExistingImages(l.images || []);
      } else {
        setError("Listing not found");
      }
    }).finally(() => setInitialLoading(false));
  }, [id]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("plans", JSON.stringify(plans.map(({ period, price, persons, label }) => ({ period, price, persons: persons || null, label }))));
      fd.append("keepExistingImages", "true");
      newFiles.forEach((f) => fd.append("images", f));

      const res = await fetch(`/api/partner/listings/${id}`, { method: "PUT", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update listing");
        return;
      }
      router.push("/partner/listings");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return <p className="text-[#0B1F33]/50 text-sm">Loading…</p>;
  if (!form) return <p className="text-red-500 text-sm">{error || "Listing not found"}</p>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.push('/partner/listings')} className="flex items-center gap-2 text-[#0B1F33]/50 hover:text-[#0B1F33] text-sm font-medium mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Listings
      </button>
      <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Edit Listing</h1>
      <p className="text-[#0B1F33]/50 text-sm mb-6">Saving changes sends this listing back for admin review.</p>

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

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Opening time</label>
            <input value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Closing time</label>
            <input value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] resize-none" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Services / details (one per line)</label>
            <textarea rows={3} value={form.services} onChange={(e) => update("services", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] resize-none" />
          </div>

          {existingImages.length > 0 && (
            <div className="col-span-2">
              <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Current photos</label>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img) => (
                  <img key={img} src={img} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                ))}
              </div>
            </div>
          )}

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Add more photos</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setNewFiles(Array.from(e.target.files || []))}
              className="w-full text-sm text-[#0B1F33]" />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3 hover:bg-[#74b024] transition-colors disabled:opacity-60">
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
