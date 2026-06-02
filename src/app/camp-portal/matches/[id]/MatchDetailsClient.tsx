"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import {
  ChevronLeft,
  Trophy,
  Clock,
  Activity,
  Calendar,
  Swords,
  Flag,
  AlertCircle,
  Pause,
  CheckCircle
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const cleanUrl = (url: string) => url.replace(/([^:]\/)\/+/g, "$1");
const CAMP_TIME_ZONE = "Asia/Kolkata";
const DEFAULT_MATCH_DATE = "2026-01-01T00:00:00.000Z";
const COPYRIGHT_YEAR = "2026";

interface SetScore {
  scoreA: number;
  scoreB: number;
}

interface TimelineEvent {
  scoreA: number;
  scoreB: number;
  text: string;
  time: string;
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
  status: "upcoming" | "live" | "paused" | "completed";
  winner: string;
  notes: string;
  sets?: SetScore[];
  timeline?: TimelineEvent[];
  maxPoints?: number;
}

interface MatchDetailsResponse {
  match: Match;
  teamALogo: string;
  teamBLogo: string;
  teamAColor?: string;
  teamBColor?: string;
}

interface GameSummary {
  _id: string;
  name: string;
}

const validStatuses: Match["status"][] = ["upcoming", "live", "paused", "completed"];

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
);

const stringValue = (value: unknown) => (
  typeof value === "string" ? value : value == null ? "" : String(value)
);

const numberValue = (value: unknown) => (
  typeof value === "number" && Number.isFinite(value) ? value : 0
);

const isGameSummary = (value: unknown): value is GameSummary => (
  isRecord(value) &&
  typeof value._id === "string" &&
  typeof value.name === "string"
);

const normalizeMatchDetails = (value: unknown): MatchDetailsResponse | null => {
  const payload = isRecord(value) && isRecord(value.match)
    ? value
    : isRecord(value) && isRecord(value.data) && isRecord(value.data.match)
      ? value.data
      : null;

  if (!payload || !isRecord(payload.match)) return null;

  const rawMatch = payload.match;
  const matchId = stringValue(rawMatch._id);
  if (!matchId) return null;

  const rawStatus = stringValue(rawMatch.status) as Match["status"];
  const status = validStatuses.includes(rawStatus) ? rawStatus : "upcoming";
  const rawSets = Array.isArray(rawMatch.sets) ? rawMatch.sets : [];
  const rawTimeline = Array.isArray(rawMatch.timeline) ? rawMatch.timeline : [];
  const maxPoints = typeof rawMatch.maxPoints === "number" && Number.isFinite(rawMatch.maxPoints)
    ? rawMatch.maxPoints
    : undefined;

  return {
    match: {
      _id: matchId,
      sport: stringValue(rawMatch.sport),
      teamA: stringValue(rawMatch.teamA),
      teamB: stringValue(rawMatch.teamB),
      scoreA: numberValue(rawMatch.scoreA),
      scoreB: numberValue(rawMatch.scoreB),
      date: stringValue(rawMatch.date) || DEFAULT_MATCH_DATE,
      round: stringValue(rawMatch.round),
      status,
      winner: stringValue(rawMatch.winner),
      notes: stringValue(rawMatch.notes),
      sets: rawSets
        .filter(isRecord)
        .map((set) => ({
          scoreA: numberValue(set.scoreA),
          scoreB: numberValue(set.scoreB),
        })),
      timeline: rawTimeline
        .filter(isRecord)
        .map((event) => ({
          scoreA: numberValue(event.scoreA),
          scoreB: numberValue(event.scoreB),
          text: stringValue(event.text),
          time: stringValue(event.time),
        })),
      maxPoints,
    },
    teamALogo: stringValue(payload.teamALogo),
    teamBLogo: stringValue(payload.teamBLogo),
    teamAColor: stringValue(payload.teamAColor) || "#0B1C4A",
    teamBColor: stringValue(payload.teamBColor) || "#0B1C4A",
  };
};

const createFallbackData = (): MatchDetailsResponse => ({
  match: {
    _id: "",
    sport: "",
    teamA: "",
    teamB: "",
    scoreA: 0,
    scoreB: 0,
    date: DEFAULT_MATCH_DATE,
    round: "",
    status: "upcoming",
    winner: "",
    notes: "",
    sets: [],
    timeline: []
  },
  teamALogo: "",
  teamBLogo: "",
  teamAColor: "#0B1C4A",
  teamBColor: "#0B1C4A"
});

const getSocketUrl = () => cleanUrl(API.replace(/\/api\/?$/, ""));

const shouldUseSocket = (socketUrl: string) => {
  if (process.env.NEXT_PUBLIC_DISABLE_SOCKET_IO === "true") return false;
  if (process.env.NEXT_PUBLIC_ENABLE_SOCKET_IO === "true") return true;

  try {
    const { hostname } = new URL(socketUrl);
    return !hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

// Exponential backoff fetch utility for API resilience
async function fetchWithBackoff(
  url: string,
  options?: RequestInit,
  retries = 3,
  baseDelay = 5000
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (res.status !== 429) return res;
      if (i === retries) return res;
      const retryAfter = res.headers.get('Retry-After');
      const delay = retryAfter ? +retryAfter * 1000 : baseDelay * 2 ** i;
      await new Promise(r => setTimeout(r, delay));
    } catch (err) {
      if (i === retries) throw err;
      const delay = baseDelay * 2 ** i;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

export default function MatchDetailsClient({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [data, setData] = useState<MatchDetailsResponse | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"live" | "reconnecting" | "delayed">("live");

  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const disconnectedAtRef = useRef<number | null>(null);
  const pollingRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll play logs on update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data?.match?.timeline]);

  const fetchDetails = useCallback(async (quiet = false) => {
    try {
      const res = await fetchWithBackoff(
        cleanUrl(`${API}/matches/${matchId}?t=${Date.now()}`),
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        }
      );
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.success) {
        throw new Error(d?.message || "Match details could not be retrieved.");
      }

      const nextData = normalizeMatchDetails(d.data);
      if (!nextData) throw new Error("Match details are unavailable.");

      setData(nextData);
      setError("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error retrieving details";
      if (!quiet) setError(message);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Set up Socket.IO connection and status updates
  useEffect(() => {
    const initialFetchTimer = setTimeout(() => {
      void fetchDetails();
    }, 0);

    const socketUrl = getSocketUrl();
    if (!shouldUseSocket(socketUrl)) {
      setConnectionStatus("delayed");
      return () => {
        clearTimeout(initialFetchTimer);
      };
    }

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    socket.on("connect", () => {
      disconnectedAtRef.current = null;
      setConnectionStatus("live");
      socket.emit("rejoin-match", matchId);
    });

    socket.on("connect_error", () => {
      setConnectionStatus("delayed");
    });

    socket.on("disconnect", () => {
      disconnectedAtRef.current = Date.now();
      setConnectionStatus("reconnecting");
    });

    socket.on("matchState", (serverData: unknown) => {
      const nextData = normalizeMatchDetails(serverData);
      if (!nextData) return;
      setData(nextData);
      setError("");
      setLoading(false);
    });

    socket.on("matchUpdated", (updatedMatch: unknown) => {
      const nextData = normalizeMatchDetails({ match: updatedMatch });
      if (!nextData) {
        void fetchDetails(true);
        return;
      }

      setData((prev) => {
        if (!prev?.match) return prev;
        return {
          ...prev,
          match: nextData.match,
        };
      });
    });

    socket.on("scoreUpdate", (payload: unknown) => {
      if (!isRecord(payload) || payload.matchId !== matchId || !isRecord(payload.score)) return;

      const score = payload.score;
      setData((prev) => {
        if (!prev?.match) return prev;
        const rawStatus = stringValue(score.status) as Match["status"];
        const status = validStatuses.includes(rawStatus) ? rawStatus : prev.match.status;
        const scoreA = typeof score.scoreA === "number" ? score.scoreA : prev.match.scoreA;
        const scoreB = typeof score.scoreB === "number" ? score.scoreB : prev.match.scoreB;
        const sets = Array.isArray(score.sets)
          ? score.sets
            .filter(isRecord)
            .map((set) => ({
              scoreA: numberValue(set.scoreA),
              scoreB: numberValue(set.scoreB),
            }))
          : prev.match.sets;
        const timeline = Array.isArray(score.timeline)
          ? score.timeline
            .filter(isRecord)
            .map((event) => ({
              scoreA: numberValue(event.scoreA),
              scoreB: numberValue(event.scoreB),
              text: stringValue(event.text),
              time: stringValue(event.time),
            }))
          : prev.match.timeline;

        return {
          ...prev,
          match: {
            ...prev.match,
            scoreA,
            scoreB,
            status,
            winner: stringValue(score.winner) || prev.match.winner,
            sets,
            timeline
          }
        };
      });
    });

    return () => {
      clearTimeout(initialFetchTimer);
      socket.disconnect();
    };
  }, [fetchDetails, matchId]);

  // Dynamic polling fallback when WebSocket is inactive/unavailable
  useEffect(() => {
    const socketUrl = getSocketUrl();
    const isSocketEnabled = shouldUseSocket(socketUrl);
    const isLive = isSocketEnabled && connectionStatus === "live";

    if (isLive) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const matchStatus = data?.match?.status;
    // Live / Paused matches are polled every 5 seconds; Upcoming / Completed are polled every 30 seconds
    const intervalTime = (matchStatus === "live" || matchStatus === "paused") ? 5000 : 30000;

    // Perform an immediate fetch when entering fallback polling mode
    void fetchDetails(true);

    const interval = setInterval(() => {
      void fetchDetails(true);
    }, intervalTime);

    pollingRef.current = interval;

    return () => {
      clearInterval(interval);
      if (pollingRef.current === interval) {
        pollingRef.current = null;
      }
    };
  }, [data?.match?.status, connectionStatus, fetchDetails]);

  // Fetch games list to link back to the sport details page
  useEffect(() => {
    if (!data?.match?.sport) return;
    fetch(cleanUrl(`${API}/games`))
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const game = resData.data.find(
            (g: unknown) => isGameSummary(g) && g.name.toLowerCase() === data.match.sport.toLowerCase()
          );
          if (game) setGameId(game._id);
        }
      })
      .catch((err) => console.warn("Failed to retrieve games list:", err));
  }, [data?.match?.sport]);

  const safeData = data?.match ? data : createFallbackData();
  const { match, teamALogo, teamBLogo, teamAColor, teamBColor } = safeData;
  const showInitialLoading = loading && !data?.match;
  const colorA = teamAColor || "#0B1C4A";
  const colorB = teamBColor || "#0B1C4A";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      timeZone: CAMP_TIME_ZONE,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!showInitialLoading && !data?.match) {
    return (
      <main className="min-h-screen bg-slate-50 pt-8 pb-12 font-sans">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-[#E60000] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer group active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back
          </button>

          <section className="mt-6 bg-white border border-red-100 rounded-3xl p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
              Match unavailable
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {error || "Match details could not be loaded. Please try again shortly."}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-8 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
    {/* Dedicated App Header */}
<header className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 sm:pb-4">
  
  {/* Back Button */}
  <button
    onClick={() => {
      if (gameId) router.push(`/camp-portal/games/${gameId}`);
      else router.back();
    }}
    className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-slate-200 text-slate-700 hover:text-[#E60000] rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer group active:scale-95 shrink-0"
  >
    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:-translate-x-1" />
    Back
  </button>
  
  {/* Badges Container */}
  <div className="flex flex-wrap items-center justify-end gap-2">
    
    {/* Connection Status Badge */}
    {connectionStatus === "live" && (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-green-500 border border-green-400 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-100 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
        </span>
        LIVE
      </span>
    )}
    
    {connectionStatus === "reconnecting" && (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500 border border-amber-400 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        Reconnecting...
      </span>
    )}
    
    {connectionStatus === "delayed" && (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-orange-500 border border-orange-400 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
        Delayed
      </span>
    )}

    {/* Match Info Badge */}
    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 shadow-sm text-center">
      {match.sport} • {match.round}{match.maxPoints ? ` • First to ${match.maxPoints}` : ""}
    </span>
    
  </div>
</header>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Match Details & Scoreboard */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Professional Glowing Scoreboard Card */}
            <section className={`bg-white border rounded-3xl p-5 sm:p-8 transition-all duration-300 relative overflow-hidden ${
              match.status === "live"
                ? "border-green-300 ring-2 ring-green-100/50 "
                : match.status === "paused"
                ? "border-amber-300 ring-2 ring-amber-100/50 "
                : match.status === "completed"
                ? "border-red-300 ring-2 ring-red-100/50 "
                : "border-slate-200/80 "
            }`}>
              {/* Top team color accent header line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                <div className="flex-1 animate-pulse" style={{ backgroundColor: colorA }} />
                <div className="flex-1 animate-pulse" style={{ backgroundColor: colorB }} />
              </div>

              {/* Glowing subtle color shapes */}
              {match.status === "live" && (
                <>
                  <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-green-500/5 blur-3xl pointer-events-none" />
                </>
              )}
              {match.status === "paused" && (
                <>
                  <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
                </>
              )}
              {match.status === "completed" && (
                <>
                  <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />
                </>
              )}
              {match.status === "upcoming" && (
                <>
                  <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#E60000]/5 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#0B1C4A]/5 blur-3xl pointer-events-none" />
                </>
              )}

              {/* Match Status Badge */}
<div className="flex justify-center mb-6">
  {match.status === "live" && (
    <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 rounded-full bg-green-50 border-2 border-green-500 shadow-sm">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 animate-ping opacity-75"></span>
        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
      </span>


      <span className="font-extrabold tracking-wider text-green-700 uppercase text-xs sm:text-sm">
        LIVE NOW
      </span>
    </div>
  )}

  {match.status === "paused" && (
    <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 rounded-full bg-amber-50 border-2 border-amber-500 shadow-sm">
      <Pause className="w-4 h-4 text-amber-600" />

      <span className="font-extrabold tracking-wider text-amber-700 uppercase text-xs sm:text-sm">
        MATCH PAUSED
      </span>
    </div>
  )}

  {match.status === "upcoming" && (
    <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 rounded-full bg-blue-50 border-2 border-blue-500 shadow-sm">
      <Calendar className="w-4 h-4 text-blue-600" />

      <span className="font-extrabold tracking-wider text-blue-700 uppercase text-xs sm:text-sm">
        UPCOMING MATCH
      </span>
    </div>
  )}

  {match.status === "completed" && (
    <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 rounded-full bg-red-50 border-2 border-red-500 shadow-sm">
      <CheckCircle className="w-4 h-4 text-red-600" />

      <span className="font-extrabold tracking-wider text-red-700 uppercase text-xs sm:text-sm">
        MATCH ENDED
      </span>
    </div>
  )}
</div>

              {/* Teams and Score Grid */}
              <div className="grid grid-cols-7 items-center justify-center text-center gap-2 sm:gap-4">
                
                {/* Team A Info */}
                <div className="col-span-3 flex flex-col items-center">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 border-2 shadow-inner flex items-center justify-center overflow-hidden relative mb-3"
                    style={{ borderColor: colorA }}
                  >
                    {loading ? (
                      <div className="animate-shimmer w-full h-full" />
                    ) : teamALogo ? (
                      <img src={teamALogo} alt={match.teamA} className="w-full h-full object-cover" />
                    ) : (
                      <Flag className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  {loading ? (
                    <div className="animate-shimmer h-5 w-24 rounded bg-slate-200 mt-1" />
                  ) : (
                    <h2 className="text-sm sm:text-lg font-black uppercase tracking-wide max-w-full truncate px-1" style={{ color: colorA }}>
                      {match.teamA}
                    </h2>
                  )}
                  {!loading && match.status === "completed" && match.winner === "teamA" && (
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shadow-sm">
                      <Trophy className="w-3.5 h-3.5" /> Winner
                    </span>
                  )}
                </div>                 {/* Glowing Big Score */}
                <div className="col-span-1 flex flex-col items-center justify-center font-display">
                  {loading ? (
                    <div className="animate-shimmer h-12 w-24 rounded bg-slate-200" />
                  ) : match.status === "upcoming" ? (
                    <span className="text-slate-300 font-black text-2xl sm:text-4xl">VS</span>
                  ) : (
                    <div className="flex items-center gap-1.5 sm:gap-3 text-4xl sm:text-6xl font-black">
                      <span
                        className={`${match.status === "live" ? "animate-pulse" : ""} ${match.status === "completed" && match.winner !== "teamA" ? "opacity-60" : ""}`}
                        style={{ color: colorA }}
                      >
                        {match.scoreA}
                      </span>
                      <span className="text-slate-300 text-3xl sm:text-5xl font-light">—</span>
                      <span
                        className={`${match.status === "live" ? "animate-pulse" : ""} ${match.status === "completed" && match.winner !== "teamB" ? "opacity-60" : ""}`}
                        style={{ color: colorB }}
                      >
                        {match.scoreB}
                      </span>
                    </div>
                  )}
                </div>

                {/* Team B Info */}
                <div className="col-span-3 flex flex-col items-center">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 border-2 shadow-inner flex items-center justify-center overflow-hidden relative mb-3"
                    style={{ borderColor: colorB }}
                  >
                    {loading ? (
                      <div className="animate-shimmer w-full h-full" />
                    ) : teamBLogo ? (
                      <img src={teamBLogo} alt={match.teamB} className="w-full h-full object-cover" />
                    ) : (
                      <Flag className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  {loading ? (
                    <div className="animate-shimmer h-5 w-24 rounded bg-slate-200 mt-1" />
                  ) : (
                    <h2 className="text-sm sm:text-lg font-black uppercase tracking-wide max-w-full truncate px-1" style={{ color: colorB }}>
                      {match.teamB}
                    </h2>
                  )}
                  {!loading && match.status === "completed" && match.winner === "teamB" && (
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shadow-sm">
                      <Trophy className="w-3.5 h-3.5" /> Winner
                    </span>
                  )}
                </div>

              </div>

              {/* Time & Round details */}
              <div className="border-t border-slate-100 mt-6 pt-4 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {showInitialLoading ? (
                    <span className="animate-shimmer h-4 w-56 rounded bg-slate-200" />
                  ) : (
                    formatDate(match.date)
                  )}
                </p>
                {match.notes && (
                  <p className="italic text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 max-w-lg mx-auto mt-2">
                    {`"${match.notes}"`}
                  </p>
                )}
              </div>
            </section>

            {/* Set-by-Set Scores Section */}
            {loading ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
                <div className="animate-shimmer h-5 w-32 rounded bg-slate-200" />
                <div className="space-y-3">
                  <div className="animate-shimmer h-10 w-full rounded bg-slate-100" />
                  <div className="animate-shimmer h-10 w-full rounded bg-slate-100" />
                </div>
              </div>
            ) : match.sets && match.sets.length > 0 && (
              <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-200/20">
                <h3 className="text-[#0B1C4A] font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-[#E60000]" /> Set Scores
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
                        <th className="text-left px-4 py-2.5 font-bold">Team / Set</th>
                        {match.sets.map((_, idx) => (
                          <th key={idx} className="text-center px-4 py-2.5 font-bold w-20">Set {idx + 1}</th>
                        ))}
                        <th className="text-center px-4 py-2.5 font-bold w-20 bg-slate-150 text-slate-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {/* Team A row */}
                      <tr>
                        <td className="px-4 py-3 font-bold uppercase tracking-wide" style={{ color: colorA }}>{match.teamA}</td>
                        {match.sets.map((s, idx) => (
                          <td
                            key={idx}
                            className="px-4 py-3 text-center"
                            style={{
                              color: colorA,
                              fontWeight: s.scoreA > s.scoreB ? "900" : "500",
                              opacity: s.scoreA > s.scoreB ? 1 : 0.6
                            }}
                          >
                            {s.scoreA}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-black text-base" style={{ color: colorA, backgroundColor: `${colorA}15` }}>{match.scoreA}</td>
                      </tr>

                      {/* Team B row */}
                      <tr>
                        <td className="px-4 py-3 font-bold uppercase tracking-wide" style={{ color: colorB }}>{match.teamB}</td>
                        {match.sets.map((s, idx) => (
                          <td
                            key={idx}
                            className="px-4 py-3 text-center"
                            style={{
                              color: colorB,
                              fontWeight: s.scoreB > s.scoreA ? "900" : "500",
                              opacity: s.scoreB > s.scoreA ? 1 : 0.6
                            }}
                          >
                            {s.scoreB}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-black text-base" style={{ color: colorB, backgroundColor: `${colorB}15` }}>{match.scoreB}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Score Log Section */}
          <div className="lg:col-span-1">
<section className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[420px] md:h-[500px] overflow-hidden">
  
  {/* Header */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
        <Activity className="w-4 h-4 text-red-600" />
      </div>

      <div>
        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
          Match Timeline
        </h3>

        <p className="text-xs text-slate-500">
          Live score updates
        </p>
      </div>
    </div>

    <span className="text-xs font-semibold text-slate-500">
      {match.timeline?.length || 0} Events
    </span>
  </div>

  {/* Timeline Container */}
  <div ref={logContainerRef} className="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth pr-2 pb-2 relative ml-5 space-y-6 z-10">
    {/* Continuous Timeline Line */}
    <div className="absolute top-2 bottom-0 left-[7px] w-[2px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"></div>

    {loading ? (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative pl-8">
            <span className="absolute left-0 top-2 h-4 w-4 rounded-full bg-white border-[3px] border-slate-200 shadow-sm animate-shimmer" />
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="animate-shimmer h-4 w-3/4 rounded bg-slate-200" />
              <div className="animate-shimmer h-6 w-16 rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    ) : match.timeline && match.timeline.length > 0 ? (
        match.timeline.map((event, idx) => {
          const isTeamAEvent =
            match.teamA &&
            event.text.toLowerCase().includes(match.teamA.toLowerCase());

          const isTeamBEvent =
            match.teamB &&
            event.text.toLowerCase().includes(match.teamB.toLowerCase());

          const eventColor = isTeamAEvent
            ? colorA
            : isTeamBEvent
            ? colorB
            : "#dc2626";

          const isLatest =
            idx === (match.timeline?.length || 0) - 1;

          return (
            <div
              key={idx}
              className="relative pl-8 mb-4"
            >
              {/* Timeline Dot */}
              <span
                className="absolute left-0 top-3 w-4 h-4 rounded-full border-4 bg-white z-10"
                style={{
                  borderColor: eventColor,
                }}
              />

              {/* Event Card */}
              <div
                className={`rounded-2xl border bg-white p-4 transition-all ${
                  isLatest
                    ? "shadow-md ring-2 ring-slate-100"
                    : "shadow-sm"
                }`}
                style={{
                  borderLeft: `4px solid ${eventColor}`,
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {event.text}
                  </p>

                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg whitespace-nowrap">
                    {event.time}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Score
                  </span>

                  <span
                    className="px-3 py-1 rounded-lg text-sm font-black"
                    style={{
                      backgroundColor: `${eventColor}15`,
                      color: eventColor,
                    }}
                  >
                    {event.scoreA} - {event.scoreB}
                  </span>

                  {isLatest && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-100 text-green-700">
                      Latest
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <Activity className="w-8 h-8 mb-3" />
          <p className="font-medium">
            No events recorded yet
          </p>
        </div>
      )}
    </div>
  </section>
</div>
        </div>

{/* Clean & Responsive App Footer */}
<footer className="mt-12 pt-8 pb-10 border-t border-slate-200/60 text-center">
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 max-w-3xl mx-auto">
    
    {/* Defacto Institute Button */}
    <a 
      href="https://www.defactoinstitute.in/" 
      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 bg-[#0B1C4A] text-[#FACC15] rounded-xl hover:bg-[#FACC15] hover:text-[#0B1C4A] shadow-md hover:shadow-xl border-2 border-[#0B1C4A]"
    >
      Visit - Defacto Institute Website
    </a>
    
    {/* Summer Camp Button */}
    <a 
      href="https://summercamp.defactoinstitute.in/" 
      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all duration-300 bg-[#E60000] rounded-xl hover:bg-[#0B1C4A] shadow-[0_4px_0_#FACC15] hover:shadow-[0_6px_0_#FACC15] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0px_0_#FACC15]"
    >
      Visit - Summer Camp Website
    </a>
    
  </div>

  {/* Optional: Simple Copyright / Tagline */}
  <div className="mt-10 flex flex-col items-center gap-2">
  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
    © {new Date().getFullYear()} Defacto Institute
  </p>
  <p className="text-[10px] font-medium tracking-widest text-slate-400/70 uppercase">
    Developed & Designed by <span className="font-bold text-slate-400">Rishabh Bisht</span>
  </p>
</div>
</footer>

      </div>
    </main>
  );
}
