"use client";

import { useEffect, useMemo, useState } from "react";

const tabs = ["All", "Active", "Blocked"];

function maskEmail(email) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/users", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (activeTab !== "All" && u.status !== activeTab.toLowerCase()) return false;
      if (search && !u.email.toLowerCase().includes(search.toLowerCase()) && !(u.name || "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, activeTab, search]);

  async function toggleStatus(user) {
    setBusyId(user.id);
    try {
      const newStatus = user.status === "active" ? "blocked" : "active";
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0B1F33] font-black text-2xl">Users</h1>
          <p className="text-[#0B1F33]/50 text-sm">{users.length} total users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === t ? 'bg-[#83C52B] text-white' : 'bg-[#F5F7F3] text-[#0B1F33]'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-[#F5F7F3] rounded-xl px-3 py-2 flex-1 max-w-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-xs text-[#0B1F33] outline-none flex-1 placeholder:text-[#0B1F33]/40" placeholder="Search users..." />
          </div>
        </div>

        {!loading && filtered.length === 0 ? (
          <p className="text-[#0B1F33]/40 text-sm py-16 text-center">No users found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['User', 'Email', 'Bookings', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#0B1F33]/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-[#F5F7F3] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#EAF5D9] rounded-full flex items-center justify-center text-xs font-bold text-[#0B1F33]">
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <span className="text-[#0B1F33] font-semibold text-sm">{u.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#0B1F33]/50 text-sm">{maskEmail(u.email)}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[#0B1F33] font-bold text-sm">{u.booking_count}</span>
                    <span className="text-[#0B1F33]/40 text-xs ml-1">bookings</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-[#EAF5D9] text-[#83C52B]' : 'bg-red-50 text-red-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#0B1F33]/50 text-sm">{new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleStatus(u)} disabled={busyId === u.id}
                      className={`text-xs font-semibold disabled:opacity-50 ${u.status === 'active' ? 'text-red-400' : 'text-[#83C52B]'}`}>
                      {u.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
