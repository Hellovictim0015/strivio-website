"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push(`/user/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
          <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Welcome</h1>
          <p className="text-[#0B1F33]/50 text-sm mb-6">Login with your email — no password needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Email address</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3 hover:bg-[#74b024] transition-colors disabled:opacity-60"
            >
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        </div>

        <button onClick={() => router.push("/")} className="w-full text-white/40 text-xs hover:text-white/70 mt-6 text-center">
          ← Back to mode select
        </button>
      </div>
    </div>
  );
}
