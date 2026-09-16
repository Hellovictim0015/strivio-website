"use client";

import { useEffect, useState } from "react";
import { categoryEmoji } from "@/lib/categoryIcon";

const emptyForm = { name: "", description: "", status: "active" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setError("");
    setShowForm(true);
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "", status: cat.status });
    setFile(null);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("status", form.status);
      if (file) fd.append("image", file);

      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save category");
        return;
      }
      setShowForm(false);
      load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(cat) {
    const newStatus = cat.status === "active" ? "inactive" : "active";
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0B1F33] font-black text-2xl">Categories</h1>
          <p className="text-[#0B1F33]/50 text-sm mt-0.5">Manage the "Browse by Activity" categories shown to users</p>
        </div>
        <button onClick={startCreate} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] transition-colors">
          + New Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-[#0B1F33] font-bold text-lg mb-4">{editingId ? "Edit Category" : "New Category"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Name</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              </div>
              <div>
                <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Description</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-[#F5F7F3] rounded-xl border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]" />
              </div>
              <div className="col-span-2">
                <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Category image (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-[#0B1F33]" />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-[#83C52B] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#74b024] disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-[#F5F7F3] text-[#0B1F33] font-bold px-5 py-2.5 rounded-xl text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-[#0B1F33]/50">No categories yet. Create one to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              {c.image ? (
                <img src={c.image} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#F5F7F3] flex items-center justify-center text-2xl">{categoryEmoji(c.name)}</div>
              )}
              <div className="min-w-0">
                <p className="text-[#0B1F33] font-bold text-sm truncate">{c.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-[#EAF5D9] text-[#83C52B]' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
              </div>
            </div>
            <p className="text-[#0B1F33]/50 text-xs mb-3 line-clamp-2">{c.description || "No description"}</p>
            <p className="text-[#0B1F33]/40 text-xs mb-3">{c.listing_count} listing(s)</p>
            <div className="flex gap-2">
              <button onClick={() => startEdit(c)} className="flex-1 text-xs font-bold px-3 py-2 rounded-xl bg-[#F5F7F3] text-[#0B1F33] hover:bg-[#EAF5D9]">Edit</button>
              <button onClick={() => toggleStatus(c)} className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl ${c.status === 'active' ? 'bg-red-50 text-red-400 hover:bg-red-100' : 'bg-[#EAF5D9] text-[#83C52B]'}`}>
                {c.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
