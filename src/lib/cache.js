import { kv } from "@vercel/kv";

export const CACHE_KEYS = {
  MATCH_SCORE: (matchId) => `score:${matchId}`,
};

export async function getCached(key) {
  try {
    const value = await kv.get(key);
    // @vercel/kv returns parsed object directly if stored as JSON
    return value;
  } catch (error) {
    console.error(`[Redis Error] Failed to GET key "${key}":`, error);
    return null; // Silent fail, fallback to DB
  }
}

export async function setCache(key, data, ttl) {
  try {
    if (ttl) {
      await kv.set(key, data, { ex: ttl });
    } else {
      await kv.set(key, data);
    }
  } catch (error) {
    console.error(`[Redis Error] Failed to SET key "${key}":`, error);
  }
}
