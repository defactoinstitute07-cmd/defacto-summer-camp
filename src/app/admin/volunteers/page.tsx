"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";

interface Volunteer { _id: string; name: string; designation: string; bio: string; imageUrl: string; }

const empty = { name: "", designation: "Camp Volunteer", bio: "" };

export default function VolunteersPage() {
  const [items, setItems] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => adminFetch("/volunteers").then(d => setItems(d.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm(empty); setImageFile(null); setError(""); setShowForm(true); };
  const openEdit = (v: Volunteer) => { setEditing(v); setForm({ name: v.name, designation: v.designation, bio: v.bio }); setImageFile(null); setError(""); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);
      if (editing) await adminFetchForm(`/volunteers/${editing._id}`, fd, "PUT");
      else await adminFetchForm("/volunteers", fd, "POST");
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const names = bulkText.split("\n").map(n => n.trim()).filter(Boolean).map(name => ({ name, designation: "Camp Volunteer" }));
      await adminFetch("/volunteers/bulk", { method: "POST", body: JSON.stringify({ volunteers: names }) });
      setShowBulk(false); setBulkText(""); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this volunteer?")) return;
    await adminFetch(`/volunteers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search volunteers…"
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] w-64" />
        <div className="flex gap-2">
          <button onClick={() => { setShowBulk(true); setError(""); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors border border-slate-200">
            Bulk Add
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-[#E60000]/10 transition-colors">
            <Plus className="w-4 h-4" /> Add Volunteer
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70">
              <tr className="text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-bold">Name</th>
                <th className="text-left px-5 py-3 font-bold hidden sm:table-cell">Designation</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(v => (
                <tr key={v._id} className="hover:bg-slate-50/50 text-slate-700 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {v.imageUrl
                        ? <img src={v.imageUrl} alt={v.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        : <div className="w-8 h-8 rounded-full bg-[#E60000]/10 flex items-center justify-center text-[#E60000] text-xs font-black">{v.name[0]}</div>
                      }
                      <span className="text-slate-800 font-semibold">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{v.designation}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(v)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(v._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={3} className="text-center text-slate-400 py-10">No volunteers found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Volunteer" : "Add Volunteer"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <FormField label="Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <FormField label="Designation" value={form.designation} onChange={v => setForm(p => ({ ...p, designation: v }))} />
            <FormField label="Bio" value={form.bio} onChange={v => setForm(p => ({ ...p, bio: v }))} textarea />
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">Photo</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-slate-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-[#E60000] file:font-bold file:text-xs hover:file:bg-red-100 cursor-pointer" />
            </div>
            <SaveBtn saving={saving} />
          </form>
        </Modal>
      )}

      {showBulk && (
        <Modal title="Bulk Add Volunteers" onClose={() => setShowBulk(false)}>
          <form onSubmit={handleBulk} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">One name per line</label>
              <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={8} placeholder={"Ashwini Panwar\nRekha Maliyal\nDeepika Rawat\n..."}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]" />
            </div>
            <SaveBtn saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Spinner() {
  return <TableSkeleton cols={3} rows={5} />;
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function FormField({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] focus:ring-2 focus:ring-[#E60000]/10 transition-all";
  return (
    <div>
      <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>
      {textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={cls} /> : <input value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  );
}
function SaveBtn({ saving }: { saving: boolean }) {
  return (
    <button type="submit" disabled={saving} className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors">
      {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
    </button>
  );
}
