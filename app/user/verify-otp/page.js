"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!email) router.replace("/user/login");
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }
      router.push("/user");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setResending(true);
    try {
      const res = await fetch("/api/auth/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not resend OTP");
        if (data.retryAfterSeconds) setCooldown(data.retryAfterSeconds);
        return;
      }
      setCooldown(45);
      inputRef.current?.focus();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1F33] flex items-center justify-center px-6 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop&auto=format"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-[#83C52B] rounded-xl flex items-center justify-center">
            <span className="text-[#0B1F33] font-black text-base">S</span>
          </div>
          <span className="text-white font-black text-xl tracking-wide">STRIVIO</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Enter OTP</h1>
          <p className="text-[#0B1F33]/50 text-sm mb-6">
            We sent a 6-digit code to <span className="font-semibold text-[#0B1F33]">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3 hover:bg-[#74b024] transition-colors disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full text-[#83C52B] text-sm font-semibold mt-4 disabled:opacity-40"
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : resending ? "Resending…" : "Resend OTP"}
          </button>
        </div>

        <button onClick={() => router.push("/user/login")} className="w-full text-white/40 text-xs hover:text-white/70 mt-6 text-center">
          ← Use a different email
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
