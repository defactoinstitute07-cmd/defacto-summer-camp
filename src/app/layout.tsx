import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Defacto Institute Summer Camp 2026 | Learn • Play • Grow • Compete",
  description: "Join the most exciting sports and strategy summer camp of 2026. Follow camp updates, register online, and improve your skills in cricket, football, badminton, and chess with expert mentors at Defacto Institute Bhaniyawala.",
  keywords: [
    "summer camp 2026",
    "defacto summer camp",
    "follow camp updates",
    "defacto institute bhaniyawala",
    "sports camp bhaniyawala",
    "sports academy dehradun",
    "cricket training bhaniyawala",
    "football camp uttarakhand",
    "badminton camp",
    "chess coaching dehradun",
    "kabaddi training",
    "summer sports camp",
    "defacto institute"
  ].join(", "),
  alternates: {
    canonical: "https://summercamp.defactoinstitute.in",
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
    title: "Defacto Institute Summer Camp 2026 | Camp & Registration Updates",
    description: "Learn, Play, Grow, and Compete at the ultimate summer sports camp. Follow our live camp updates, schedules, and matches at Defacto Institute Bhaniyawala.",
    url: "https://summercamp.defactoinstitute.in",
    siteName: "Defacto Institute Summer Camp 2026",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Defacto Institute Summer Camp 2026",
    description: "Register and follow real-time camp updates for the Defacto Summer Camp 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": "Defacto Institute Summer Camp 2026",
    "description": "The ultimate sports, activities, and skill-building summer camp for students by Defacto Institute Bhaniyawala.",
    "startDate": "2026-06-01T18:00:00+05:30",
    "endDate": "2026-07-04T22:00:00+05:30",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "Defacto Institute Bhaniyawala",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "De Facto Institute Rd, Bhania Wala",
        "addressLocality": "Bhaniyawala",
        "addressRegion": "Uttarakhand",
        "postalCode": "248140",
        "addressCountry": "IN"
      }
    },
    "organizer": {
      "@type": "EducationalOrganization",
      "name": "Defacto Institute Bhaniyawala",
      "url": "https://summercamp.defactoinstitute.in"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://summercamp.defactoinstitute.in",

      "price": "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": "2026-05-15T00:00:00+05:30"
    }
  };

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

