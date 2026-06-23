import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartas de futbolistas por temporada",
  description:
    "Busca cartas de futbolistas por temporada, club, país y puntuación. Consulta estadísticas reales, atributos y perfiles de cada jugador.",
  alternates: {
    canonical: "/cards",
  },
  openGraph: {
    title: "Cartas de futbolistas por temporada | PBP Cards",
    description:
      "Explora cartas de jugadores con puntuaciones y estadísticas reales por temporada.",
    url: "/cards",
  },
};

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
