"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/useSession";

const navItems = [
  { label: 'Dashboard', path: '/partner', icon: '▦' },
  { label: 'Listings', path: '/partner/listings', icon: '📋' },
  { label: 'Events', path: '/partner/events', icon: '🎉' },
  { label: 'Bookings', path: '/partner/bookings', icon: '📅' },
  { label: 'Center', path: '/partner/center', icon: '🏢' },
  { label: 'QR Scanner', path: '/partner/scanner', icon: '📷' },
  { label: 'Payments', path: '/partner/payments', icon: '💰' },
];

const AUTH_ROUTES = ['/partner/login', '/partner/register', '/partner/verify-otp'];

export default function PartnerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { identity, logout } = useSession('partner');

  if (AUTH_ROUTES.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const isActive = (path) => {
    if (path === '/partner') return pathname === '/partner';
    return pathname === path;
  };

  const displayName = identity?.name || identity?.email?.split('@')[0] || 'Partner';
  const businessName = identity?.business_name || 'Your Business';
  const initial = displayName.charAt(0).toUpperCase();
  const isActiveAccount = identity?.status !== 'disabled';

  return (
    <div className="flex h-screen bg-[#F5F7F3] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-[#83C52B] rounded-lg flex items-center justify-center">
              <span className="text-[#0B1F33] font-black text-xs">S</span>
            </div>
            <span className="text-[#0B1F33] font-black tracking-wide">STRIVIO</span>
          </div>
          <span className="text-[#0B1F33]/40 text-xs font-semibold">Partner Portal</span>
        </div>

        {/* Center info */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EAF5D9] rounded-xl flex items-center justify-center text-lg">🏋️</div>
            <div className="min-w-0">
              <p className="text-[#0B1F33] font-bold text-sm truncate">{businessName}</p>
              <p className={`text-[10px] font-semibold ${isActiveAccount ? 'text-[#83C52B]' : 'text-red-400'}`}>
                {isActiveAccount ? '● Active' : '● Disabled'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                  active ? 'bg-[#EAF5D9] text-[#83C52B]' : 'text-[#0B1F33]/60 hover:bg-[#F5F7F3] hover:text-[#0B1F33]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-[#0B1F33] rounded-full flex items-center justify-center text-white text-xs font-bold">{initial}</div>
            <div className="min-w-0">
              <p className="text-[#0B1F33] text-xs font-bold truncate">{displayName}</p>
              <p className="text-[#0B1F33]/40 text-[10px]">Partner</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-[#0B1F33]/40 text-xs hover:text-red-500 text-left px-3 py-1">
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="w-full pl-9 pr-4 py-2 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33] placeholder:text-[#0B1F33]/40" placeholder="Search bookings, members..." />
          </div>
          <button className="relative p-2 rounded-xl hover:bg-[#F5F7F3]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#83C52B] rounded-full"></span>
          </button>
          <span className="text-[#0B1F33]/30 text-sm">|</span>
          <span className="text-[#0B1F33]/50 text-xs">Mon, 28 Aug 2026</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
