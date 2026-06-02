import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { getCached, setCache, CACHE_KEYS } from "@/lib/cache";

export const dynamic = "force-dynamic";

// Safeguard against OverwriteModelError in Next.js hot-reloading
const getMatchModel = async () => {
  await dbConnect();
  if (mongoose.models.Match) {
    return mongoose.models.Match;
  }
  // If not compiled yet, require it which will compile and register it
  return require("../../../../backend/models/Match");
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");

  const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  if (!matchId) {
    return NextResponse.json(
      { success: false, message: "Missing matchId parameter" },
      { status: 400, headers: noCacheHeaders }
    );
  }

  const cacheKey = CACHE_KEYS.MATCH_SCORE(matchId);

  // 1. Try to read from KV Cache
  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    return NextResponse.json(
      { success: true, source: "cache", data: cachedData },
      { status: 200, headers: noCacheHeaders }
    );
  }

  // 2. Cache Miss: Fallback to MongoDB
  try {
    const Match = await getMatchModel();
    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Match not found" },
        { status: 404, headers: noCacheHeaders }
      );
    }

    const payload = {
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      status: match.status,
      winner: match.winner,
      sets: match.sets || [],
      timeline: match.timeline || [],
    };

    // 3. Write back to Redis Cache with dynamic TTLs
    const isLive = match.status === "live" || match.status === "paused";
    const ttl = isLive ? 5 : 30; // 5s for live/paused, 30s otherwise
    await setCache(cacheKey, payload, ttl);

    return NextResponse.json(
      { success: true, source: "db", data: payload },
      { status: 200, headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[API Error] Failed to retrieve match details:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
