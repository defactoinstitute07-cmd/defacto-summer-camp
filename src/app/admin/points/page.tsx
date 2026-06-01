"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, useAdminAuth } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";

interface Entry { _id: string; sport: string; displayName: string; played: number; won: number; lost: number; drawn: number; points: number; rank: number; }
const emptyForm = { sport:"", displayName:"", played:0, won:0, lost:0, drawn:0, points:0, rank:0 };

export default function PointsPage() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<Entry[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [sportTeams, setSportTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Entry|null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

  const load = () => adminFetch("/points").then(d=>setItems(d.data)).finally(()=>setLoading(false));
  useEffect(() => {
    load();
    adminFetch("/games")
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          let names: string[] = d.data.map((g: any) => g.name as string);
          if (admin?.role === "admin") {
            names = names.filter((n: string) =>
              admin.sportsPermissions?.some(sp => sp.toLowerCase() === n.toLowerCase())
            );
          }
          setSports(names);
        }
      })
      .catch((err) => console.warn("Failed to load sports list:", err));
  }, [admin]);

  // Fetch available teams when form's sport changes
  useEffect(() => {
    if (!form.sport) {
      setSportTeams([]);
      return;
    }
    adminFetch(`/teams?sport=${encodeURIComponent(form.sport)}`)
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setSportTeams(d.data);
          if (!editing && d.data.length > 0) {
            setForm(p => ({
              ...p,
              displayName: p.displayName || d.data[0]?.name || "",
            }));
          }
        }
      })
      .catch((err) => console.warn("Failed to load teams for points sport:", err));
  }, [form.sport, editing]);

  const filtered = sportFilter === "all" ? items : items.filter(e=>e.sport===sportFilter);
  const openNew = () => { setEditing(null); setForm({ ...emptyForm, sport: sports[0] || "" }); setError(""); setShowForm(true); };
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

  if (sports.length === 0 && !loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
        <p className="text-slate-500 text-sm font-semibold">No sports assigned to your administrator account. Please contact the Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=>setSportFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${sportFilter==="all"?"bg-[#E60000] text-white shadow-sm":"bg-white text-slate-600 hover:text-slate-900 border border-slate-200"}`}>All</button>
          {sports.map(s=><button key={s} onClick={()=>setSportFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${sportFilter===s?"bg-[#E60000] text-white shadow-sm":"bg-white text-slate-600 hover:text-slate-900 border border-slate-200"}`}>{s}</button>)}
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-[#E60000]/10 transition-colors">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Table view for larger screens */}
          <div className="hidden sm:block bg-white border border-slate-200/80 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  {["Rank","Name","Sport","P","W","L","D","Pts",""].map(h=><th key={h} className="text-left px-4 py-3 font-bold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e,i)=>(
                  <tr key={e._id} className="hover:bg-slate-50/50 text-slate-700 transition-colors">
                    <td className="px-4 py-3"><span className={`font-black text-lg ${i===0?"text-amber-500":i===1?"text-slate-400":i===2?"text-amber-700":"text-slate-400"}`}>#{e.rank||i+1}</span></td>
                    <td className="px-4 py-3 text-slate-800 font-semibold">{e.displayName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{e.sport}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{e.played}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">{e.won}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{e.lost}</td>
                    <td className="px-4 py-3 text-amber-600 font-bold">{e.drawn}</td>
                    <td className="px-4 py-3 text-slate-900 font-black text-base">{e.points}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={()=>openEdit(e)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>handleDelete(e._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={9} className="text-center text-slate-400 py-10">No entries yet.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Card view for mobile screens */}
          <div className="sm:hidden space-y-4">
            {filtered.map((e, i) => {
              const rankVal = e.rank || (i + 1);
              const rankColor = rankVal === 1 ? "bg-amber-50 text-amber-600 border-amber-200" : rankVal === 2 ? "bg-slate-100 text-slate-500 border-slate-300" : rankVal === 3 ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-slate-50 text-slate-400 border-slate-200";
              
              return (
                <div key={e._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Indicator */}
                    <div className={`w-11 h-11 rounded-xl border flex-shrink-0 flex items-center justify-center font-black text-sm ${rankColor}`}>
                      #{rankVal}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-slate-800 font-bold text-sm truncate">{e.displayName}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">{e.sport}</p>
                      {/* Stats Badge Panel */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-bold">
                        <span className="text-slate-500">P: {e.played}</span>
                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">W: {e.won}</span>
                        <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">L: {e.lost}</span>
                        {e.drawn > 0 && <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">D: {e.drawn}</span>}
                        <span className="text-[#0B1C4A] bg-[#0B1C4A]/5 px-2 py-0.5 rounded-md text-xs font-black">Pts: {e.points}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(e)}
                      className="w-11 h-11 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="w-11 h-11 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No entries found.
              </div>
            )}
          </div>
        </>
      )}

      {showForm && (
        <Modal title={editing?"Edit Entry":"Add Entry"} onClose={()=>setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-3">
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <F label="Sport">
              <select value={form.sport} onChange={e=>setForm(p=>({...p,sport:e.target.value}))} className={`${inp} appearance-none bg-white`}>
                {sports.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </F>
            <F label="Name / Team *">
              {sportTeams.length > 0 ? (
                <select value={form.displayName} onChange={e=>setForm(p=>({...p,displayName:e.target.value}))} className={`${inp} appearance-none bg-white`}>
                  {sportTeams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              ) : (
                <input required value={form.displayName} onChange={e=>setForm(p=>({...p,displayName:e.target.value}))} className={inp}/>
              )}
            </F>
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

function Spinner() {
  return <TableSkeleton cols={7} rows={5} />;
}
function Modal({ title, children, onClose }: { title:string; children:React.ReactNode; onClose:()=>void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
const inp = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] focus:ring-2 focus:ring-[#E60000]/10";
function F({ label, children }: { label:string; children:React.ReactNode }) { return <div><label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</label>{children}</div>; }
