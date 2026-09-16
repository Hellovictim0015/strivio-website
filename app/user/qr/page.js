"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function QRCheckinInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking selected");
      setLoading(false);
      return;
    }
    fetch(`/api/bookings/${bookingId}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => setBooking(d.booking))
      .catch(() => setError("This booking could not be found."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="max-w-lg mx-auto px-8 py-16 text-center text-[#0B1F33]/50">Loading…</div>;
  if (error || !booking) {
    return (
      <div className="max-w-lg mx-auto px-8 py-16 text-center">
        <p className="text-[#0B1F33]/50 mb-4">{error || "Booking not found."}</p>
        <button onClick={() => router.push("/user/bookings")} className="text-[#83C52B] font-semibold">← Back to bookings</button>
      </div>
    );
  }

  const alreadyCheckedIn = !!booking.checked_in_at;

  return (
    <div className="max-w-lg mx-auto px-8 py-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#0B1F33]/50 hover:text-[#0B1F33] text-sm font-medium mb-8 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Bookings
      </button>
      <h1 className="text-[#0B1F33] font-black text-3xl mb-2">My Check-in QR</h1>
      <p className="text-[#0B1F33]/50 text-sm mb-8">Show this at the center entrance to mark your attendance.</p>

      <div className="bg-[#071525] rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#83C52B] text-xs font-semibold uppercase tracking-wider">{booking.partner_name}</p>
              <p className="text-white font-black text-xl mt-0.5">{booking.listing_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${alreadyCheckedIn ? 'bg-gray-400' : 'bg-[#83C52B]'}`}></div>
              <span className={`text-xs font-semibold ${alreadyCheckedIn ? 'text-gray-400' : 'text-[#83C52B]'}`}>
                {alreadyCheckedIn ? 'Checked In' : 'Valid Today'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 flex flex-col items-center">
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-inner">
            <img src={`/api/bookings/${booking.id}/qr`} alt="Booking QR code" width={224} height={224} className="w-56 h-56" />
          </div>

          <span className="bg-[#83C52B] text-[#071525] font-black text-xl px-8 py-2.5 rounded-full tracking-widest mb-6">{booking.booking_code}</span>

          <div className="w-full grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Center", value: booking.listing_name },
              { label: "Date", value: booking.booking_date },
              { label: "Session", value: booking.session_label || "—" },
            ].map((row) => (
              <div key={row.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-white/40 text-[10px] font-semibold uppercase mb-1">{row.label}</p>
                <p className="text-white font-bold text-sm truncate">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 pb-6">
          <div className="bg-[#83C52B]/10 border border-[#83C52B]/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 bg-[#83C52B] rounded-full animate-pulse flex-shrink-0"></div>
            <span className="text-[#83C52B] text-sm font-semibold">
              {alreadyCheckedIn ? "Already checked in for this booking" : "Ask the center staff to scan this code to check in"}
            </span>
          </div>
        </div>
      </div>

      <button onClick={() => router.push('/user/bookings')} className="w-full mt-5 bg-white text-[#0B1F33] font-bold rounded-2xl py-3.5 border border-gray-100 hover:border-[#0B1F33]/20 transition-colors">
        View All Bookings
      </button>
    </div>
  );
}

export default function QRCheckin() {
  return (
    <Suspense fallback={null}>
      <QRCheckinInner />
    </Suspense>
  );
}
