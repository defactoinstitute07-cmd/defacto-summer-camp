"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";

const SPORTS = ["Badminton","Volleyball","Quiz Competition","Cultural Activities","Painting","TUG-OF-WAR","Fun Activities","General"];
interface Player { _id: string; name: string; age?: number; sport: string; team: string; profileImageUrl: string; isActive: boolean; }
const emptyForm = { name:"", age:"", sport:"Badminton", team:"", isActive:true };

export default function PlayersPage() {
  const [items, setItems] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = () => adminFetch("/players?limit=200").then(d => setItems(d.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = items
    .filter(p => sportFilter === "all" || p.sport === sportFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm(emptyForm); setImageFile(null); setError(""); setShowForm(true); };
  const openEdit = (p: Player) => { setEditing(p); setForm({ name:p.name, age:p.age?String(p.age):"", sport:p.sport, team:p.team, isActive:p.isActive }); setImageFile(null); setError(""); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (v !== "") fd.append(k, String(v)); });
      if (imageFile) fd.append("profileImage", imageFile);
      if (editing) await adminFetchForm(`/players/${editing._id}`, fd, "PUT");
      else await adminFetchForm("/players", fd, "POST");
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    await adminFetch(`/players/${id}`, { method:"DELETE" }); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none w-40" />
          <select value={sportFilter} onChange={e=>setSportFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none appearance-none">
            <option value="all">All Sports</option>
            {SPORTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl">
          <Plus className="w-4 h-4" /> Add Player
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="border-b border-white/5">
              <tr className="text-white/30 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-bold">Player</th>
                <th className="text-left px-5 py-3 font-bold">Sport</th>
                <th className="text-left px-5 py-3 font-bold hidden sm:table-cell">Team</th>
                <th className="text-left px-5 py-3 font-bold hidden sm:table-cell">Age</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p=>(
                <tr key={p._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.profileImageUrl ? <img src={p.profileImageUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-[#E60000]/20 flex items-center justify-center text-[#E60000] text-xs font-black">{p.name[0]}</div>}
                      <span className="text-white font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/60 text-xs">{p.sport}</td>
                  <td className="px-5 py-3 text-white/50 hidden sm:table-cell">{p.team || "—"}</td>
                  <td className="px-5 py-3 text-white/50 hidden sm:table-cell">{p.age || "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={()=>openEdit(p)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg"><Pencil className="w-3.5 h-3.5"/></button>
                      <button onClick={()=>handleDelete(p._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-white/30 py-10">No players found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing?"Edit Player":"Add Player"} onClose={()=>setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <F label="Name *"><input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className={inp}/></F>
            <F label="Sport *">
              <select value={form.sport} onChange={e=>setForm(p=>({...p,sport:e.target.value}))} className={`${inp} appearance-none`}>
                {SPORTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Team"><input value={form.team} onChange={e=>setForm(p=>({...p,team:e.target.value}))} className={inp}/></F>
              <F label="Age"><input type="number" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))} className={inp} min={4} max={25}/></F>
            </div>
            <F label="Photo"><input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0]||null)} className="w-full text-white/50 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#E60000]/20 file:text-[#E60000] file:font-bold file:text-xs hover:file:bg-[#E60000]/30 cursor-pointer"/></F>
            <button type="submit" disabled={saving} className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors">
              {saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<><Save className="w-4 h-4"/>Save</>}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Spinner() { return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin"/></div>; }
function Modal({ title, children, onClose }: { title:string; children:React.ReactNode; onClose:()=>void }) {
  return <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-[#0B1C4A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl"><div className="flex items-center justify-between px-6 py-4 border-b border-white/5"><h3 className="text-white font-bold">{title}</h3><button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5"/></button></div><div className="p-6">{children}</div></div></div>;
}
const inp = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#E60000]/60";
function F({ label, children }: { label:string; children:React.ReactNode }) { return <div><label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>{children}</div>; }
