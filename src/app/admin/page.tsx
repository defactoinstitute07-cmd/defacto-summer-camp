"use client";
import React, { useEffect, useState } from "react";
import { adminFetch, useAdminAuth } from "./context/AdminAuthContext";
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
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  result: "bg-green-50 text-green-700 border border-green-200",
  urgent: "bg-red-50 text-red-700 border border-red-200",
  general: "bg-slate-100 text-slate-700 border border-slate-200",
  schedule: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const statusColor: Record<string, string> = {
  live: "bg-red-50 text-red-700 border border-red-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  upcoming: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
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
    <div className="space-y-8">
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm"
          >
            <div className="animate-shimmer w-10 h-10 rounded-xl bg-slate-200 mb-4" />
            <div className="animate-shimmer h-8 w-16 rounded bg-slate-200 mb-2" />
            <div className="animate-shimmer h-4 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Bottom columns skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm h-64 space-y-4">
            <div className="animate-shimmer h-6 w-32 rounded bg-slate-200" />
            <div className="space-y-3">
              <div className="animate-shimmer h-10 w-full rounded bg-slate-100" />
              <div className="animate-shimmer h-10 w-full rounded bg-slate-100" />
              <div className="animate-shimmer h-10 w-full rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
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
  ].filter((c) => {
    if (admin?.role === "admin") {
      return ["Total Players", "Live Matches", "Total Matches", "Attendance %"].includes(c.label);
    }
    return true;
  });

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
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 shadow-md`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{c.value}</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sport Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1C4A] font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFDE00]" /> Sport Breakdown
          </h3>
          <div className="space-y-3">
            {stats.sportBreakdown.map((s) => (
              <div key={s._id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium truncate">{s._id}</span>
                  <span className="text-slate-800 font-bold">{s.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E60000] to-[#FFDE00] rounded-full"
                    style={{ width: `${Math.min((s.count / stats.overview.totalPlayers) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.sportBreakdown.length === 0 && <p className="text-slate-400 text-sm">No players yet.</p>}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1C4A] font-bold mb-4 flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#E60000]" /> Recent Matches
          </h3>
          <div className="space-y-3">
            {stats.recentMatches.map((m) => (
              <div key={m._id} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{m.sport}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor[m.status] || statusColor.upcoming}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-slate-800 text-sm font-bold">
                  {m.teamA} <span className="text-[#E60000]">{m.scoreA}–{m.scoreB}</span> {m.teamB}
                </p>
              </div>
            ))}
            {stats.recentMatches.length === 0 && <p className="text-slate-400 text-sm">No matches yet.</p>}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1C4A] font-bold mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#E60000]" /> Recent Announcements
          </h3>
          <div className="space-y-3">
            {stats.recentAnnouncements.map((a) => (
              <div key={a._id} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[a.type] || typeColor.general}`}>
                    {a.type}
                  </span>
                </div>
                <p className="text-slate-800 text-sm font-semibold line-clamp-1">{a.title}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            ))}
            {stats.recentAnnouncements.length === 0 && <p className="text-slate-400 text-sm">No announcements yet.</p>}
          </div>
        </div>
      </div>

      {/* Top Rankers */}
      {stats.topRankers.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[#0B1C4A] font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FFDE00]" /> Top 5 Rankers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="text-left py-2 font-bold">Rank</th>
                  <th className="text-left py-2 font-bold">Name</th>
                  <th className="text-left py-2 font-bold">Sport</th>
                  <th className="text-right py-2 font-bold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.topRankers.map((r, i) => (
                  <tr key={r._id} className="text-slate-700">
                    <td className="py-3">
                      <span className={`font-black text-lg ${i === 0 ? "text-[#FFDE00]" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-slate-300"}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">{r.displayName}</td>
                    <td className="py-3 text-slate-500 text-xs">{r.sport}</td>
                    <td className="py-3 text-right font-black text-[#E60000]">{r.points}</td>
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
