"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "../context/AdminAuthContext";
import { CheckCircle, XCircle, Users } from "lucide-react";

interface Player { _id: string; name: string; sport: string; }
interface Summary { player: Player; totalDays: number; presentDays: number; absentDays: number; attendancePercentage: number; }

export default function AttendancePage() {
  const [summary, setSummary] = useState<Summary[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [sport, setSport] = useState("");
  const [markLoading, setMarkLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [attendance, setAttendance] = useState<Record<string,boolean>>({});

  const loadSummary = () => adminFetch("/attendance/summary").then(d=>setSummary(d.data)).finally(()=>setLoading(false));
  const loadPlayers = () => adminFetch("/players?limit=200").then(d=>{
    setPlayers(d.data);
    const init: Record<string,boolean> = {};
    d.data.forEach((p: Player) => init[p._id] = true);
    setAttendance(init);
  });

  useEffect(()=>{
    loadSummary();
    loadPlayers();
    adminFetch("/games")
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          const names = d.data.map((g: any) => g.name);
          setSports(names);
          if (names.length > 0) setSport(names[0]);
        }
      })
      .catch((err) => console.warn("Failed to load sports list:", err));
  },[]);

  const handleBulkMark = async () => {
    setMarkLoading(true); setStatus("");
    try {
      const records = Object.entries(attendance).map(([player,present])=>({ player, present }));
      await adminFetch("/attendance/bulk", { method:"POST", body: JSON.stringify({ records, date, sport }) });
      setStatus(`✅ Attendance marked for ${records.length} players on ${date}`);
      loadSummary();
    } catch (err: unknown) { setStatus(`❌ ${err instanceof Error ? err.message : "Error"}`); }
    finally { setMarkLoading(false); }
  };

  const pctColor = (pct: number) => pct >= 80 ? "text-green-600 font-bold" : pct >= 50 ? "text-amber-600 font-bold" : "text-red-600 font-bold";
  const barColor = (pct: number) => pct >= 80 ? "from-green-600 to-green-500" : pct >= 50 ? "from-amber-500 to-amber-400" : "from-red-600 to-red-500";

  return (
    <div className="space-y-6">
      {/* Mark Attendance Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[#0B1C4A] font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-amber-500"/>Mark Today's Attendance</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Session</label>
            <select value={sport} onChange={e=>setSport(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none w-40 appearance-none">
              {sports.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={()=>setAttendance(p=>Object.fromEntries(Object.keys(p).map(k=>[k,true])))} className="px-3 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200 hover:bg-green-100 transition-colors">All Present</button>
            <button onClick={()=>setAttendance(p=>Object.fromEntries(Object.keys(p).map(k=>[k,false])))} className="px-3 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-colors">All Absent</button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto space-y-2 mb-4 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
          {players.map(p=>(
            <div key={p._id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
              <div>
                <p className="text-slate-800 text-sm font-semibold">{p.name}</p>
                <p className="text-slate-500 text-xs">{p.sport}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${attendance[p._id]?"text-green-600":"text-red-600"}`}>
                  {attendance[p._id]?"Present":"Absent"}
                </span>
                <button onClick={()=>setAttendance(prev=>({...prev,[p._id]:!prev[p._id]}))}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${attendance[p._id]?"bg-green-500":"bg-red-200 border border-red-300"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${attendance[p._id]?"translate-x-6":"translate-x-0.5"}`}/>
                </button>
              </div>
            </div>
          ))}
          {players.length===0 && <p className="text-slate-400 text-sm text-center py-4">No players found. Add players first.</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleBulkMark} disabled={markLoading || players.length===0}
            className="px-6 py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-40 text-white font-black text-sm uppercase rounded-xl flex items-center gap-2 transition-colors shadow-md shadow-[#E60000]/10">
            {markLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><CheckCircle className="w-4 h-4"/>Submit Attendance</>}
          </button>
          {status && <p className="text-sm text-slate-600 font-bold">{status}</p>}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[#0B1C4A] font-bold mb-4">Attendance Summary</h3>
        {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin"/></div> : (
          <div className="space-y-3">
            {summary.map(s=>(
              <div key={s.player._id} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-slate-800 text-sm font-semibold">{s.player.name}</span>
                    <span className="text-slate-500 text-xs ml-2">{s.player.sport}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/>{s.presentDays}</span>
                    <span className="text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3"/>{s.absentDays}</span>
                    <span className={`font-black ${pctColor(s.attendancePercentage)}`}>{s.attendancePercentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${barColor(s.attendancePercentage)} rounded-full transition-all duration-500`} style={{width:`${s.attendancePercentage}%`}}/>
                </div>
              </div>
            ))}
            {summary.length===0 && <p className="text-slate-400 text-sm text-center py-6">No attendance records yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
