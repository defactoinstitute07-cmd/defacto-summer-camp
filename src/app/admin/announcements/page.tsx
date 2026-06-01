"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save, Pin } from "lucide-react";

const TYPES = ["general","info","result","urgent","schedule"];
interface Ann { _id: string; title: string; content: string; type: string; isPinned: boolean; isVisible: boolean; createdAt: string; }

const emptyForm = { title:"", content:"", type:"general", isPinned:false, isVisible:true };
const typeColor: Record<string,string> = { info:"bg-blue-500/20 text-blue-300", result:"bg-green-500/20 text-green-300", urgent:"bg-red-500/20 text-red-400", general:"bg-slate-500/20 text-slate-300", schedule:"bg-yellow-500/20 text-yellow-300" };

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ann | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => adminFetch("/announcements?limit=50").then(d => setItems(d.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(""); setShowForm(true); };
  const openEdit = (a: Ann) => { setEditing(a); setForm({ title:a.title, content:a.content, type:a.type, isPinned:a.isPinned, isVisible:a.isVisible }); setError(""); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const body = JSON.stringify(form);
      if (editing) await adminFetch(`/announcements/${editing._id}`, { method:"PUT", body });
      else await adminFetch("/announcements", { method:"POST", body });
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await adminFetch(`/announcements/${id}`, { method:"DELETE" }); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl">
          <Plus className="w-4 h-4" /> Post Announcement
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {items.map(a => (
            <div key={a._id} className={`bg-[#0B1C4A]/60 border rounded-2xl p-5 ${a.isPinned ? "border-[#FFDE00]/30" : "border-white/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.isPinned && <Pin className="w-3 h-3 text-[#FFDE00]" />}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor[a.type]}`}>{a.type}</span>
                    {!a.isVisible && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30">Hidden</span>}
                  </div>
                  <h4 className="text-white font-bold mb-1">{a.title}</h4>
                  <p className="text-white/50 text-sm line-clamp-2">{a.content}</p>
                  <p className="text-white/25 text-xs mt-2">{new Date(a.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="p-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-white/30 py-12">No announcements yet.</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Announcement" : "Post Announcement"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <Field label="Title *"><input required value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className={input} /></Field>
            <Field label="Content *"><textarea required rows={4} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} className={input} /></Field>
            <Field label="Type">
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className={`${input} appearance-none`}>
                {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e=>setForm(p=>({...p,isPinned:e.target.checked}))} className="accent-[#E60000]" />
                <span className="text-white/60 text-sm">Pin to top</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={e=>setForm(p=>({...p,isVisible:e.target.checked}))} className="accent-[#E60000]" />
                <span className="text-white/60 text-sm">Visible</span>
              </label>
            </div>
            <SaveBtn saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Spinner() { return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" /></div>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1C4A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-white font-bold">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
const input = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#E60000]/60";
function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return <div><label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>{children}</div>;
}
function SaveBtn({ saving }: { saving: boolean }) {
  return <button type="submit" disabled={saving} className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors">{saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<><Save className="w-4 h-4"/>Post</>}</button>;
}
