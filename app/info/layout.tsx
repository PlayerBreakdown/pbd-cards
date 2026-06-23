import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Método de puntuación de cartas",
  description:
    "Conoce cómo Player Breakdown calcula las puntuaciones de las cartas usando referencias estadísticas y datos reales por temporada.",
  alternates: {
    canonical: "/info",
  },
  openGraph: {
    title: "Método de puntuación de cartas | PBP Cards",
    description:
      "Explicación del sistema de puntuación usado para valorar definición, visión, regate, pase y defensa.",
    url: "/info",
  },
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
