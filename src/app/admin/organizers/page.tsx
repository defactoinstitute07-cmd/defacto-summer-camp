"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { CardSkeleton } from "@/components/Skeletons";

interface Organizer { _id: string; name: string; position: string; bio: string; order: number; imageUrl: string; isActive: boolean; }

const empty = { name: "", position: "", bio: "", order: 0 };

export default function OrganizersPage() {
  const [items, setItems] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Organizer | null>(null);
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => adminFetch("/organizers").then(d => setItems(d.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setImageFile(null); setError(""); setShowForm(true); };
  const openEdit = (o: Organizer) => { setEditing(o); setForm({ name: o.name, position: o.position, bio: o.bio, order: o.order }); setImageFile(null); setError(""); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append("image", imageFile);
      if (editing) await adminFetchForm(`/organizers/${editing._id}`, fd, "PUT");
      else await adminFetchForm("/organizers", fd, "POST");
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this organizer?")) return;
    await adminFetch(`/organizers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{items.length} organizers</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-[#E60000]/10 transition-colors">
          <Plus className="w-4 h-4" /> Add Organizer
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(o => (
            <div key={o._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-200">
              {o.imageUrl && <img src={o.imageUrl} alt={o.name} className="w-16 h-16 rounded-full object-cover border border-slate-200" />}
              {!o.imageUrl && <div className="w-16 h-16 rounded-full bg-[#E60000]/10 border border-[#E60000]/20 flex items-center justify-center text-[#E60000] text-xl font-black">{o.name[0]}</div>}
              <div>
                <p className="text-slate-800 font-bold">{o.name}</p>
                <p className="text-slate-500 text-sm">{o.position}</p>
                {o.bio && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{o.bio}</p>}
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => openEdit(o)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(o._id)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-500 text-xs font-bold rounded-lg transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-slate-400 col-span-3 text-center py-12">No organizers yet. Click 'Add Organizer'.</p>}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editing ? "Edit Organizer" : "Add Organizer"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <FormField label="Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <FormField label="Position *" value={form.position} onChange={v => setForm(p => ({ ...p, position: v }))} />
            <FormField label="Bio" value={form.bio} onChange={v => setForm(p => ({ ...p, bio: v }))} textarea />
            <FormField label="Display Order" type="number" value={String(form.order)} onChange={v => setForm(p => ({ ...p, order: Number(v) }))} />
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">Photo</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-slate-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-[#E60000] file:font-bold file:text-xs hover:file:bg-red-100 cursor-pointer" />
            </div>
            <SaveBtn saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
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

function FormField({ label, value, onChange, textarea, type = "text" }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string; }) {
  const cls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] focus:ring-2 focus:ring-[#E60000]/10 transition-all";
  return (
    <div>
      <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>
      {textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={cls} /> : <input type={type} value={value} onChange={e => onChange(e.target.value)} className={cls} />}
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
