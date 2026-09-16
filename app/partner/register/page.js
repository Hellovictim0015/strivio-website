"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Email", "Verify", "Business Details"];

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    phone: "",
    address: "",
    city: "",
    description: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/partner/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setCooldown(45);
      setStep(1);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    try {
      const res = await fetch("/api/auth/partner/send-otp", {
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
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/partner/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }
      setRegistrationToken(data.registrationToken);
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationToken, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/partner");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1F33] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop&auto=format"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-9 h-9 bg-[#83C52B] rounded-xl flex items-center justify-center">
            <span className="text-[#0B1F33] font-black text-base">S</span>
          </div>
          <span className="text-white font-black text-xl tracking-wide">STRIVIO</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i <= step ? "bg-[#83C52B] text-white" : "bg-white/10 text-white/40"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs font-semibold ${i <= step ? "text-white" : "text-white/30"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-white/20" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {step === 0 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Partner Registration</h1>
              <p className="text-[#0B1F33]/50 text-sm mb-4">Start with your business email — we'll send a verification code.</p>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="w-full px-4 py-3 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
              />
              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3 hover:bg-[#74b024] transition-colors disabled:opacity-60"
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Verify your email</h1>
              <p className="text-[#0B1F33]/50 text-sm mb-4">
                Enter the 6-digit code sent to <span className="font-semibold text-[#0B1F33]">{email}</span>
              </p>
              <input
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
                {loading ? "Verifying…" : "Verify"}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0}
                className="w-full text-[#83C52B] text-sm font-semibold disabled:opacity-40"
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-3">
              <h1 className="text-[#0B1F33] font-black text-2xl mb-1">Business Details</h1>
              <p className="text-[#0B1F33]/50 text-sm mb-3">Tell us about your business and set a password.</p>

              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Your name" value={form.name} onChange={(e) => updateForm("name", e.target.value)}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] col-span-2" />
                <input required placeholder="Business / Gym name" value={form.businessName} onChange={(e) => updateForm("businessName", e.target.value)}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] col-span-2" />
                <input required placeholder="Phone number" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
                <input placeholder="City" value={form.city} onChange={(e) => updateForm("city", e.target.value)}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
                <input placeholder="Address" value={form.address} onChange={(e) => updateForm("address", e.target.value)}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] col-span-2" />
                <textarea placeholder="Short description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={2}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] col-span-2 resize-none" />
                <input required type="password" placeholder="Password" value={form.password} onChange={(e) => updateForm("password", e.target.value)}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
                <input required type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)}
                  className="px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              </div>

              <p className="text-[#0B1F33]/40 text-[11px]">Password must be at least 8 characters with a letter and a number.</p>
              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#83C52B] text-white font-bold rounded-xl py-3 hover:bg-[#74b024] transition-colors disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Complete Registration"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-[#0B1F33]/50 mt-5">
            Already registered?{" "}
            <button onClick={() => router.push("/partner/login")} className="text-[#83C52B] font-semibold">
              Login
            </button>
          </p>
        </div>

        <button onClick={() => router.push("/")} className="w-full text-white/40 text-xs hover:text-white/70 mt-6 text-center">
          ← Back to mode select
        </button>
      </div>
    </div>
  );
}
