"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flame, Award, Calendar, ChevronRight, Activity, Zap, PlayCircle, CheckCircle } from "lucide-react";
import * as Icons from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Game {
  _id: string;
  name: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  iconName: string;
  imageSrc: string;
  order: number;
}

export default function CampPortalPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/games`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load games list");
        return res.json();
      })
      .then((d) => setGames(d.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredGames = games
    .filter((g) => filter === "all" || g.status === filter)
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  // Render Lucide Icon by name dynamically
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Gamepad2;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <>
      <Header />

      <main className="flex-1 bg-slate-50 pt-24 pb-20 font-sans">
        {/* Portal Hero Section */}
        <section className="relative bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/50 py-16 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-[#38BDF8]/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#E60000]/5 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E60000]/10 border border-[#E60000]/15 text-[#E60000] text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Zap className="w-3.5 h-3.5 fill-[#E60000]" />
              Live Tournament Hub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-display font-black text-[#0B1C4A] tracking-tight uppercase max-w-4xl mx-auto mb-4"
            >
              Camp Scoreboard &amp; Updates
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-600 font-medium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Follow real-time schedules, live match results, player rankings, and leaderboard entries across all summer camp activities.
            </motion.p>
          </div>
        </section>

        {/* Filters and Games Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-100/50 mb-10">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E60000] focus:bg-white focus:ring-1 focus:ring-[#E60000] placeholder-slate-400 transition-all duration-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {(["all", "ongoing", "upcoming", "completed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    filter === tab
                      ? "bg-[#E60000] text-white shadow-md shadow-red-600/15"
                      : "bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200/60"
                  }`}
                >
                  {tab === "all" ? "All Games" : `${tab}`}
                </button>
              ))}
            </div>
          </div>

          {/* Games Output */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center max-w-md mx-auto">
              <p className="font-bold mb-2">Error Loading Portal</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300 flex flex-col group"
                  >
                    {/* Header Image banner */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex-shrink-0">
                      {game.imageSrc ? (
                        <img
                          src={game.imageSrc}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0B1C4A]/5 to-[#E60000]/5 flex items-center justify-center text-slate-400">
                          <Icons.Gamepad2 className="w-12 h-12 stroke-[1.5]" />
                        </div>
                      )}

                      {/* Status overlay badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${
                            game.status === "ongoing"
                              ? "bg-green-50 border-green-200 text-green-600"
                              : game.status === "upcoming"
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-slate-50 border-slate-200/80 text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              game.status === "ongoing"
                                ? "bg-green-500 animate-pulse"
                                : game.status === "upcoming"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {game.status}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E60000]/10 flex items-center justify-center text-[#E60000]">
                          {getIcon(game.iconName)}
                        </div>
                        <h3 className="text-xl font-display font-black text-[#0B1C4A] uppercase tracking-wide group-hover:text-[#E60000] transition-colors duration-200">
                          {game.name}
                        </h3>
                      </div>

                      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                        {game.description}
                      </p>

                      {/* Details CTA Link */}
                      <a
                        href={`/camp-portal/games/${game._id}`}
                        className="w-full py-3 bg-slate-50 hover:bg-[#E60000] text-slate-700 hover:text-white font-display font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-300 border border-slate-200/80 hover:border-[#E60000] shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && filteredGames.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/85 max-w-md mx-auto shadow-sm">
              <Icons.SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-800 font-bold mb-1">No Games Found</p>
              <p className="text-slate-400 text-sm">Try adjusting your filters or search keywords.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
