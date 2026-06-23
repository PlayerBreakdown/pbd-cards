import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import BrandHomeLink from "./components/BrandHomeLink";
import InfoBanner from "./components/InfoBanner";
import MainNav from "./components/MainNav";
import SiteFooter from "./components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://playerbreakdowncards.com"),
  title: {
    default: "Player Breakdown Cards | Cartas, rankings y comparador de futbolistas",
    template: "%s | PBP Cards",
  },
  description:
    "Explora cartas de futbolistas, rankings por temporada y comparativas VS con puntuaciones basadas en estadísticas reales.",
  keywords: [
    "cartas de futbolistas",
    "cartas de fútbol",
    "rankings de futbolistas",
    "comparar jugadores de fútbol",
    "estadísticas de fútbol",
    "mejores futbolistas por temporada",
    "cartas de jugadores",
    "football player cards",
    "player breakdown",
    "PBP Cards",
  ],
  authors: [{ name: "Player Breakdown" }],
  creator: "Player Breakdown",
  publisher: "Player Breakdown",
  applicationName: "Player Breakdown Cards",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Player Breakdown Cards | Cartas y rankings de futbolistas",
    description:
      "Compara jugadores con cartas, rankings y puntuaciones creadas a partir de estadísticas reales por temporada.",
    url: "https://playerbreakdowncards.com",
    siteName: "PBP Cards",
    images: [
      {
        url: "/brand/pbp-logo.png",
        width: 1024,
        height: 1024,
        alt: "PBP Cards",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Player Breakdown Cards | Cartas y rankings de futbolistas",
    description:
      "Compara jugadores con cartas, rankings y puntuaciones creadas a partir de estadísticas reales por temporada.",
    images: ["/brand/pbp-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Player Breakdown Cards",
  alternateName: "PBP Cards",
  url: "https://playerbreakdowncards.com",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  inLanguage: "es",
  description:
    "App web para explorar cartas de futbolistas, comparar jugadores y consultar rankings con puntuaciones basadas en estadísticas reales.",
  creator: {
    "@type": "Organization",
    name: "Player Breakdown",
    url: "https://playerbreakdowncards.com",
    logo: "https://playerbreakdowncards.com/brand/pbp-logo.png",
    sameAs: [
      "https://www.youtube.com/@Player-Breakdown",
      "https://ko-fi.com/playerbreakdown",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-black text-white">
        <header className="pbp-site-header sticky top-0 z-50 border-b border-[#d89b18]/25">
          <div className="relative mx-auto flex max-w-[108rem] flex-col items-center gap-2 px-3 py-2 sm:px-5 lg:px-6 xl:py-2.5 2xl:px-8">
            <BrandHomeLink />

            <MainNav />
          </div>
        </header>

        <InfoBanner />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
