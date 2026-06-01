import { MetadataRoute } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://defacto-summer-camp.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/camp-portal`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#games`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#updates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#volunteers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  try {
    // Fetch all games from backend to dynamically index game detail URLs
    const res = await fetch(`${API}/games`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      const dynamicRoutes = data.data.map((game: { _id: string; updatedAt?: string }) => ({
        url: `${baseUrl}/camp-portal/games/${game._id}`,
        lastModified: game.updatedAt ? new Date(game.updatedAt) : new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      }));
      return [...staticRoutes, ...dynamicRoutes];
    }
  } catch {
    console.warn("⚠️ Failed to fetch dynamic games for sitemap. Using static routes fallback.");
  }

  return staticRoutes;
}
