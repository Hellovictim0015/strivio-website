"use client";

import { useEffect, useState } from "react";
import SessionsEditor, { newSession } from "./SessionsEditor";

const STATUS_STYLES = {
  PENDING: "bg-orange-50 text-orange-500",
  APPROVED: "bg-[#EAF5D9] text-[#83C52B]",
  REJECTED: "bg-red-50 text-red-400",
};

export default function CenterManagement() {
  const [partner, setPartner] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [publicUrl, setPublicUrl] = useState("");

  const [sessions, setSessions] = useState([]);
  const [sessionsEditing, setSessionsEditing] = useState(false);
  const [sessionsForm, setSessionsForm] = useState([]);
  const [sessionsSaving, setSessionsSaving] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/partner/me", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/partner/listings", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/partner/sessions", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([meData, listingsData, sessionsData]) => {
      setPartner(meData.partner);
      setListings(listingsData.listings || []);
      setSessions(sessionsData.sessions || []);
      setPublicUrl(`${window.location.origin}/public/partner/${meData.partner.id}`);
    }).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEditSessions() {
    setSessionsForm(
      sessions.length > 0
        ? sessions.map((s) => ({ key: `existing-${s.id}`, label: s.label, startTime: s.start_time || "", endTime: s.end_time || "" }))
        : [newSession()]
    );
    setSessionsError("");
    setSessionsEditing(true);
  }

  async function saveSessions() {
    setSessionsError("");
    setSessionsSaving(true);
    try {
      const res = await fetch("/api/partner/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions: sessionsForm.map(({ label, startTime, endTime }) => ({ label, startTime, endTime })) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not save session slots");
        return;
      }
      setSessions(data.sessions || []);
      setSessionsEditing(false);
    } catch {
      setSessionsError("Network error. Please try again.");
    } finally {
      setSessionsSaving(false);
    }
  }

  function startEdit() {
    setForm({
      name: partner.name,
      businessName: partner.business_name,
      phone: partner.phone,
      address: partner.address || "",
      city: partner.city || "",
      description: partner.description || "",
    });
    setError("");
    setEditing(true);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/partner/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save profile");
        return;
      }
      setPartner(data.partner);
      setEditing(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const gallery = listings.flatMap((l) => l.images || []).slice(0, 10);

  if (loading || !partner) {
    return <p className="text-[#0B1F33]/50 text-sm">Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[#0B1F33] font-black text-2xl">Center Management</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-0.5">Manage your business profile and see your listings at a glance</p>
        </div>
        {!editing && (
          <button onClick={startEdit} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] transition-colors">
            Edit Profile
          </button>
        )}
      </div>

      {/* Cover + Info */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-5">
        <div className="relative h-40">
          <img src={gallery[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop&auto=format"} alt="Cover" className="w-full h-full object-cover opacity-60" style={{ background: "#0B1F33" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F33]/80 to-transparent flex items-end p-6">
            <div>
              <h2 className="text-white font-black text-2xl">{partner.business_name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${partner.status === "active" ? "bg-[#83C52B] text-white" : "bg-red-400 text-white"}`}>
                  ● {partner.status === "active" ? "ACTIVE" : "DISABLED"}
                </span>
                <span className="text-white/60 text-sm">{[partner.address, partner.city].filter(Boolean).join(", ") || "No address on file"}</span>
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={saveProfile} className="px-6 py-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              <input required placeholder="Business name" value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              <input placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] md:col-span-2" />
              <textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] md:col-span-2 resize-none" />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="bg-[#F5F7F3] text-[#0B1F33] font-bold px-5 py-2.5 rounded-xl text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Phone", value: partner.phone, icon: "📞" },
              { label: "Owner", value: partner.name, icon: "👤" },
              { label: "Listings", value: `${listings.length} total`, icon: "📋" },
              { label: "Email", value: partner.email, icon: "✉️" },
            ].map((info) => (
              <div key={info.label} className="flex items-center gap-3 min-w-0">
                <span className="text-xl">{info.icon}</span>
                <div className="min-w-0">
                  <p className="text-[#0B1F33]/40 text-[10px] font-semibold uppercase">{info.label}</p>
                  <p className="text-[#0B1F33] text-sm font-semibold truncate">{info.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {!editing && partner.description && (
          <div className="px-6 pb-5">
            <p className="text-[#0B1F33]/60 text-sm">{partner.description}</p>
          </div>
        )}
      </div>

      {/* Session Slots */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[#0B1F33] font-bold">Session Slots</h3>
          {!sessionsEditing && (
            <button onClick={startEditSessions} className="text-[#83C52B] text-xs font-semibold hover:underline">
              {sessions.length > 0 ? "Edit slots" : "+ Add slots"}
            </button>
          )}
        </div>
        <p className="text-[#0B1F33]/40 text-xs mb-4">
          These time slots appear when a user books any of your listings. Leave empty to use generic Morning/Afternoon/Evening defaults.
        </p>

        {sessionsEditing ? (
          <div className="space-y-3">
            <SessionsEditor sessions={sessionsForm} onChange={setSessionsForm} />
            {sessionsError && <p className="text-red-500 text-xs font-semibold">{sessionsError}</p>}
            <div className="flex gap-3">
              <button onClick={saveSessions} disabled={sessionsSaving} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] disabled:opacity-60">
                {sessionsSaving ? "Saving…" : "Save Slots"}
              </button>
              <button onClick={() => setSessionsEditing(false)} className="bg-[#F5F7F3] text-[#0B1F33] font-bold px-5 py-2.5 rounded-xl text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-[#0B1F33]/40 text-sm">No custom slots — using generic Morning/Afternoon/Evening defaults.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => (
              <span key={s.id} className="bg-[#F5F7F3] text-[#0B1F33] text-xs font-semibold px-3 py-1.5 rounded-full">
                {s.label}{(s.start_time || s.end_time) && ` · ${[s.start_time, s.end_time].filter(Boolean).join(" – ")}`}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Listings summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#0B1F33] font-bold">Your Listings</h3>
            <a href="/partner/listings" className="text-[#83C52B] text-xs font-semibold hover:underline">Manage listings →</a>
          </div>
          {listings.length === 0 ? (
            <p className="text-[#0B1F33]/40 text-sm py-6 text-center">No listings yet — create one to appear here.</p>
          ) : (
            <div className="space-y-2">
              {listings.map((l) => (
                <div key={l.id} className="flex items-center justify-between bg-[#F5F7F3] rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[#0B1F33] font-semibold text-sm truncate">{l.name}</p>
                    <p className="text-[#0B1F33]/40 text-xs">{l.category_name} · from ₹{Number(l.price).toLocaleString()}/{l.price_period}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Business QR Code */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#0B1F33] font-bold mb-1">Business QR Code</h3>
          <p className="text-[#0B1F33]/50 text-xs mb-4">
            Print this at your center. When a user scans it, they see your full business profile and every listing you offer — no login required to view.
          </p>
          <div className="bg-[#F5F7F3] rounded-xl p-4 flex justify-center mb-4">
            <img src="/api/partner/qr?format=png" alt="Business QR code" width={160} height={160} className="w-40 h-40" />
          </div>
          <div className="flex gap-2 mb-3">
            <a href="/api/partner/qr?format=png" download className="flex-1 text-center text-xs font-bold px-3 py-2 rounded-xl bg-[#0B1F33] text-white hover:bg-[#071525]">
              Download PNG
            </a>
            <a href="/api/partner/qr?format=svg" download className="flex-1 text-center text-xs font-bold px-3 py-2 rounded-xl bg-[#F5F7F3] text-[#0B1F33] border border-gray-200 hover:bg-[#EAF5D9]">
              Download SVG
            </a>
          </div>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="block text-center text-[#83C52B] text-xs font-semibold hover:underline break-all">
            {publicUrl}
          </a>
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-5">
          <h3 className="text-[#0B1F33] font-bold mb-4">Photo Gallery</h3>
          <p className="text-[#0B1F33]/40 text-xs mb-4">Photos pulled from your listings. Add more by editing a listing.</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {gallery.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <img src={src} alt={`Gallery ${i}`} className="w-full h-28 object-cover bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
