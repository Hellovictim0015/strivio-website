"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071525] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-[#83C52B] rounded-xl flex items-center justify-center">
            <span className="text-[#0B1F33] font-black text-base">S</span>
          </div>
          <span className="text-white font-black text-xl tracking-wide">STRIVIO</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Admin Login</h1>
          <p className="text-[#0B1F33]/50 text-sm mb-6">Platform administration access.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Email address</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@strivio.com"
                className="w-full px-4 py-3 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
              />
            </div>
            <div>
              <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3 hover:bg-[#74b024] transition-colors disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Login"}
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
