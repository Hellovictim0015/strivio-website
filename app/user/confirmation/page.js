"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking found");
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

  if (loading) return <div className="max-w-2xl mx-auto px-8 py-16 text-center text-[#0B1F33]/50">Loading…</div>;
  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <p className="text-[#0B1F33]/50 mb-4">{error || "Booking not found."}</p>
        <button onClick={() => router.push("/user/bookings")} className="text-[#83C52B] font-semibold">← View your bookings</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-16 text-center">
      <div className="w-24 h-24 bg-[#EAF5D9] rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-16 h-16 bg-[#83C52B] rounded-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
      <h1 className="text-[#0B1F33] font-black text-3xl mb-2">Booking Confirmed!</h1>
      <p className="text-[#0B1F33]/50 mb-10">Your fitness session has been successfully booked. Get ready to move!</p>

      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 text-left mb-6">
        <div className="bg-[#0B1F33] px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-[#83C52B] text-xs font-semibold uppercase tracking-wider mb-1">Booking Confirmed</p>
            <p className="text-white font-black text-2xl">{booking.listing_name}</p>
            <p className="text-white/50 text-sm mt-0.5">{booking.category_name}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs mb-1">Booking ID</p>
            <span className="bg-[#83C52B] text-white font-black text-lg px-4 py-1.5 rounded-xl">{booking.booking_code}</span>
          </div>
        </div>
        <div className="px-8 py-6 grid grid-cols-2 gap-4">
          {[
            { label: "Membership Plan", value: booking.plan_name },
            { label: "Persons", value: booking.persons ? `${booking.persons}` : null },
            { label: "Date", value: booking.booking_date },
            { label: "Session", value: booking.session_label || "—" },
            { label: "Amount", value: `₹${Number(booking.amount).toLocaleString()}` },
          ].filter((row) => row.value !== null).map((row) => (
            <div key={row.label}>
              <p className="text-[#0B1F33]/40 text-xs font-semibold uppercase tracking-wider">{row.label}</p>
              <p className="text-[#0B1F33] font-bold text-base mt-1">{row.value}</p>
            </div>
          ))}
        </div>
        <div className="px-8 pb-6">
          <div className="bg-[#EAF5D9] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 bg-[#83C52B] rounded-full animate-pulse flex-shrink-0"></div>
            <p className="text-[#0B1F33] text-sm font-semibold">Your QR code is ready for check-in at the center</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => router.push(`/user/qr?bookingId=${booking.id}`)} className="flex-1 bg-[#83C52B] text-white font-bold rounded-2xl py-3.5 hover:bg-[#74b024] transition-colors">
          View QR Code
        </button>
        <button onClick={() => router.push('/user/bookings')} className="flex-1 bg-white text-[#0B1F33] font-bold rounded-2xl py-3.5 border border-gray-200 hover:border-[#0B1F33]/30 transition-colors">
          View All Bookings
        </button>
      </div>
      <button onClick={() => router.push('/user')} className="mt-4 text-[#0B1F33]/40 text-sm hover:text-[#0B1F33] transition-colors">Back to Home</button>
    </div>
  );
}

export default function Confirmation() {
  return (
    <Suspense fallback={null}>
      <ConfirmationInner />
    </Suspense>
  );
}
