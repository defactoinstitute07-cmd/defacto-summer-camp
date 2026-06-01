import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin", "/private/"],
    },
    sitemap: "https://summercamp.defactoinstitute.in/sitemap.xml",
  };
}
