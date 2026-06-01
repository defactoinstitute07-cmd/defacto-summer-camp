import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Camp Portal — Live Scores, Rankings & Updates | Defacto Summer Camp 2026",
  description:
    "Follow the Defacto Institute Summer Camp 2026 in real time. View live match scores, player rankings, points tables, match results, attendance records, and official camp announcements.",
  keywords: [
    "defacto summer camp live scores",
    "camp portal",
    "follow the camp",
    "summer camp 2026 results",
    "player rankings summer camp",
    "points table summer camp",
    "match results bhaniyawala",
    "camp attendance records",
    "defacto institute summer camp updates",
    "live camp scores dehradun",
    "sports camp leaderboard",
    "defacto camp 2026",
  ].join(", "),
  alternates: {
    canonical: "https://summercamp.defactoinstitute.in/camp-portal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Camp Portal — Live Scores & Rankings | Defacto Summer Camp 2026",
    description:
      "Track live scores, player rankings, points tables, match results, and real-time camp updates for the Defacto Institute Summer Camp 2026 at Bhaniyawala.",
    url: "https://summercamp.defactoinstitute.in/camp-portal",
    siteName: "Defacto Institute Summer Camp 2026",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Defacto Summer Camp 2026 — Camp Portal",
    description:
      "Live scores, rankings, points tables, attendance records, and camp announcements — all in one place.",
  },
};

export default function CampPortalLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://summercamp.defactoinstitute.in/camp-portal",
        url: "https://summercamp.defactoinstitute.in/camp-portal",
        name: "Camp Portal — Defacto Institute Summer Camp 2026",
        description:
          "Real-time camp portal for Defacto Institute Summer Camp 2026 featuring live scores, player rankings, points table, match results, attendance records, and updates.",
        isPartOf: {
          "@id": "https://summercamp.defactoinstitute.in",
        },
        inLanguage: "en-IN",
        dateModified: new Date().toISOString(),
      },
      {
        "@type": "SportsEvent",
        name: "Defacto Institute Summer Camp 2026",
        description:
          "An intensive multi-sport summer camp for students featuring Badminton, Volleyball, Quiz Competition, Cultural Activities, Painting, TUG-OF-WAR, and Fun Activities.",
        startDate: "2026-06-01T18:00:00+05:30",
        endDate: "2026-07-04T22:00:00+05:30",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        url: "https://summercamp.defactoinstitute.in/camp-portal",
        location: {
          "@type": "Place",
          name: "Defacto Institute Bhaniyawala",
          address: {
            "@type": "PostalAddress",
            streetAddress: "De Facto Institute Rd, Bhania Wala",
            addressLocality: "Bhaniyawala",
            addressRegion: "Uttarakhand",
            postalCode: "248140",
            addressCountry: "IN",
          },
        },
        organizer: {
          "@type": "EducationalOrganization",
          name: "Defacto Institute Bhaniyawala",
          url: "https://summercamp.defactoinstitute.in",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
