"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEvent() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", price: "", capacityType: "unlimited", totalSlots: "",
    location: "", latitude: "", longitude: "", eventTime: "",
  });
  const [file, setFile] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please add an event image");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", file);

      const res = await fetch("/api/partner/events", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create event");
        return;
      }
      router.push("/partner/events");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.push('/partner/events')} className="flex items-center gap-2 text-[#0B1F33]/50 hover:text-[#0B1F33] text-sm font-medium mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Events
      </button>
      <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Create New Event</h1>
      <p className="text-[#0B1F33]/50 text-sm mb-6">Your event will be reviewed by our team before it goes live.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Event name</label>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Price (₹) — 0 for free</label>
            <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Event date & time</label>
            <input required type="datetime-local" value={form.eventTime} onChange={(e) => update("eventTime", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Capacity</label>
            <div className="flex gap-3 mb-3">
              <button type="button" onClick={() => update("capacityType", "limited")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold border-2 transition-colors ${form.capacityType === 'limited' ? 'border-[#83C52B] bg-[#EAF5D9] text-[#0B1F33]' : 'border-gray-100 bg-white text-[#0B1F33]/60'}`}>
                Limited
              </button>
              <button type="button" onClick={() => update("capacityType", "unlimited")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold border-2 transition-colors ${form.capacityType === 'unlimited' ? 'border-[#83C52B] bg-[#EAF5D9] text-[#0B1F33]' : 'border-gray-100 bg-white text-[#0B1F33]/60'}`}>
                Unlimited
              </button>
            </div>
            {form.capacityType === "limited" && (
              <input
                required type="number" min="1" placeholder="Total slots (e.g. 50)"
                value={form.totalSlots} onChange={(e) => update("totalSlots", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
              />
            )}
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Location</label>
            <input placeholder="e.g. Cubbon Park, Bengaluru" value={form.location} onChange={(e) => update("location", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Latitude (optional)</label>
            <input type="number" step="0.0000001" min="-90" max="90" placeholder="12.9716" value={form.latitude} onChange={(e) => update("latitude", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div>
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Longitude (optional)</label>
            <input type="number" step="0.0000001" min="-180" max="180" placeholder="77.5946" value={form.longitude} onChange={(e) => update("longitude", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] resize-none" />
          </div>

          <div className="col-span-2">
            <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Event image (JPG/PNG/WEBP, up to 5MB)</label>
            <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-[#0B1F33]" />
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
