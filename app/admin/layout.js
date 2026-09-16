"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/useSession";

const sideNav = [
  { label: 'Dashboard', path: '/admin', icon: '▦' },
  { label: 'Categories', path: '/admin/categories', icon: '🏷️' },
  { label: 'Listings', path: '/admin/listings', icon: '📋' },
  { label: 'Events', path: '/admin/events', icon: '🎉' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Partners', path: '/admin/partners', icon: '🤝' },
  { label: 'Bookings', path: '/admin/bookings', icon: '📅' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

const AUTH_ROUTES = ['/admin/login'];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { identity, logout } = useSession('admin');

  if (AUTH_ROUTES.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const isActive = (path) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname === path;
  };

  const displayName = identity?.name || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-[#F5F7F3] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#071525] flex flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#83C52B] rounded-lg flex items-center justify-center">
              <span className="text-[#0B1F33] font-black text-xs">S</span>
            </div>
            <span className="text-white font-black text-lg tracking-wide">STRIVIO</span>
          </div>
          <p className="text-white/40 text-xs mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sideNav.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => item.path !== '#' && router.push(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${
                  active
                    ? 'bg-[#83C52B]/20 text-[#83C52B] border-l-2 border-[#83C52B]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <button onClick={() => router.push('/')} className="w-full text-white/40 text-xs hover:text-white/70 transition-colors text-left">
            ← Back to Mode Select
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search users, centers, bookings..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />
          </div>
          <button className="relative p-2 rounded-xl hover:bg-[#F5F7F3] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#83C52B] rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#83C52B] flex items-center justify-center text-white text-sm font-bold">{initial}</div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[#0B1F33]">{displayName}</p>
              <p className="text-[10px] text-[#0B1F33]/50">Super Admin</p>
            </div>
            <button onClick={logout} className="text-[#0B1F33]/40 text-xs hover:text-red-500 transition-colors px-2">Logout</button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
