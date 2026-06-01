import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameDetailsClient from "./GameDetailsClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Game {
  name: string;
  description: string;
  status: string;
  iconName: string;
  imageSrc: string;
}

// Generate dynamic SEO metadata server-side
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/games/${id}`, { next: { revalidate: 10 } });
    const data = await res.json();
    if (!data.success) throw new Error();
    const game: Game = data.data;

    return {
      title: `${game.name} — Live Scores, Standings & Schedules | Defacto Summer Camp 2026`,
      description: `Follow ${game.name} live standings, match scores, brackets, team points tables, player profiles, and schedules at Defacto Institute Summer Camp 2026, Bhaniyawala.`,
      keywords: [
        `${game.name} live scores`,
        `${game.name} standings`,
        `${game.name} summer camp 2026`,
        `${game.name} tournament schedule`,
        `defacto institute ${game.name.toLowerCase()}`,
      ].join(", "),
      openGraph: {
        title: `${game.name} Live Updates | Defacto Summer Camp 2026`,
        description: `Get real-time scores, match schedules, points table standings, and player list for ${game.name} at Defacto Summer Camp 2026.`,
        images: game.imageSrc ? [{ url: game.imageSrc }] : [],
      },
    };
  } catch {
    return {
      title: "Game Leaderboard & Matches | Defacto Summer Camp 2026",
      description: "Follow live standings, match results, and schedules for your favourite games at Defacto Summer Camp 2026.",
    };
  }
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header />
      <GameDetailsClient gameId={id} />
      <Footer />
    </>
  );
}
