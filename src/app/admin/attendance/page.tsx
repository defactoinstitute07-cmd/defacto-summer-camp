"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "../context/AdminAuthContext";
import { CheckCircle, XCircle, Users } from "lucide-react";

interface Player { _id: string; name: string; sport: string; }
interface Summary { player: Player; totalDays: number; presentDays: number; absentDays: number; attendancePercentage: number; }

export default function AttendancePage() {
  const [summary, setSummary] = useState<Summary[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [sport, setSport] = useState("General");
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

  useEffect(()=>{ loadSummary(); loadPlayers(); },[]);

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

  const pctColor = (pct: number) => pct >= 80 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400";
  const barColor = (pct: number) => pct >= 80 ? "from-green-500 to-green-400" : pct >= 50 ? "from-yellow-500 to-yellow-400" : "from-red-500 to-red-400";

  return (
    <div className="space-y-6">
      {/* Mark Attendance Panel */}
      <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[#FFDE00]"/>Mark Today's Attendance</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-white/40 text-xs font-bold uppercase mb-1">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-white/40 text-xs font-bold uppercase mb-1">Session</label>
            <input value={sport} onChange={e=>setSport(e.target.value)} placeholder="e.g. Badminton" className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none w-40"/>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={()=>setAttendance(p=>Object.fromEntries(Object.keys(p).map(k=>[k,true])))} className="px-3 py-2.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-xl hover:bg-green-500/30 transition-colors">All Present</button>
            <button onClick={()=>setAttendance(p=>Object.fromEntries(Object.keys(p).map(k=>[k,false])))} className="px-3 py-2.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/30 transition-colors">All Absent</button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
          {players.map(p=>(
            <div key={p._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-white text-sm font-semibold">{p.name}</p>
                <p className="text-white/40 text-xs">{p.sport}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${attendance[p._id]?"text-green-400":"text-red-400"}`}>
                  {attendance[p._id]?"Present":"Absent"}
                </span>
                <button onClick={()=>setAttendance(prev=>({...prev,[p._id]:!prev[p._id]}))}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${attendance[p._id]?"bg-green-500":"bg-red-500/40 border border-red-500/30"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${attendance[p._id]?"translate-x-6":"translate-x-0.5"}`}/>
                </button>
              </div>
            </div>
          ))}
          {players.length===0 && <p className="text-white/30 text-sm text-center py-4">No players found. Add players first.</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleBulkMark} disabled={markLoading || players.length===0}
            className="px-6 py-3 bg-[#E60000] hover:bg-red-700 disabled:opacity-40 text-white font-black text-sm uppercase rounded-xl flex items-center gap-2 transition-colors">
            {markLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><CheckCircle className="w-4 h-4"/>Submit Attendance</>}
          </button>
          {status && <p className="text-sm text-white/70">{status}</p>}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Attendance Summary</h3>
        {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin"/></div> : (
          <div className="space-y-3">
            {summary.map(s=>(
              <div key={s.player._id} className="bg-white/5 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-white text-sm font-semibold">{s.player.name}</span>
                    <span className="text-white/40 text-xs ml-2">{s.player.sport}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/>{s.presentDays}</span>
                    <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3"/>{s.absentDays}</span>
                    <span className={`font-black ${pctColor(s.attendancePercentage)}`}>{s.attendancePercentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${barColor(s.attendancePercentage)} rounded-full transition-all duration-500`} style={{width:`${s.attendancePercentage}%`}}/>
                </div>
              </div>
            ))}
            {summary.length===0 && <p className="text-white/30 text-sm text-center py-6">No attendance records yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
