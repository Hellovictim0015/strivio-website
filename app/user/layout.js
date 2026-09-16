"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/useSession";

const navItems = [
  { label: 'Home', path: '/user' },
  { label: 'Explore', path: '/user/explore' },
  { label: 'Bookings', path: '/user/bookings' },
  { label: 'Events', path: '/user/events' },
];

const AUTH_ROUTES = ['/user/login', '/user/verify-otp'];

export default function UserLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { identity, logout } = useSession('user');

  if (AUTH_ROUTES.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const isActive = (path) => {
    if (path === '/user') return pathname === '/user';
    return pathname.startsWith(path);
  };

  const displayName = identity?.name || identity?.email?.split('@')[0] || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F7F3] flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/user')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#83C52B] rounded-lg flex items-center justify-center">
              <span className="text-[#0B1F33] font-black text-sm">S</span>
            </div>
            <span className="text-[#0B1F33] font-black text-xl tracking-wide">STRIVIO</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    active ? 'bg-[#EAF5D9] text-[#83C52B]' : 'text-[#0B1F33]/60 hover:text-[#0B1F33] hover:bg-[#F5F7F3]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#F5F7F3] rounded-xl px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#83C52B" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="text-[#0B1F33] text-xs font-semibold">Bengaluru</span>
            </button>
            <button className="relative p-2 rounded-xl hover:bg-[#F5F7F3]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#83C52B] rounded-full"></span>
            </button>
            <button
              onClick={() => router.push('/user/profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${isActive('/user/profile') ? 'border-[#83C52B] bg-[#EAF5D9]' : 'border-gray-200 hover:border-[#83C52B]/40'}`}
            >
              <div className="w-6 h-6 bg-[#83C52B] rounded-full flex items-center justify-center text-white text-xs font-bold">{initial}</div>
              <span className="text-[#0B1F33] text-sm font-semibold">{displayName}</span>
            </button>
            <button onClick={logout} className="text-[#0B1F33]/40 text-xs hover:text-red-500 transition-colors px-2">Logout</button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-[#071525] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#83C52B] rounded-lg flex items-center justify-center">
              <span className="text-[#0B1F33] font-black text-xs">S</span>
            </div>
            <span className="text-white font-black tracking-wide">STRIVIO</span>
          </div>
          <p className="text-white/30 text-xs">© 2026 STRIVIO · Discover. Book. Move.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Support'].map((l) => (
              <button key={l} className="text-white/30 text-xs hover:text-white/60">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
