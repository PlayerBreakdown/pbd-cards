import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparador VS de futbolistas",
  description:
    "Compara dos futbolistas lado a lado con cartas, puntuaciones y estadísticas reales por temporada.",
  alternates: {
    canonical: "/vs",
  },
  openGraph: {
    title: "Comparador VS de futbolistas | PBP Cards",
    description:
      "Enfrenta dos jugadores y revisa diferencias en puntuación, definición, visión, regate, pase y defensa.",
    url: "/vs",
  },
};

export default function VsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
