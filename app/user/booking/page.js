"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEFAULT_SESSIONS = [
  { label: "Morning", time: "6:00 AM – 9:00 AM", emoji: "🌅" },
  { label: "Afternoon", time: "12:00 PM – 3:00 PM", emoji: "☀️" },
  { label: "Evening", time: "6:00 PM – 9:00 PM", emoji: "🌙" },
];
const PERIOD_LABELS = { day: "/day", session: "/session", month: "/month", quarter: "/quarter", year: "/year" };

function planTitle(p) {
  return p.label || { day: "Daily", session: "Per Session", month: "Monthly", quarter: "Quarterly", year: "Annual" }[p.period] || p.period;
}

function sessionEmoji(label) {
  const l = label.toLowerCase();
  if (l.includes("morning")) return "🌅";
  if (l.includes("afternoon") || l.includes("noon")) return "☀️";
  if (l.includes("evening") || l.includes("night")) return "🌙";
  return "⏰";
}

// The partner's own session slots (set on /partner/center), falling back to
// generic defaults if that partner hasn't defined any yet.
function resolveSessions(listing) {
  if (listing?.sessions?.length > 0) {
    return listing.sessions.map((s) => ({
      label: s.label,
      time: [s.start_time, s.end_time].filter(Boolean).join(" – ") || "Time not specified",
      emoji: sessionEmoji(s.label),
    }));
  }
  return DEFAULT_SESSIONS;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function BookingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");
  const initialPlanId = searchParams.get("planId");

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId ? Number(initialPlanId) : null);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => {
    if (!listingId) {
      setError("No center selected");
      setLoading(false);
      return;
    }
    fetch(`/api/listings/${listingId}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        setListing(d.listing);
        if (!initialPlanId && d.listing.plans?.length) {
          setSelectedPlanId(d.listing.plans[0].id);
        }
        const resolved = resolveSessions(d.listing);
        setSelectedSession(resolved[resolved.length - 1].label);
      })
      .catch(() => setError("This center could not be found."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const selectedPlan = listing?.plans?.find((p) => p.id === selectedPlanId);
  const sessions = resolveSessions(listing);

  async function handleConfirm() {
    setError("");
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: Number(listingId),
          planId: selectedPlan.id,
          sessionLabel: `${selectedSession} (${sessions.find((s) => s.label === selectedSession)?.time})`,
          bookingDate: selectedDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create booking");
        return;
      }
      router.push(`/user/confirmation?bookingId=${data.booking.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-6xl mx-auto px-8 py-16 text-center text-[#0B1F33]/50">Loading…</div>;
  if (error && !listing) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-16 text-center">
        <p className="text-[#0B1F33]/50 mb-4">{error}</p>
        <button onClick={() => router.push("/user/centers")} className="text-[#83C52B] font-semibold">← Back to centers</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#0B1F33]/50 hover:text-[#0B1F33] text-sm font-medium mb-4 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Center Details
        </button>
        <h1 className="text-[#0B1F33] font-black text-3xl">Book Your Session</h1>
        <p className="text-[#0B1F33]/50 mt-1">{listing.name} · {listing.city || listing.partner_name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-[#0B1F33] font-bold text-lg mb-4">Choose a Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(listing.plans || []).map((p) => (
                <button key={p.id} onClick={() => setSelectedPlanId(p.id)}
                  className={`text-left rounded-2xl p-5 border-2 transition-all ${selectedPlanId === p.id ? 'border-[#83C52B] bg-[#EAF5D9]' : 'border-gray-100 bg-white hover:border-[#83C52B]/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#0B1F33] font-bold text-sm">{planTitle(p)}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPlanId === p.id ? 'border-[#83C52B] bg-[#83C52B]' : 'border-gray-300'}`}>
                      {selectedPlanId === p.id && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </div>
                  {p.persons && <p className="text-[#0B1F33]/50 text-xs mb-2">For {p.persons} {p.persons === 1 ? 'person' : 'persons'}</p>}
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#0B1F33] font-black text-2xl">₹{Number(p.price).toLocaleString()}</span>
                    <span className="text-[#0B1F33]/50 text-xs">{PERIOD_LABELS[p.period]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-[#0B1F33] font-bold text-base mb-4">Select Date</h3>
              <input
                type="date"
                min={todayISO()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
              />
              {selectedPlan?.period === "day" && (
                <p className="text-[#0B1F33]/40 text-xs mt-2">This is a day-pass plan — pick the day you want to attend.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-[#0B1F33] font-bold text-base mb-4">Select Session</h3>
              <div className="space-y-3">
                {sessions.map((s) => (
                  <button key={s.label} onClick={() => setSelectedSession(s.label)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all text-left ${selectedSession === s.label ? 'border-[#83C52B] bg-[#EAF5D9]' : 'border-gray-100 hover:border-[#83C52B]/30'}`}>
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <p className="text-[#0B1F33] font-bold text-sm">{s.label}</p>
                      <p className="text-[#0B1F33]/50 text-xs">{s.time}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedSession === s.label ? 'border-[#83C52B] bg-[#83C52B]' : 'border-gray-300'}`}>
                      {selectedSession === s.label && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-[#0B1F33] rounded-2xl p-6 sticky top-24">
            <h3 className="text-white font-bold text-base mb-5">Booking Summary</h3>
            <div className="bg-white/10 rounded-xl p-4 mb-5">
              <p className="text-white font-bold">{listing.name}</p>
              <p className="text-white/50 text-xs mt-0.5">{listing.city || listing.partner_name}</p>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: "Plan", value: selectedPlan ? planTitle(selectedPlan) : "—" },
                { label: "Persons", value: selectedPlan?.persons ? selectedPlan.persons : null },
                { label: "Date", value: selectedDate },
                { label: "Session", value: selectedSession },
              ].filter((row) => row.value !== null).map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-white/50">{row.label}</span>
                  <span className="text-white font-semibold">{row.value}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-[#83C52B] font-black text-2xl">₹{selectedPlan ? Number(selectedPlan.price).toLocaleString() : "—"}</span>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs font-semibold mb-3">{error}</p>}
            <button onClick={handleConfirm} disabled={submitting || !selectedPlan} className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3.5 text-sm hover:bg-[#74b024] transition-colors disabled:opacity-60">
              {submitting ? "Booking…" : "Continue Booking →"}
            </button>
            <p className="text-white/30 text-xs text-center mt-3">No hidden charges · Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={null}>
      <BookingInner />
    </Suspense>
  );
}
