"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";

const SPORTS = ["Badminton","Volleyball","Quiz Competition","Cultural Activities","Painting","TUG-OF-WAR","Fun Activities","General"];
interface Entry { _id: string; sport: string; displayName: string; played: number; won: number; lost: number; drawn: number; points: number; rank: number; }
const emptyForm = { sport:"Badminton", displayName:"", played:0, won:0, lost:0, drawn:0, points:0, rank:0 };

export default function PointsPage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Entry|null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  const load = () => adminFetch("/points").then(d=>setItems(d.data)).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const filtered = sportFilter === "all" ? items : items.filter(e=>e.sport===sportFilter);
  const openNew = () => { setEditing(null); setForm(emptyForm); setError(""); setShowForm(true); };
  const openEdit = (e: Entry) => { setEditing(e); setForm({ sport:e.sport, displayName:e.displayName, played:e.played, won:e.won, lost:e.lost, drawn:e.drawn, points:e.points, rank:e.rank }); setError(""); setShowForm(true); };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true); setError("");
    try {
      const body = JSON.stringify(form);
      if (editing) await adminFetch(`/points/${editing._id}`, { method:"PUT", body });
      else await adminFetch("/points", { method:"POST", body });
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete entry?")) return;
    await adminFetch(`/points/${id}`, { method:"DELETE" }); load();
  };

  const n = (k: string, v: string) => setForm(p=>({ ...p, [k]: Number(v) }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=>setSportFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${sportFilter==="all"?"bg-[#E60000] text-white":"bg-white/5 text-white/50 hover:text-white"}`}>All</button>
          {SPORTS.map(s=><button key={s} onClick={()=>setSportFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap ${sportFilter===s?"bg-[#E60000] text-white":"bg-white/5 text-white/50 hover:text-white"}`}>{s}</button>)}
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-white/5">
              <tr className="text-white/30 text-xs uppercase tracking-wider">
                {["Rank","Name","Sport","P","W","L","D","Pts",""].map(h=><th key={h} className="text-left px-4 py-3 font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((e,i)=>(
                <tr key={e._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3"><span className={`font-black text-lg ${i===0?"text-[#FFDE00]":i===1?"text-slate-300":i===2?"text-amber-600":"text-white/40"}`}>#{e.rank||i+1}</span></td>
                  <td className="px-4 py-3 text-white font-semibold">{e.displayName}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{e.sport}</td>
                  <td className="px-4 py-3 text-white/70">{e.played}</td>
                  <td className="px-4 py-3 text-green-400">{e.won}</td>
                  <td className="px-4 py-3 text-red-400">{e.lost}</td>
                  <td className="px-4 py-3 text-yellow-400">{e.drawn}</td>
                  <td className="px-4 py-3 text-[#FFDE00] font-black">{e.points}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={()=>openEdit(e)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg"><Pencil className="w-3.5 h-3.5"/></button>
                      <button onClick={()=>handleDelete(e._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={9} className="text-center text-white/30 py-10">No entries yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing?"Edit Entry":"Add Entry"} onClose={()=>setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-3">
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <F label="Sport"><select value={form.sport} onChange={e=>setForm(p=>({...p,sport:e.target.value}))} className={`${inp} appearance-none`}>{SPORTS.map(s=><option key={s} value={s}>{s}</option>)}</select></F>
            <F label="Name / Team *"><input required value={form.displayName} onChange={e=>setForm(p=>({...p,displayName:e.target.value}))} className={inp}/></F>
            <div className="grid grid-cols-3 gap-3">
              <F label="Played"><input type="number" min={0} value={form.played} onChange={e=>n("played",e.target.value)} className={inp}/></F>
              <F label="Won"><input type="number" min={0} value={form.won} onChange={e=>n("won",e.target.value)} className={inp}/></F>
              <F label="Lost"><input type="number" min={0} value={form.lost} onChange={e=>n("lost",e.target.value)} className={inp}/></F>
              <F label="Drawn"><input type="number" min={0} value={form.drawn} onChange={e=>n("drawn",e.target.value)} className={inp}/></F>
              <F label="Points"><input type="number" value={form.points} onChange={e=>n("points",e.target.value)} className={inp}/></F>
              <F label="Rank"><input type="number" min={0} value={form.rank} onChange={e=>n("rank",e.target.value)} className={inp}/></F>
            </div>
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
function F({ label, children }: { label:string; children:React.ReactNode }) { return <div><label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-1">{label}</label>{children}</div>; }
