import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rankings de futbolistas por atributo",
  description:
    "Ordena futbolistas por puntuación, definición, visión, regate, pase y defensa para descubrir los mejores jugadores de cada temporada.",
  alternates: {
    canonical: "/rankings",
  },
  openGraph: {
    title: "Rankings de futbolistas por atributo | PBP Cards",
    description:
      "Consulta rankings de jugadores por puntuación y atributos usando datos reales de temporada.",
    url: "/rankings",
  },
};

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
