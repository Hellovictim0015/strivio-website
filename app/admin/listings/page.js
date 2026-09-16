"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STATUS_STYLES = {
  PENDING: "bg-orange-50 text-orange-500",
  APPROVED: "bg-[#EAF5D9] text-[#83C52B]",
  REJECTED: "bg-red-50 text-red-400",
};

function AdminListingsInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("status") || "ALL");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    setLoading(true);
    const params = tab !== "ALL" ? `?status=${tab}` : "";
    fetch(`/api/admin/listings${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [tab]);

  async function approve(id) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/listings/${id}/approve`, { method: "POST" });
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/listings/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectingId(null);
      setRejectReason("");
      load();
    } finally {
      setBusyId(null);
    }
  }

  const tabs = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#0B1F33] font-black text-2xl">Listing Approvals</h1>
        <p className="text-[#0B1F33]/50 text-sm mt-0.5">Review and approve partner-submitted listings</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${tab === t ? 'bg-[#83C52B] text-white' : 'bg-white text-[#0B1F33] border border-gray-100 hover:border-[#83C52B]/40'}`}>
            {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {!loading && listings.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-[#0B1F33]/50">No listings found.</p>
        </div>
      )}

      <div className="space-y-4">
        {listings.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <img src={l.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=150&fit=crop&auto=format"} alt={l.name} className="w-full md:w-32 h-32 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[#0B1F33] font-bold text-base">{l.name}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                    {!l.is_active && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Deactivated by partner</span>}
                  </div>
                  <p className="text-[#0B1F33]/50 text-xs mt-1">{l.category_name} · {l.city || "—"} · ₹{Number(l.price).toLocaleString()}/{l.price_period}</p>
                  <p className="text-[#0B1F33]/40 text-xs mt-1">By {l.partner_name} ({l.partner_email})</p>
                  {l.rejection_reason && <p className="text-red-400 text-xs mt-1">Rejection reason: {l.rejection_reason}</p>}
                </div>
                {l.status === "PENDING" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approve(l.id)} disabled={busyId === l.id}
                      className="bg-[#83C52B] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#74b024] disabled:opacity-60">
                      Approve
                    </button>
                    <button onClick={() => setRejectingId(rejectingId === l.id ? null : l.id)}
                      className="bg-red-50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-100">
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {rejectingId === l.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="flex-1 px-3 py-2 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
                  />
                  <button onClick={() => reject(l.id)} disabled={busyId === l.id} className="bg-red-400 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-60">
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminListings() {
  return (
    <Suspense fallback={null}>
      <AdminListingsInner />
    </Suspense>
  );
}
