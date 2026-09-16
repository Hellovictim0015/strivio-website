"use client";

import { useEffect, useState } from "react";

export default function QRScanner() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

  function loadRecent() {
    fetch("/api/partner/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRecent((d.bookings || []).filter((b) => b.checked_in_at).slice(0, 6)));
  }

  useEffect(loadRecent, []);

  async function handleCheckIn(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/bookings/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not check in this booking");
        setResult(null);
        return;
      }
      setResult(data.booking);
      loadRecent();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#0B1F33] font-black text-2xl">Check-in a Booking</h1>
        <p className="text-[#0B1F33]/50 text-sm mt-0.5">Scan the member&apos;s QR code with any camera app, then enter the code shown below it — or type it manually.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleCheckIn} className="space-y-4">
            <label className="text-[#0B1F33]/60 text-xs font-semibold block">Booking Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="STR-00000"
              autoFocus
              className="w-full px-4 py-3 text-center text-xl tracking-widest font-black bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] font-mono"
            />
            {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}
            <button type="submit" disabled={loading || !code} className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3.5 text-sm hover:bg-[#74b024] transition-colors disabled:opacity-60">
              {loading ? "Checking in…" : "Check In"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#83C52B]/30">
              <div className="bg-[#0B1F33] px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#83C52B] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {(result.user_name || result.user_email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{result.user_name || result.user_email}</p>
                  <p className="text-white/50 text-sm">{result.plan_name} Plan Member{result.persons ? ` · ${result.persons} persons` : ""}</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-3">
                {[
                  { label: "Booking Code", value: result.booking_code, mono: true },
                  { label: "Session", value: result.session_label || "—" },
                  { label: "Listing", value: result.listing_name },
                  { label: "Date", value: result.booking_date },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <span className="text-[#0B1F33]/50 text-sm">{r.label}</span>
                    <span className={`text-[#0B1F33] font-bold text-sm ${r.mono ? 'font-mono text-[#83C52B]' : ''}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-5">
                <div className="bg-[#EAF5D9] rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#83C52B] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="text-[#0B1F33] font-bold text-sm">Attendance Marked</p>
                    <p className="text-[#0B1F33]/50 text-xs">Check-in recorded</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-[#0B1F33] font-bold mb-4">Recent Check-ins</h3>
            {recent.length === 0 ? (
              <p className="text-[#0B1F33]/40 text-sm">No check-ins yet today.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#EAF5D9] rounded-full flex items-center justify-center text-xs font-bold text-[#0B1F33]">{(r.user_name || r.user_email)[0].toUpperCase()}</div>
                    <div className="flex-1">
                      <p className="text-[#0B1F33] font-semibold text-sm">{r.user_name || r.user_email}</p>
                      <p className="text-[#0B1F33]/40 text-xs">{r.listing_name}</p>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
