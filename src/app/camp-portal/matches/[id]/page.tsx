import type { Metadata } from "next";
import MatchDetailsClient from "./MatchDetailsClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/matches/${id}`, { next: { revalidate: 10 } });
    const data = await res.json();
    if (!data.success) throw new Error();
    const match = data.data.match;

    return {
      title: `${match.teamA} vs ${match.teamB} - Live ${match.sport} Score | Defacto Summer Camp 2026`,
      description: `Follow live score updates, set scores, point-by-point tracking, and game details for ${match.teamA} vs ${match.teamB} in ${match.sport} at Defacto Summer Camp 2026.`,
    };
  } catch {
    return {
      title: "Live Match Scoreboard & Timeline | Defacto Summer Camp 2026",
      description: "Follow live sports match details, real-time scoreboards, set stats, and timelines at Defacto Summer Camp 2026.",
    };
  }
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <MatchDetailsClient matchId={id} />
  );
}
