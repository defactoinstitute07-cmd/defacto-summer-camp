"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save, Pin } from "lucide-react";

const TYPES = ["general","info","result","urgent","schedule"];
interface Ann { _id: string; title: string; content: string; type: string; isPinned: boolean; isVisible: boolean; createdAt: string; }

const emptyForm = { title:"", content:"", type:"general", isPinned:false, isVisible:true };
const typeColor: Record<string,string> = { info:"bg-blue-50 text-blue-700 border border-blue-200", result:"bg-green-50 text-green-700 border border-green-200", urgent:"bg-red-50 text-red-700 border border-red-200", general:"bg-slate-100 text-slate-700 border border-slate-200", schedule:"bg-yellow-50 text-yellow-700 border border-yellow-200" };

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
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-[#E60000]/10 transition-colors">
          <Plus className="w-4 h-4" /> Post Announcement
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {items.map(a => (
            <div key={a._id} className={`bg-white border rounded-2xl p-5 ${a.isPinned ? "border-amber-400 shadow-sm shadow-amber-50/50" : "border-slate-200/80 shadow-sm"} hover:shadow-md transition-all duration-200`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {a.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor[a.type]}`}>{a.type}</span>
                    {!a.isVisible && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">Hidden</span>}
                  </div>
                  <h4 className="text-slate-800 font-bold mb-1">{a.title}</h4>
                  <p className="text-slate-500 text-sm line-clamp-2">{a.content}</p>
                  <p className="text-slate-400 text-xs mt-2">{new Date(a.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a._id)} className="p-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-slate-400 py-12">No announcements yet.</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Announcement" : "Post Announcement"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <Field label="Title *"><input required value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className={input} /></Field>
            <Field label="Content *"><textarea required rows={4} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} className={input} /></Field>
            <Field label="Type">
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className={`${input} appearance-none bg-white`}>
                {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e=>setForm(p=>({...p,isPinned:e.target.checked}))} className="accent-[#E60000]" />
                <span className="text-slate-600 text-sm">Pin to top</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={e=>setForm(p=>({...p,isVisible:e.target.checked}))} className="accent-[#E60000]" />
                <span className="text-slate-600 text-sm">Visible</span>
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
const input = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] focus:ring-2 focus:ring-[#E60000]/10";
function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return <div><label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>{children}</div>;
}
function SaveBtn({ saving }: { saving: boolean }) {
  return <button type="submit" disabled={saving} className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors">{saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<><Save className="w-4 h-4"/>Post</>}</button>;
}
