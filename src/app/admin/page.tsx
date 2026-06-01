"use client";
import React, { useEffect, useState } from "react";
import { adminFetch } from "./context/AdminAuthContext";
import { motion } from "framer-motion";
import {
  Users, UserCheck, Trophy, CalendarCheck, Image,
  Megaphone, Swords, TrendingUp, Shield, Activity,
} from "lucide-react";

interface Stats {
  overview: {
    totalPlayers: number; activePlayers: number;
    totalMatches: number; liveMatches: number;
    completedMatches: number; upcomingMatches: number;
    totalVolunteers: number; totalOrganizers: number;
    totalAnnouncements: number; totalGalleryImages: number;
    overallAttendancePct: number;
  };
  sportBreakdown: { _id: string; count: number }[];
  recentMatches: { _id: string; sport: string; teamA: string; teamB: string; scoreA: number; scoreB: number; status: string }[];
  recentAnnouncements: { _id: string; title: string; type: string; createdAt: string }[];
  topRankers: { _id: string; displayName: string; sport: string; points: number; rank: number }[];
}

const typeColor: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-300",
  result: "bg-green-500/20 text-green-300",
  urgent: "bg-red-500/20 text-red-400",
  general: "bg-slate-500/20 text-slate-300",
  schedule: "bg-yellow-500/20 text-yellow-300",
};

const statusColor: Record<string, string> = {
  live: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  upcoming: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/dashboard/stats")
      .then((d) => setStats(d.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;
  if (!stats) return null;

  const cards = [
    { label: "Total Players",   value: stats.overview.totalPlayers,       icon: UserCheck,  color: "from-blue-600 to-blue-800" },
    { label: "Live Matches",    value: stats.overview.liveMatches,         icon: Activity,   color: "from-[#E60000] to-red-800" },
    { label: "Volunteers",      value: stats.overview.totalVolunteers,     icon: Users,      color: "from-purple-600 to-purple-800" },
    { label: "Organizers",      value: stats.overview.totalOrganizers,     icon: Shield,     color: "from-amber-600 to-amber-800" },
    { label: "Total Matches",   value: stats.overview.totalMatches,        icon: Swords,     color: "from-teal-600 to-teal-800" },
    { label: "Announcements",   value: stats.overview.totalAnnouncements,  icon: Megaphone,  color: "from-pink-600 to-pink-800" },
    { label: "Gallery Images",  value: stats.overview.totalGalleryImages,  icon: Image,      color: "from-indigo-600 to-indigo-800" },
    { label: "Attendance %",    value: `${stats.overview.overallAttendancePct}%`, icon: CalendarCheck, color: "from-green-600 to-green-800" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 shadow-lg`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{c.value}</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sport Breakdown */}
        <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFDE00]" /> Sport Breakdown
          </h3>
          <div className="space-y-3">
            {stats.sportBreakdown.map((s) => (
              <div key={s._id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70 font-medium truncate">{s._id}</span>
                  <span className="text-white font-bold">{s.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E60000] to-[#FFDE00] rounded-full"
                    style={{ width: `${Math.min((s.count / stats.overview.totalPlayers) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.sportBreakdown.length === 0 && <p className="text-white/30 text-sm">No players yet.</p>}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#E60000]" /> Recent Matches
          </h3>
          <div className="space-y-3">
            {stats.recentMatches.map((m) => (
              <div key={m._id} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40 text-xs font-bold uppercase">{m.sport}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor[m.status] || statusColor.upcoming}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-white text-sm font-bold">
                  {m.teamA} <span className="text-[#FFDE00]">{m.scoreA}–{m.scoreB}</span> {m.teamB}
                </p>
              </div>
            ))}
            {stats.recentMatches.length === 0 && <p className="text-white/30 text-sm">No matches yet.</p>}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-400" /> Recent Announcements
          </h3>
          <div className="space-y-3">
            {stats.recentAnnouncements.map((a) => (
              <div key={a._id} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor[a.type] || typeColor.general}`}>
                    {a.type}
                  </span>
                </div>
                <p className="text-white text-sm font-semibold line-clamp-1">{a.title}</p>
                <p className="text-white/30 text-xs mt-0.5">{new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            ))}
            {stats.recentAnnouncements.length === 0 && <p className="text-white/30 text-sm">No announcements yet.</p>}
          </div>
        </div>
      </div>

      {/* Top Rankers */}
      {stats.topRankers.length > 0 && (
        <div className="bg-[#0B1C4A]/60 border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FFDE00]" /> Top 5 Rankers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-2 font-bold">Rank</th>
                  <th className="text-left py-2 font-bold">Name</th>
                  <th className="text-left py-2 font-bold">Sport</th>
                  <th className="text-right py-2 font-bold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.topRankers.map((r, i) => (
                  <tr key={r._id} className="text-white/80">
                    <td className="py-3">
                      <span className={`font-black text-lg ${i === 0 ? "text-[#FFDE00]" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-white/40"}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">{r.displayName}</td>
                    <td className="py-3 text-white/50 text-xs">{r.sport}</td>
                    <td className="py-3 text-right font-black text-[#FFDE00]">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
