"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm, useAdminAuth } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";

interface Player { _id: string; name: string; age?: number; sport: string; team: string; teamRef?: string; profileImageUrl: string; isActive: boolean; }
interface Team { _id: string; name: string; sport: string; }

export default function PlayersPage() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<Player[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState({ name:"", age:"", sport:"", team:"", teamRef:"", isActive:true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminFetch("/players?limit=200").then(d => setItems(d.data)).finally(() => setLoading(false));
  };

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

  // Fetch available teams when the form's sport changes
  useEffect(() => {
    if (!form.sport) {
      setAvailableTeams([]);
      return;
    }
    adminFetch(`/teams?sport=${encodeURIComponent(form.sport)}`)
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setAvailableTeams(d.data);
        }
      })
      .catch((err) => console.warn("Failed to load teams for sport:", err));
  }, [form.sport]);

  const filtered = items
    .filter(p => sportFilter === "all" || p.sport === sportFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", age: "", sport: sports[0] || "", team: "", teamRef: "", isActive: true });
    setImageFile(null);
    setError("");
    setShowForm(true);
  };
  const openEdit = (p: Player) => {
    setEditing(p);
    setForm({ name:p.name, age:p.age?String(p.age):"", sport:p.sport, team:p.team, teamRef:p.teamRef || "", isActive:p.isActive });
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => {
        if (v !== "") fd.append(k, String(v));
      });
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none w-40" />
          <select value={sportFilter} onChange={e=>setSportFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none appearance-none">
            <option value="all">All Sports</option>
            {sports.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-[#E60000]/10 transition-colors">
          <Plus className="w-4 h-4" /> Add Player
        </button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Table view for larger screens */}
          <div className="hidden sm:block bg-white border border-slate-200/80 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-bold">Player</th>
                  <th className="text-left px-5 py-3 font-bold">Sport</th>
                  <th className="text-left px-5 py-3 font-bold hidden sm:table-cell">Team</th>
                  <th className="text-left px-5 py-3 font-bold hidden sm:table-cell">Age</th>
                  <th className="text-right px-5 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p=>(
                  <tr key={p._id} className="hover:bg-slate-50/50 text-slate-700 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.profileImageUrl ? <img src={p.profileImageUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-slate-200"/> : <div className="w-8 h-8 rounded-full bg-[#E60000]/10 flex items-center justify-center text-[#E60000] text-xs font-black">{p.name[0]}</div>}
                        <span className="text-slate-800 font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{p.sport}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{p.team || "—"}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{p.age || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={()=>openEdit(p)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>handleDelete(p._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 py-10">No players found.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Card view for mobile screens */}
          <div className="sm:hidden space-y-4">
            {filtered.map(p => (
              <div key={p._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {p.profileImageUrl ? (
                    <img src={p.profileImageUrl} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E60000]/10 flex items-center justify-center text-[#E60000] text-sm font-black flex-shrink-0">
                      {p.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-slate-800 font-bold text-sm truncate">{p.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{p.sport}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Team: {p.team || "Independent"} {p.age ? `• Age: ${p.age}` : ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="w-11 h-11 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="w-11 h-11 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No players found.
              </div>
            )}
          </div>
        </>
      )}

      {showForm && (
        <Modal title={editing?"Edit Player":"Add Player"} onClose={()=>setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <F label="Name *"><input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className={inp}/></F>
            <F label="Sport *">
              <select value={form.sport} onChange={e=>setForm(p=>({...p,sport:e.target.value}))} className={`${inp} appearance-none bg-white`}>
                {sports.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Team">
                {availableTeams.length > 0 ? (
                  <select
                    value={form.teamRef}
                    onChange={(e) => {
                      const teamId = e.target.value;
                      const selectedTeam = availableTeams.find(t => t._id === teamId);
                      setForm(p => ({
                        ...p,
                        teamRef: teamId,
                        team: selectedTeam ? selectedTeam.name : ""
                      }));
                    }}
                    className={`${inp} appearance-none bg-white`}
                  >
                    <option value="">Independent / None</option>
                    {availableTeams.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.team}
                    onChange={e => setForm(p => ({ ...p, team: e.target.value, teamRef: "" }))}
                    className={inp}
                    placeholder="e.g. Independent"
                  />
                )}
              </F>
              <F label="Age"><input type="number" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))} className={inp} min={4} max={25}/></F>
            </div>
            <F label="Photo"><input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0]||null)} className="w-full text-slate-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-[#E60000] file:font-bold file:text-xs hover:file:bg-red-100 cursor-pointer"/></F>
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
  return <TableSkeleton cols={4} rows={5} />;
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
function F({ label, children }: { label:string; children:React.ReactNode }) { return <div><label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>{children}</div>; }
