"use client";

import { useRouter } from "next/navigation";

export default function Landing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B1F33] flex flex-col overflow-hidden relative">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop&auto=format"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-16 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#83C52B] rounded-xl flex items-center justify-center">
            <span className="text-[#0B1F33] font-black text-lg">S</span>
          </div>
          <div>
            <span className="text-white font-black text-2xl tracking-wide">STRIVIO</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/50 text-sm">
          <div className="w-2 h-2 bg-[#83C52B] rounded-full animate-pulse"></div>
          <span>Platform Preview · 21 Screens</span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-16">
        <div className="text-center max-w-3xl">
          <p className="text-[#83C52B] font-semibold tracking-[0.3em] text-sm mb-5 uppercase">Fitness Discovery Platform</p>
          <h1 className="text-white font-black text-6xl leading-tight mb-6">
            Discover. Book.<br />
            <span className="text-[#83C52B]">Move.</span>
          </h1>
          <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            STRIVIO connects users with nearby gyms, sports academies, yoga studios and fitness centers. A complete platform for users, partners and administrators.
          </p>

          {/* Mode Cards */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              {
                emoji: '📱',
                title: 'User App',
                desc: '11 screens',
                sub: 'Discover, explore, book fitness centers',
                path: '/user',
                accent: true,
              },
              {
                emoji: '🏋️',
                title: 'Partner App',
                desc: '5 screens',
                sub: 'Manage your center, bookings & events',
                path: '/partner',
                accent: false,
              },
              {
                emoji: '🖥️',
                title: 'Admin Dashboard',
                desc: '5 screens',
                sub: 'Platform overview, analytics & control',
                path: '/admin',
                accent: false,
              },
            ].map((m) => (
              <button
                key={m.title}
                onClick={() => router.push(m.path)}
                className={`group rounded-2xl p-6 text-left border transition-all duration-200 hover:scale-[1.02] ${
                  m.accent
                    ? 'bg-[#83C52B] border-[#83C52B] hover:bg-[#74b024]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${m.accent ? 'bg-[#0B1F33]/20' : 'bg-white/10'}`}>
                  {m.emoji}
                </div>
                <p className={`font-black text-lg mb-0.5 ${m.accent ? 'text-white' : 'text-white'}`}>{m.title}</p>
                <p className={`text-xs font-bold mb-2 ${m.accent ? 'text-white/70' : 'text-[#83C52B]'}`}>{m.desc}</p>
                <p className={`text-xs leading-relaxed ${m.accent ? 'text-white/70' : 'text-white/50'}`}>{m.sub}</p>
                <div className={`flex items-center gap-1 mt-4 text-xs font-semibold ${m.accent ? 'text-white' : 'text-white/40 group-hover:text-white/70'} transition-colors`}>
                  Enter {m.title} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-16 py-8 flex items-center justify-between border-t border-white/10">
        <p className="text-white/30 text-sm">© 2026 STRIVIO · Built with Figma Make</p>
        <div className="flex items-center gap-6 text-white/30 text-sm">
          <span>Navy · Lime Green · White</span>
          <span>|</span>
          <span>Inter · Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
