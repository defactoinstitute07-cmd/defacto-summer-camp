"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";

const SPORTS = ["Badminton","Volleyball","Quiz Competition","Cultural Activities","Painting","TUG-OF-WAR","Fun Activities","General"];
interface Match { _id: string; sport: string; teamA: string; teamB: string; scoreA: number; scoreB: number; date: string; round: string; status: string; winner: string; notes: string; }

const emptyForm = { sport: "Badminton", teamA: "", teamB: "", scoreA: 0, scoreB: 0, date: new Date().toISOString().slice(0,16), round: "Group Stage", status: "upcoming", winner: "", notes: "" };
const statusColor: Record<string,string> = { live:"bg-red-500/20 text-red-400", completed:"bg-green-500/20 text-green-400", upcoming:"bg-yellow-500/20 text-yellow-400" };

export default function MatchesPage() {
  const [items, setItems] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => adminFetch("/matches?limit=100").then(d => setItems(d.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = statusFilter === "all" ? items : items.filter(m => m.status === statusFilter);

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(""); setShowForm(true); };
  const openEdit = (m: Match) => { setEditing(m); setForm({ sport:m.sport, teamA:m.teamA, teamB:m.teamB, scoreA:m.scoreA, scoreB:m.scoreB, date:new Date(m.date).toISOString().slice(0,16), round:m.round, status:m.status, winner:m.winner, notes:m.notes }); setError(""); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const body = JSON.stringify({ ...form, date: new Date(form.date).toISOString() });
      if (editing) await adminFetch(`/matches/${editing._id}`, { method:"PUT", body });
      else await adminFetch("/matches", { method:"POST", body });
      setShowForm(false); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    await adminFetch(`/matches/${id}`, { method:"DELETE" }); load();
  };

  const f = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {["all","upcoming","live","completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${statusFilter===s?"bg-[#E60000] text-white":"bg-white/5 text-white/50 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl">
          <Plus className="w-4 h-4" /> Add Match
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m._id} className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/40 text-xs font-bold uppercase">{m.sport}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[m.status]}`}>{m.status}</span>
                  <span className="text-white/30 text-xs">{m.round}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold truncate">{m.teamA}</span>
                  <span className="text-[#FFDE00] font-black text-xl">{m.scoreA} — {m.scoreB}</span>
                  <span className="text-white font-bold truncate">{m.teamB}</span>
                </div>
                <p className="text-white/30 text-xs mt-1">{new Date(m.date).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(m)} className="p-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(m._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-white/30 py-12">No matches found.</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Match" : "Add Match"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Sport" value={form.sport} options={SPORTS} onChange={v => f("sport",v)} />
              <SelectField label="Status" value={form.status} options={["upcoming","live","completed"]} onChange={v => f("status",v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Team A *" value={form.teamA} onChange={v => f("teamA",v)} />
              <TextField label="Team B *" value={form.teamB} onChange={v => f("teamB",v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Score A" type="number" value={String(form.scoreA)} onChange={v => f("scoreA",Number(v))} />
              <TextField label="Score B" type="number" value={String(form.scoreB)} onChange={v => f("scoreB",Number(v))} />
            </div>
            <TextField label="Date & Time" type="datetime-local" value={form.date} onChange={v => f("date",v)} />
            <TextField label="Round" value={form.round} onChange={v => f("round",v)} />
            <TextField label="Winner (teamA/teamB/draw)" value={form.winner} onChange={v => f("winner",v)} />
            <TextField label="Notes" value={form.notes} onChange={v => f("notes",v)} />
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
const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#E60000]/60";
function TextField({ label, value, onChange, type="text" }: { label:string; value:string; onChange:(v:string)=>void; type?:string }) {
  return <div><label className="block text-white/40 text-xs font-bold uppercase mb-1">{label}</label><input type={type} value={value} onChange={e=>onChange(e.target.value)} className={inputCls} /></div>;
}
function SelectField({ label, value, options, onChange }: { label:string; value:string; options:string[]; onChange:(v:string)=>void }) {
  return <div><label className="block text-white/40 text-xs font-bold uppercase mb-1">{label}</label><select value={value} onChange={e=>onChange(e.target.value)} className={`${inputCls} appearance-none`}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;
}
function SaveBtn({ saving }: { saving: boolean }) {
  return <button type="submit" disabled={saving} className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors">{saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<><Save className="w-4 h-4"/>Save</>}</button>;
}
