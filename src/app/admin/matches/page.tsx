"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, adminFetchForm, useAdminAuth } from "../context/AdminAuthContext";
import { Plus, Pencil, Trash2, X, Save, Play, Pause, CheckCircle, Activity, Calendar, Trophy } from "lucide-react";

interface SetScore { scoreA: number; scoreB: number; }
interface TimelineEvent { scoreA: number; scoreB: number; text: string; time: string; }
interface Match {
  _id: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
  round: string;
  status: string;
  winner: string;
  notes: string;
  sets?: SetScore[];
  timeline?: TimelineEvent[];
  maxPoints?: number;
}

function getContrastColor(hexColor: string) {
  if (!hexColor || !hexColor.startsWith("#")) return "#ffffff";
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

const emptyForm = {
  sport: "",
  teamA: "",
  teamB: "",
  scoreA: 0,
  scoreB: 0,
  date: new Date().toISOString().slice(0,16),
  round: "Group Stage",
  status: "upcoming",
  winner: "",
  notes: "",
  sets: [] as SetScore[],
  timeline: [] as TimelineEvent[],
  maxPoints: 0,
};
const statusColor: Record<string,string> = {
  live: "bg-green-500 text-white border border-green-400 shadow-[0_2px_6px_rgba(34,197,94,0.3)] animate-pulse font-black uppercase text-[9px] tracking-wider",
  paused: "bg-amber-500 text-white border border-amber-400 shadow-[0_2px_6px_rgba(245,158,11,0.3)] font-black uppercase text-[9px] tracking-wider",
  completed: "bg-red-650 text-black border border-red-500 shadow-[0_2px_6px_rgba(220,38,38,0.3)] font-black uppercase text-[9px] tracking-wider",
  upcoming: "bg-slate-100 text-slate-500 border border-slate-200 font-black uppercase text-[9px] tracking-wider"
};

export default function MatchesPage() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<Match[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [sportTeams, setSportTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");

  const load = () => adminFetch("/matches?limit=100").then(d => setItems(d.data)).finally(() => setLoading(false));
  useEffect(() => {
    load();
    adminFetch("/games")
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          let names = d.data.map((g: any) => g.name);
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
              teamA: d.data[0]?.name || "",
              teamB: d.data[1]?.name || d.data[0]?.name || "",
            }));
          }
        }
      })
      .catch((err) => console.warn("Failed to load teams for matches sport:", err));
  }, [form.sport, editing]);

  useEffect(() => {
    if (form.maxPoints > 0) {
      const reachedA = form.scoreA >= form.maxPoints;
      const reachedB = form.scoreB >= form.maxPoints;
      if (reachedA || reachedB) {
        setForm(p => {
          const targetWinner = reachedA ? "teamA" : "teamB";
          if (p.status !== "completed" || p.winner !== targetWinner) {
            return {
              ...p,
              status: "completed",
              winner: targetWinner
            };
          }
          return p;
        });
      }
    }
  }, [form.scoreA, form.scoreB, form.maxPoints]);

  const getStatusRank = (status: string) => {
    if (status === "upcoming") return 1;
    if (status === "live" || status === "paused") return 2;
    if (status === "completed") return 3;
    return 4;
  };

  const filtered = items
    .filter(m => statusFilter === "all" || m.status === statusFilter)
    .filter(m => sportFilter === "all" || m.sport === sportFilter)
    .filter(m => {
      if (admin?.role === "admin") {
        return admin.sportsPermissions?.some(
          (s) => s.toLowerCase() === m.sport.toLowerCase()
        ) || false;
      }
      return true;
    })
    .sort((a, b) => {
      const rankA = getStatusRank(a.status);
      const rankB = getStatusRank(b.status);
      if (rankA !== rankB) return rankA - rankB;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, sport: sports[0] || "" });
    setError("");
    setShowForm(true);
  };
  const openEdit = (m: Match) => {
    setEditing(m);
    setForm({
      sport: m.sport,
      teamA: m.teamA,
      teamB: m.teamB,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      date: new Date(m.date).toISOString().slice(0, 16),
      round: m.round,
      status: m.status,
      winner: m.winner,
      notes: m.notes,
      sets: m.sets || [],
      timeline: m.timeline || [],
      maxPoints: m.maxPoints || 0,
    });
    setError("");
    setShowForm(true);
  };

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

  const startLiveMatch = async (m: Match) => {
    if (!confirm(`Start live match for ${m.teamA} vs ${m.teamB}?`)) return;
    try {
      const timeVal = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const timelineEvent = {
        scoreA: m.scoreA,
        scoreB: m.scoreB,
        text: "Match Started (Live)",
        time: timeVal
      };
      
      const body = JSON.stringify({
        ...m,
        status: "live",
        timeline: [...(m.timeline || []), timelineEvent]
      });
      await adminFetch(`/matches/${m._id}`, { method: "PUT", body });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to start live match.");
    }
  };

  const handleImmediateScoreUpdate = async (newScoreA: number, newScoreB: number, timelineEventText?: string) => {
    if (!editing) return;
    try {
      let updatedTimeline = [...form.timeline];
      if (timelineEventText) {
        const timeVal = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        updatedTimeline.push({
          scoreA: newScoreA,
          scoreB: newScoreB,
          text: timelineEventText,
          time: timeVal
        });
      }

      let updatedStatus = form.status;
      let updatedWinner = form.winner;
      if (form.maxPoints > 0) {
        if (newScoreA >= form.maxPoints || newScoreB >= form.maxPoints) {
          updatedStatus = "completed";
          updatedWinner = newScoreA >= form.maxPoints ? "teamA" : "teamB";
        }
      }

      setForm(p => ({ 
        ...p, 
        scoreA: newScoreA, 
        scoreB: newScoreB, 
        status: updatedStatus,
        winner: updatedWinner,
        timeline: updatedTimeline 
      }));

      const res = await adminFetch(`/matches/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({ 
          ...form, 
          scoreA: newScoreA, 
          scoreB: newScoreB, 
          status: updatedStatus,
          winner: updatedWinner,
          timeline: updatedTimeline 
        }),
      });
      if (res.success) load();
    } catch (err: any) {
      setError(err.message || "Failed to update score.");
    }
  };

  const handleImmediateStatusUpdate = async (newStatus: string, timelineText?: string) => {
    if (!editing) return;
    try {
      let updatedTimeline = [...form.timeline];
      if (timelineText) {
        const timeVal = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        updatedTimeline.push({
          scoreA: form.scoreA,
          scoreB: form.scoreB,
          text: timelineText,
          time: timeVal
        });
      }

      setForm(p => ({ ...p, status: newStatus, timeline: updatedTimeline }));

      const res = await adminFetch(`/matches/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, status: newStatus, timeline: updatedTimeline }),
      });
      if (res.success) load();
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    }
  };

  const handleImmediateSetsUpdate = async (newSets: SetScore[]) => {
    if (!editing) return;
    try {
      const res = await adminFetch(`/matches/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, sets: newSets }),
      });
      if (res.success) load();
    } catch (err: any) {
      setError(err.message || "Failed to update sets.");
    }
  };

  const handleImmediateTimelineUpdate = async (eventText: string) => {
    if (!editing) return;
    try {
      const timeVal = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const updatedTimeline = [...form.timeline, {
        scoreA: form.scoreA,
        scoreB: form.scoreB,
        text: eventText,
        time: timeVal
      }];

      setForm(p => ({ ...p, timeline: updatedTimeline }));

      const res = await adminFetch(`/matches/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, timeline: updatedTimeline }),
      });
      if (res.success) load();
    } catch (err: any) {
      setError(err.message || "Failed to log timeline event.");
    }
  };

  const handleImmediateTimelineWrite = async (newTimeline: TimelineEvent[]) => {
    if (!editing) return;
    try {
      const res = await adminFetch(`/matches/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, timeline: newTimeline }),
      });
      if (res.success) load();
    } catch (err: any) {
      setError(err.message || "Failed to delete timeline event.");
    }
  };

  const handleResetScore = async () => {
    if (!editing) return;
    if (!confirm("Are you sure you want to reset the scores for this match? This cannot be undone.")) return;
    try {
      const timeVal = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const updatedTimeline = [...form.timeline, {
        scoreA: 0,
        scoreB: 0,
        text: "Scores reset to 0 - 0",
        time: timeVal
      }];

      setForm(p => ({ ...p, scoreA: 0, scoreB: 0, timeline: updatedTimeline }));

      const res = await adminFetch(`/matches/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, scoreA: 0, scoreB: 0, timeline: updatedTimeline }),
      });
      if (res.success) load();
    } catch (err: any) {
      setError(err.message || "Failed to reset score.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          {["all","upcoming","live","paused","completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${statusFilter===s?"bg-[#E60000] text-white border-transparent":"bg-white text-slate-600 hover:bg-slate-50 border-slate-200"}`}>
              {s}
            </button>
          ))}
          <select value={sportFilter} onChange={e=>setSportFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none appearance-none ml-2">
            <option value="all">All Sports</option>
            {sports.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {admin?.role === "superadmin" && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Match
          </button>
        )}
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m._id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-400 text-xs font-bold uppercase">{m.sport}</span>
                  <span className={`px-2 py-0.5 rounded-full border ${statusColor[m.status]}`}>{m.status}</span>
                  <span className="text-slate-400 text-xs">{m.round}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-800 font-bold truncate">{m.teamA}</span>
                  <span className="text-[#0B1C4A] font-black text-xl">{m.scoreA} — {m.scoreB}</span>
                  <span className="text-slate-800 font-bold truncate">{m.teamB}</span>
                </div>
                <p className="text-slate-400 text-xs mt-1">{new Date(m.date).toLocaleString("en-IN")}</p>
                {/* Live Match quick triggers */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {m.status === "upcoming" && (
                    <button
                      onClick={() => startLiveMatch(m)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                      Start Live Match
                    </button>
                  )}
                  {(m.status === "live" || m.status === "paused") && (
                    <button
                      onClick={() => openEdit(m)}
                      className={`px-3 py-1.5 border font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                        m.status === "live"
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-500 animate-pulse"
                          : "bg-amber-500 hover:bg-amber-600 text-white border-amber-400"
                      }`}
                    >
                      {m.status === "live" ? <Activity className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5 text-white" />}
                      Match Control Board
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(m)} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200/50" title="Edit Match"><Pencil className="w-4 h-4" /></button>
                {admin?.role === "superadmin" && (
                  <button onClick={() => handleDelete(m._id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl border border-red-200/20" title="Delete Match"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-slate-400 py-12">No matches found.</p>}
        </div>
      )}

      {showForm && (() => {
        const teamAColor = sportTeams.find(t => t.name === form.teamA)?.color || "#0B1C4A";
        const teamBColor = sportTeams.find(t => t.name === form.teamB)?.color || "#0B1C4A";
        const isLive = form.status === "live" || form.status === "paused";
        return (
          <Modal 
  title={editing ? "Edit Match" : "Add Match"} 
  onClose={() => setShowForm(false)} 
  maxWidth={(form.status === "live" || form.status === "paused") ? "max-w-5xl" : "max-w-4xl"}
>
  <form onSubmit={handleSave} className="space-y-6 pb-24 relative">
    {error && (
      <p className="text-red-500 text-sm bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20">
        {error}
      </p>
    )}
    
    {/* ==================================================================== */}
    {/* CASE 1: LIVE OR PAUSED MATCH CONSOLE (DESKTOP DUAL COLUMN)          */}
    {/* ==================================================================== */}
    {(form.status === "live" || form.status === "paused") ? (
      <div className="space-y-6">
       {/* Status Action Controls */}
<div className="flex flex-wrap items-center gap-3">
  {form.status === "live" ? (
    <button
      type="button"
      onClick={() =>
        handleImmediateStatusUpdate("paused", "Match Paused")
      }
      className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
      bg-gradient-to-r from-amber-500 to-orange-500
      hover:from-amber-600 hover:to-orange-600
      text-white text-xs font-bold tracking-wide
      shadow-lg shadow-amber-500/25
      border border-amber-400/50
      transition-all duration-200
      hover:scale-105 active:scale-95"
    >
      <Pause className="w-4 h-4 transition-transform group-hover:scale-110" />
      Pause Match
    </button>
  ) : (
    <button
      type="button"
      onClick={() =>
        handleImmediateStatusUpdate("live", "Match Resumed")
      }
      className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
      bg-gradient-to-r from-emerald-500 to-green-600
      hover:from-emerald-600 hover:to-green-700
      text-white text-xs font-bold tracking-wide
      shadow-lg shadow-green-500/25
      border border-green-400/50
      transition-all duration-200
      hover:scale-105 active:scale-95"
    >
      <Play className="w-4 h-4 fill-white animate-pulse" />
      Resume Match
    </button>
  )}

  <button
    type="button"
    onClick={() =>
      handleImmediateStatusUpdate("completed", "Match Finished")
    }
    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
    bg-gradient-to-r from-red-500 to-rose-600
    hover:from-red-600 hover:to-rose-700
    text-white text-xs font-bold tracking-wide
    shadow-lg shadow-red-500/25
    border border-red-400/50
    transition-all duration-200
    hover:scale-105 active:scale-95"
  >
    <CheckCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
    End Match
  </button>
</div>

        {/* Layout Column Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Scoreboard & Sets Matrix */}
          <div className="lg:col-span-5 space-y-6 bg-slate-50/50 p-4 sm:p-5 border border-slate-200/60 rounded-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score keeping & sets</div>
            
            {/* Main Live Scoreboard Panels */}
            <div className="grid grid-cols-2 gap-4">
              {/* Team A Panel */}
              <div className="flex flex-col items-center bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide truncate max-w-full mb-1">
                  {form.teamA}
                </span>
                <span className="text-5xl font-black text-[#E60000] my-3 select-none">
                  {form.scoreA}
                </span>
                <button
                  type="button"
                  disabled={(form.status as string) === "completed"}
                  onClick={() => handleImmediateScoreUpdate(Math.max(0, form.scoreA - 1), form.scoreB, `Score corrected for ${form.teamA}`)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 text-xs font-bold rounded-xl border border-slate-200/60 transition-all cursor-pointer active:scale-95 w-full text-center"
                >
                  -1 Point
                </button>
              </div>

              {/* Team B Panel */}
              <div className="flex flex-col items-center bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide truncate max-w-full mb-1">
                  {form.teamB}
                </span>
                <span className="text-5xl font-black text-[#0B1C4A] my-3 select-none">
                  {form.scoreB}
                </span>
                <button
                  type="button"
                  disabled={(form.status as string) === "completed"}
                  onClick={() => handleImmediateScoreUpdate(form.scoreA, Math.max(0, form.scoreB - 1), `Score corrected for ${form.teamB}`)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 text-xs font-bold rounded-xl border border-slate-200/60 transition-all cursor-pointer active:scale-95 w-full text-center"
                >
                  -1 Point
                </button>
              </div>
            </div>

            {/* Reset Scores Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleResetScore}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-slate-200/50 shadow-sm"
              >
                Reset Scores
              </button>
            </div>

            {/* Set Scores Matrix Tracker */}
            <div className="border-t border-slate-200/60 pt-4">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Set Scores Matrix</label>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                {form.sets.map((set, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 w-14 shrink-0">Set {idx + 1}</span>
                    <input
                      type="number"
                      min={0}
                      disabled={(form.status as string) === "completed"}
                      value={set.scoreA}
                      onChange={(e) => {
                        const updatedSets = [...form.sets];
                        updatedSets[idx].scoreA = Number(e.target.value);
                        setForm(p => ({ ...p, sets: updatedSets }));
                        handleImmediateSetsUpdate(updatedSets);
                      }}
                      className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold focus:outline-none focus:border-slate-400"
                      placeholder="A"
                    />
                    <span className="text-slate-300 text-xs">—</span>
                    <input
                      type="number"
                      min={0}
                      disabled={(form.status as string) === "completed"}
                      value={set.scoreB}
                      onChange={(e) => {
                        const updatedSets = [...form.sets];
                        updatedSets[idx].scoreB = Number(e.target.value);
                        setForm(p => ({ ...p, sets: updatedSets }));
                        handleImmediateSetsUpdate(updatedSets);
                      }}
                      className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold focus:outline-none focus:border-slate-400"
                      placeholder="B"
                    />
                    <button
                      type="button"
                      disabled={(form.status as string) === "completed"}
                      onClick={() => {
                        const updatedSets = form.sets.filter((_, sIdx) => sIdx !== idx);
                        setForm(p => ({ ...p, sets: updatedSets }));
                        handleImmediateSetsUpdate(updatedSets);
                      }}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 text-xs font-bold ml-auto transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={(form.status as string) === "completed"}
                onClick={() => {
                  const updatedSets = [...form.sets, { scoreA: 0, scoreB: 0 }];
                  setForm(p => ({ ...p, sets: updatedSets }));
                  handleImmediateSetsUpdate(updatedSets);
                }}
                className="px-3 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200 w-full shadow-sm text-center cursor-pointer"
              >
                + Add Set Score
              </button>
            </div>
          </div>

          {/* Right Column: Timeline Event Templates & Activity Logs */}
          <div className="lg:col-span-7 space-y-6 bg-slate-50/50 p-4 sm:p-5 border border-slate-200/60 rounded-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline events & logs</div>
            
            {/* Quick Log Templates Panel */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Quick Log templates
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner">
                {[
                  "Point Scored",
                  "Goal Scored",
                  "Ace Served",
                  "Fault",
                  "Timeout Called",
                  "Yellow Card",
                  "Red Card",
                  "Half Time",
                  "Substitution",
                  "Match Started",
                ].map(template => (
                  <button
                    key={template}
                    type="button"
                    disabled={(form.status as string) === "completed"}
                    onClick={() => {
                      const eventText = `${template} - ${form.teamA} (${form.scoreA}) vs ${form.teamB} (${form.scoreB})`;
                      handleImmediateTimelineUpdate(eventText);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-[#E60000] border border-slate-200/60 text-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Event Logger */}
            <div className="border-t border-slate-200/60 pt-4">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Custom Event Log</label>
              <div className="flex gap-2 mb-3">
                <input
                  id="new-live-event-text"
                  type="text"
                  disabled={(form.status as string) === "completed"}
                  placeholder="e.g. Spiked by A / Timeout B"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={(form.status as string) === "completed"}
                  onClick={() => {
                    const el = document.getElementById("new-live-event-text") as HTMLInputElement;
                    const textVal = el?.value?.trim();
                    if (!textVal) return;
                    handleImmediateTimelineUpdate(textVal);
                    if (el) el.value = "";
                  }}
                  className="px-4 py-2 bg-[#0B1C4A] hover:bg-[#0b1c4a]/90 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Log
                </button>
              </div>

              {/* Feed List Container */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner">
                {form.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 font-mono text-[9px] shrink-0">{event.time}</span>
                    <span className="text-slate-800 font-medium flex-1 truncate">{event.text}</span>
                    <span className="font-bold text-[#E60000] bg-[#E60000]/10 px-1.5 py-0.5 rounded text-[9px] shrink-0">
                      {event.scoreA} - {event.scoreB}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedTimeline = form.timeline.filter((_, tIdx) => tIdx !== idx);
                        setForm(p => ({ ...p, timeline: updatedTimeline }));
                        handleImmediateTimelineWrite(updatedTimeline);
                      }}
                      className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {form.timeline.length === 0 && (
                  <p className="text-center text-slate-400 text-xs py-4">No timeline events recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Bottom Sticky Real-Time Increment Console */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 flex gap-4 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] rounded-b-3xl">
          <div className="flex gap-3 w-full max-w-4xl mx-auto">
            <button
              type="button"
              disabled={(form.status as string) === "completed"}
              onClick={() => handleImmediateScoreUpdate(form.scoreA + 1, form.scoreB, `Point scored by ${form.teamA}`)}
              style={{ backgroundColor: teamAColor, color: getContrastColor(teamAColor) }}
              className="flex-1 h-14 font-black text-xs uppercase tracking-wider rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-md border-b-4 border-black/20 hover:brightness-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-[9px] font-bold opacity-80 truncate max-w-[150px]">{form.teamA || "Team A"}</span>
              <span className="text-xs font-black">+1 Point ({form.scoreA + 1})</span>
            </button>

            <button
              type="button"
              disabled={(form.status as string) === "completed"}
              onClick={() => handleImmediateScoreUpdate(form.scoreA, form.scoreB + 1, `Point scored by ${form.teamB}`)}
              style={{ backgroundColor: teamBColor, color: getContrastColor(teamBColor) }}
              className="flex-1 h-14 font-black text-xs uppercase tracking-wider rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-md border-b-4 border-black/20 hover:brightness-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-[9px] font-bold opacity-80 truncate max-w-[150px]">{form.teamB || "Team B"}</span>
              <span className="text-xs font-black">+1 Point ({form.scoreB + 1})</span>
            </button>
          </div>
        </div>
      </div>
    ) : (
      
      // ==================================================================== 
      // CASE 2: GENERAL UPCOMING/COMPLETED SCREEN LAYOUT (RESPONSIVE GRID)  
      // ==================================================================== 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Core Configurations & Identifiers */}
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Match Metadata</div>
          
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Sport" value={form.sport} options={sports} onChange={v => f("sport",v)} disabled={admin?.role !== "superadmin"} />
            <SelectField label="Status" value={form.status} options={["upcoming","live","paused","completed"]} onChange={v => f("status",v)} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sportTeams.length > 0 ? (
              <SelectField label="Team A *" value={form.teamA} options={sportTeams.map(t => t.name)} onChange={v => f("teamA",v)} disabled={admin?.role !== "superadmin"} />
            ) : (
              <TextField label="Team A *" value={form.teamA} onChange={v => f("teamA",v)} disabled={admin?.role !== "superadmin"} />
            )}
            {sportTeams.length > 0 ? (
              <SelectField label="Team B *" value={form.teamB} options={sportTeams.map(t => t.name)} onChange={v => f("teamB",v)} disabled={admin?.role !== "superadmin"} />
            ) : (
              <TextField label="Team B *" value={form.teamB} onChange={v => f("teamB",v)} disabled={admin?.role !== "superadmin"} />
            )}
          </div>

          <TextField label="Date & Time" type="datetime-local" value={form.date} onChange={v => f("date",v)} disabled={admin?.role !== "superadmin"} />
          
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Round" value={form.round} onChange={v => f("round",v)} disabled={admin?.role !== "superadmin"} />
            <TextField label="Maximum Points" type="number" value={String(form.maxPoints || 0)} onChange={v => f("maxPoints",Number(v))} disabled={(form.status as string) === "completed"} />
          </div>
          
          <TextField label="Notes / Information" value={form.notes} onChange={v => f("notes",v)} />
        </div>

        {/* Right Column: Referee Controllers & Matrices */}
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Scores & Parameters</div>
          
          {/* Quick Score Adjust Console */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="text-center font-bold text-[10px] uppercase tracking-widest text-slate-400">
              Referee Score Board
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Team A Adjuster */}
              <div className="flex flex-col items-center p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                <div className="text-[10px] font-black text-slate-500 truncate max-w-full mb-1 uppercase" style={{ color: teamAColor }}>
                  {form.teamA || "Team A"}
                </div>
                <div className="text-3xl font-black mb-2" style={{ color: teamAColor }}>
                  {form.scoreA}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, scoreA: Math.max(0, p.scoreA - 1) }))}
                    className="flex-1 py-1.5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-lg border border-slate-200/60 text-xs transition-colors cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, scoreA: p.scoreA + 1 }))}
                    style={{ backgroundColor: teamAColor, color: getContrastColor(teamAColor) }}
                    className="flex-[2] py-1.5 flex items-center justify-center font-bold rounded-lg text-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Team B Adjuster */}
              <div className="flex flex-col items-center p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                <div className="text-[10px] font-black text-slate-500 truncate max-w-full mb-1 uppercase" style={{ color: teamBColor }}>
                  {form.teamB || "Team B"}
                </div>
                <div className="text-3xl font-black mb-2" style={{ color: teamBColor }}>
                  {form.scoreB}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, scoreB: Math.max(0, p.scoreB - 1) }))}
                    className="flex-1 py-1.5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-lg border border-slate-200/60 text-xs transition-colors cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, scoreB: p.scoreB + 1 }))}
                    style={{ backgroundColor: teamBColor, color: getContrastColor(teamBColor) }}
                    className="flex-[2] py-1.5 flex items-center justify-center font-bold rounded-lg text-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Scores Fields (Clean & single execution instance) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
              <TextField label="Manual Score A" type="number" value={String(form.scoreA)} onChange={v => f("scoreA",Number(v))} disabled={(form.status as string) === "completed"} />
              <TextField label="Manual Score B" type="number" value={String(form.scoreB)} onChange={v => f("scoreB",Number(v))} disabled={(form.status as string) === "completed"} />
            </div>
          </div>

          <SelectField 
            label="Winner Decided" 
            value={form.winner} 
            options={["", "teamA", "teamB", "draw"]} 
            onChange={v => f("winner", v)} 
            disabled={admin?.role !== "superadmin" || (form.status as string) === "completed"} 
          />

          {/* Fallback sets logger matrix for post-match edit */}
          {((form.status as string) === "completed") && (
            <div className="border-t border-slate-200/60 pt-3">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Set Scores Overrides</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {form.sets.map((set, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                    <span className="text-xs font-bold text-slate-500 w-14">Set {idx + 1}</span>
                    <input
                      type="number"
                      min={0}
                      value={set.scoreA}
                      onChange={(e) => {
                        const updatedSets = [...form.sets];
                        updatedSets[idx].scoreA = Number(e.target.value);
                        setForm(p => ({ ...p, sets: updatedSets }));
                      }}
                      className="w-14 px-2 py-1 bg-white border border-slate-200 rounded text-center text-xs font-semibold focus:outline-none"
                    />
                    <span className="text-slate-400 text-xs">—</span>
                    <input
                      type="number"
                      min={0}
                      value={set.scoreB}
                      onChange={(e) => {
                        const updatedSets = [...form.sets];
                        updatedSets[idx].scoreB = Number(e.target.value);
                        setForm(p => ({ ...p, sets: updatedSets }));
                      }}
                      className="w-14 px-2 py-1 bg-white border border-slate-200 rounded text-center text-xs font-semibold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedSets = form.sets.filter((_, sIdx) => sIdx !== idx);
                        setForm(p => ({ ...p, sets: updatedSets }));
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, sets: [...p.sets, { scoreA: 0, scoreB: 0 }] }))}
                className="px-3 py-1.5 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200/60 w-full text-center cursor-pointer"
              >
                + Add Set Score
              </button>
            </div>
          )}
        </div>

        {/* Sticky Action Footer for upcoming/completed form */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 flex gap-3 rounded-b-3xl">
          <div className="flex gap-3 w-full max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-red-500/10 cursor-pointer"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </form>
</Modal>
        );












        
      })()}
    </div>
  );
}

function Spinner() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <div className="animate-shimmer h-4 w-16 bg-slate-200 rounded" />
              <div className="animate-shimmer h-4 w-12 bg-slate-200 rounded" />
              <div className="animate-shimmer h-4 w-20 bg-slate-200 rounded" />
            </div>
            <div className="flex items-center gap-4 py-1">
              <div className="animate-shimmer h-5 w-24 bg-slate-200 rounded" />
              <div className="animate-shimmer h-6 w-16 bg-slate-200 rounded" />
              <div className="animate-shimmer h-5 w-24 bg-slate-200 rounded" />
            </div>
            <div className="animate-shimmer h-3.5 w-32 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
function Modal({ title, children, onClose, maxWidth = "max-w-md" }: { title: string; children: React.ReactNode; onClose: () => void; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className={`bg-white border border-slate-200 w-full h-full sm:h-auto sm:${maxWidth} sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <h3 className="text-slate-800 font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 pb-safe">{children}</div>
      </div>
    </div>
  );
}
const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000]/60";
function TextField({ label, value, onChange, type="text", disabled=false }: { label:string; value:string; onChange:(v:string)=>void; type?:string; disabled?:boolean }) {
  return <div><label className="block text-slate-500 text-xs font-bold uppercase mb-1">{label}</label><input type={type} disabled={disabled} value={value} onChange={e=>onChange(e.target.value)} className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`} /></div>;
}
function SelectField({ label, value, options, onChange, disabled=false }: { label:string; value:string; options:string[]; onChange:(v:string)=>void; disabled?:boolean }) {
  return <div><label className="block text-slate-500 text-xs font-bold uppercase mb-1">{label}</label><select value={value} disabled={disabled} onChange={e=>onChange(e.target.value)} className={`${inputCls} appearance-none disabled:opacity-60 disabled:cursor-not-allowed`}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;
}
function SaveBtn({ saving }: { saving: boolean }) {
  return <button type="submit" disabled={saving} className="w-full py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm">{saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<><Save className="w-4 h-4"/>Save</>}</button>;
}
