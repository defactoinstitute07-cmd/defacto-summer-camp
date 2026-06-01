"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Trophy,
  Calendar,
  Users,
  Swords,
  Clock,
  Gamepad2,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  Target,
} from "lucide-react";
import * as Icons from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Game {
  _id: string;
  name: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  iconName: string;
  imageSrc: string;
}

interface Match {
  _id: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
  round: string;
  status: "upcoming" | "live" | "completed";
  winner: string;
  notes: string;
}

interface PointsEntry {
  _id: string;
  sport: string;
  displayName: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  rank: number;
}

interface Player {
  _id: string;
  name: string;
  age?: number;
  sport: string;
  team: string;
  profileImageUrl: string;
}

interface GameDetailsResponse {
  game: Game;
  matches: Match[];
  pointsTable: PointsEntry[];
  players: Player[];
}

export default function GameDetailsClient({ gameId }: { gameId: string }) {
  const [data, setData] = useState<GameDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"matches" | "standings" | "players">("matches");
  const [matchFilter, setMatchFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");

  useEffect(() => {
    fetch(`${API}/games/${gameId}/details`)
      .then((res) => {
        if (!res.ok) throw new Error("Game details could not be retrieved.");
        return res.json();
      })
      .then((d) => {
        setData(d.data);
        // Default to standings if there are no matches but standings exist
        if (d.data.matches.length === 0 && d.data.pointsTable.length > 0) {
          setActiveTab("standings");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-semibold text-sm">Loading Live Scores &amp; Standings...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 px-4 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md shadow-lg shadow-slate-200/50">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-black text-slate-800 uppercase mb-2">Error Loading Standings</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "Game data not found."}</p>
          <a
            href="/camp-portal"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#E60000] hover:bg-red-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-500/10"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Camp Portal
          </a>
        </div>
      </div>
    );
  }

  const { game, matches, pointsTable, players } = data;

  const filteredMatches = matches.filter(
    (m) => matchFilter === "all" || m.status === matchFilter
  );

  const getDynamicIcon = (name: string) => {
    const IconComponent = (Icons as any)[name] || Icons.Gamepad2;
    return <IconComponent className="w-6 h-6" />;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main className="flex-1 bg-slate-50 pt-24 pb-20 font-sans">
      {/* Dynamic Header Banner */}
      <section className="relative bg-white border-b border-slate-200/50 py-12 overflow-hidden">
        {/* Decorative subtle gradient background */}
        <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-[#E60000]/5 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#0B1C4A]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <a
            href="/camp-portal"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#E60000] transition-colors duration-200 mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Portal
          </a>

          {/* Banner Row */}
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {game.imageSrc ? (
                <img
                  src={game.imageSrc}
                  alt={game.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-100 shadow-md shadow-slate-100"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#E60000]/10 flex items-center justify-center text-[#E60000] border border-[#E60000]/10 shadow-sm">
                  <Gamepad2 className="w-10 h-10" />
                </div>
              )}

              <div>
                {/* Active Live Status */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border capitalize ${
                      game.status === "ongoing"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : game.status === "upcoming"
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        game.status === "ongoing" ? "bg-green-500 animate-pulse" : game.status === "upcoming" ? "bg-amber-500" : "bg-slate-400"
                      }`}
                    />
                    {game.status}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-display font-black text-[#0B1C4A] tracking-tight uppercase mb-2">
                  {game.name}
                </h1>
                <p className="text-slate-500 text-sm max-w-xl leading-relaxed">{game.description}</p>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="flex gap-4 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-6 lg:pt-0">
              <div className="flex-1 lg:flex-initial bg-slate-50 p-4 border border-slate-200/60 rounded-2xl text-center min-w-[100px]">
                <p className="text-2xl font-display font-black text-[#0B1C4A]">{matches.length}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Matches</p>
              </div>
              <div className="flex-1 lg:flex-initial bg-slate-50 p-4 border border-slate-200/60 rounded-2xl text-center min-w-[100px]">
                <p className="text-2xl font-display font-black text-[#E60000]">{pointsTable.length}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Standings</p>
              </div>
              <div className="flex-1 lg:flex-initial bg-slate-50 p-4 border border-slate-200/60 rounded-2xl text-center min-w-[100px]">
                <p className="text-2xl font-display font-black text-[#0B1C4A]">{players.length}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Players</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex border-b border-slate-200/80 mb-8 overflow-x-auto gap-8">
          <button
            onClick={() => setActiveTab("matches")}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "matches"
                ? "border-[#E60000] text-[#E60000]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Swords className="w-4 h-4" />
            Matches &amp; Scores
          </button>
          <button
            onClick={() => setActiveTab("standings")}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "standings"
                ? "border-[#E60000] text-[#E60000]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Points Table
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "players"
                ? "border-[#E60000] text-[#E60000]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Players ({players.length})
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === "matches" && (
            <motion.div
              key="matches-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Mini Match filter bar */}
              {matches.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-100/50 w-fit">
                  {(["all", "live", "upcoming", "completed"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMatchFilter(tab)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        matchFilter === tab
                          ? "bg-[#0B1C4A] text-white"
                          : "bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200/50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {/* Match Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map((m) => (
                  <div
                    key={m._id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                      m.status === "live"
                        ? "border-red-200 ring-1 ring-red-100"
                        : "border-slate-200/80 hover:shadow-md"
                    }`}
                  >
                    {/* Live indicator stripe */}
                    {m.status === "live" && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#E60000]" />
                    )}

                    {/* Card Header info */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {m.round}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        {formatDate(m.date)}
                      </span>
                    </div>

                    {/* Competitors and score */}
                    <div className="space-y-4 py-3">
                      {/* Competitor A */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-base font-bold tracking-tight uppercase ${
                            m.status === "completed" && m.winner === "teamA"
                              ? "text-[#E60000] font-black"
                              : "text-slate-800"
                          }`}
                        >
                          {m.teamA}
                          {m.status === "completed" && m.winner === "teamA" && (
                            <Trophy className="w-4 h-4 text-amber-500 inline-block ml-1.5 mb-1" />
                          )}
                        </span>
                        <span
                          className={`text-xl font-display font-black px-3.5 py-1.5 rounded-xl border ${
                            m.status === "live"
                              ? "bg-red-50 text-[#E60000] border-red-200 font-black animate-pulse"
                              : m.status === "completed" && m.winner === "teamA"
                              ? "bg-[#E60000]/10 text-[#E60000] border-red-200/30"
                              : "bg-slate-50 text-slate-600 border-slate-200/60"
                          }`}
                        >
                          {m.status === "upcoming" ? "—" : m.scoreA}
                        </span>
                      </div>

                      <div className="text-center text-xs font-black text-slate-300 relative">
                        <span className="bg-white px-3 relative z-10 uppercase tracking-widest text-[9px]">VS</span>
                        <div className="absolute top-1/2 inset-x-0 h-px bg-slate-100 z-0" />
                      </div>

                      {/* Competitor B */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-base font-bold tracking-tight uppercase ${
                            m.status === "completed" && m.winner === "teamB"
                              ? "text-[#E60000] font-black"
                              : "text-slate-800"
                          }`}
                        >
                          {m.teamB}
                          {m.status === "completed" && m.winner === "teamB" && (
                            <Trophy className="w-4 h-4 text-amber-500 inline-block ml-1.5 mb-1" />
                          )}
                        </span>
                        <span
                          className={`text-xl font-display font-black px-3.5 py-1.5 rounded-xl border ${
                            m.status === "live"
                              ? "bg-red-50 text-[#E60000] border-red-200 font-black animate-pulse"
                              : m.status === "completed" && m.winner === "teamB"
                              ? "bg-[#E60000]/10 text-[#E60000] border-red-200/30"
                              : "bg-slate-50 text-slate-600 border-slate-200/60"
                          }`}
                        >
                          {m.status === "upcoming" ? "—" : m.scoreB}
                        </span>
                      </div>
                    </div>

                    {/* Footer Details: Notes or Status status bar */}
                    {(m.notes || m.status === "live") && (
                      <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                        <p className="text-slate-400 text-xs italic truncate flex-1 pr-4">
                          {m.notes || "No notes posted yet."}
                        </p>
                        {m.status === "live" && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-[#E60000] text-[9px] font-black uppercase tracking-widest border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-ping" />
                            Live Now
                          </span>
                        )}
                        {m.status === "completed" && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            Final
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredMatches.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-sm mx-auto">
                  <Swords className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-800 font-bold mb-1">No Matches Listed</p>
                  <p className="text-slate-400 text-sm">There are no matches matching the filter.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "standings" && (
            <motion.div
              key="standings-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {pointsTable.length > 0 ? (
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-6 py-4 w-20">Rank</th>
                        <th className="text-left px-6 py-4">Player / Team</th>
                        <th className="text-center px-6 py-4">Played</th>
                        <th className="text-center px-6 py-4 bg-green-50/30 text-green-700">Won</th>
                        <th className="text-center px-6 py-4 bg-red-50/30 text-red-700">Lost</th>
                        <th className="text-center px-6 py-4 bg-slate-50 text-slate-600">Drawn</th>
                        <th className="text-center px-6 py-4 bg-[#0B1C4A]/5 text-[#0B1C4A] font-black w-24">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pointsTable.map((row, idx) => (
                        <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-display font-black text-slate-800">
                            {row.rank || idx + 1}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wide">
                            {row.displayName}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-500 font-semibold">{row.played}</td>
                          <td className="px-6 py-4 text-center bg-green-50/20 text-green-700 font-semibold">{row.won}</td>
                          <td className="px-6 py-4 text-center bg-red-50/20 text-red-700 font-semibold">{row.lost}</td>
                          <td className="px-6 py-4 text-center bg-slate-50/50 text-slate-500 font-medium">{row.drawn}</td>
                          <td className="px-6 py-4 text-center bg-[#0B1C4A]/5 text-[#0B1C4A] font-black text-base">
                            {row.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-sm mx-auto">
                  <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-800 font-bold mb-1">Standings Empty</p>
                  <p className="text-slate-400 text-sm">Leaderboard entries will be posted by the admin shortly.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "players" && (
            <motion.div
              key="players-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {players.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {players.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 text-center flex flex-col items-center"
                    >
                      {p.profileImageUrl ? (
                        <img
                          src={p.profileImageUrl}
                          alt={p.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-slate-200/70 shadow-inner mb-4"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E60000]/10 text-[#E60000] border border-[#E60000]/10 flex items-center justify-center font-display font-black text-xl mb-4 uppercase">
                          {p.name[0]}
                        </div>
                      )}

                      <h3 className="font-display font-black text-slate-800 uppercase tracking-wide mb-1 leading-snug">
                        {p.name}
                      </h3>

                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                        {p.team || "Independent"}
                      </p>

                      {p.age && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/50 text-[10px] text-slate-500 font-bold uppercase">
                          Age: {p.age}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-sm mx-auto">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-800 font-bold mb-1">No Registered Players</p>
                  <p className="text-slate-400 text-sm">There are no players currently registered under this game.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
