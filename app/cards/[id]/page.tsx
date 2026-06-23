import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardArt } from "@/app/components/OptimizedImages";
import { CardIndex, cardsIndex } from "@/lib/cardIndex";
import { getCardDetail } from "@/lib/serverCardDetails";

type PageProps = {
  params: Promise<{ id: string }>;
};

const STATIC_CARD_PAGE_LIMIT = Number(process.env.PBP_STATIC_CARD_PAGE_LIMIT ?? 500);

export const dynamicParams = true;

export function generateStaticParams() {
  return cardsIndex.slice(0, STATIC_CARD_PAGE_LIMIT).map((card) => ({ id: card.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = findCardIndex(id);

  if (!card) {
    return {
      title: "Carta no encontrada",
    };
  }

  const season = card.season_text ? ` ${card.season_text}` : "";
  const club = card.club ? ` en ${card.club}` : "";
  const title = `${card.player_name}${season} | Carta y stats`;
  const description = `${card.player_name}${season}${club}: carta con puntuación ${formatScore(card.overall)}, definición ${formatScore(card.gol)}, visión ${formatScore(card.asist)}, regate ${formatScore(card.regate)}, pase ${formatScore(card.pase)} y defensa ${formatScore(card.def)}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/cards/${card.id}`,
    },
    openGraph: {
      title: `${title} | PBP Cards`,
      description,
      url: `/cards/${card.id}`,
      images: card.image_url
        ? [
            {
              url: card.image_url,
              alt: `Carta de ${card.player_name}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: card.image_url ? [card.image_url] : undefined,
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  const card = (await getCardDetail(id)) ?? findCardIndex(id);

  if (!card) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${card.player_name} ${card.season_text ?? ""}`.trim(),
    url: `https://playerbreakdowncards.com/cards/${card.id}`,
    image: card.image_url ? `https://playerbreakdowncards.com${card.image_url}` : undefined,
    description: `Carta de ${card.player_name} con puntuaciones y estadísticas reales por temporada.`,
    mainEntity: {
      "@type": "Person",
      name: card.player_name,
      nationality: card.country || undefined,
      memberOf: card.club
        ? {
            "@type": "SportsTeam",
            name: card.club,
          }
        : undefined,
      subjectOf: {
        "@type": "CreativeWork",
        name: `Carta Player Breakdown de ${card.player_name}`,
        image: card.image_url ? `https://playerbreakdowncards.com${card.image_url}` : undefined,
        about: `${card.player_name} ${card.season_text ?? ""}`.trim(),
      },
    },
  };

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(280px,420px)_1fr]">
        <section className="rounded-2xl border border-yellow-400/25 bg-black/55 p-4 shadow-[0_0_32px_rgba(250,204,21,0.12)]">
          {card.image_url ? (
            <CardArt
              src={card.image_url}
              alt={`Carta de ${card.player_name}`}
              sizes="(min-width: 1024px) 420px, 90vw"
              priority
              className="mx-auto w-full rounded-xl"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-white/10 text-white/50">
              Sin imagen
            </div>
          )}
          <Link
            href={`/cards?player=${encodeURIComponent(card.player_name)}&season=all&sort=season_end_desc&view=all`}
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-yellow-300/50 bg-yellow-400 px-5 py-3 text-center font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
          >
            Ver todas las temporadas
          </Link>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-sky-300/15 bg-[linear-gradient(90deg,rgba(14,165,233,0.14),rgba(250,204,21,0.08))] p-6">
            <p className="text-sm font-black uppercase tracking-wide text-yellow-200/75">
              Carta de futbolista
            </p>
            <h1 className="mt-2 text-4xl font-black">{card.player_name}</h1>
            <p className="mt-2 text-lg text-white/70">
              {[card.season_text, card.club, card.country].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-5 inline-flex rounded-xl border border-yellow-300/40 bg-yellow-400 px-5 py-3 text-3xl font-black text-black">
              {formatScore(card.overall)}
            </div>
          </div>

          <StatsBlock card={card} />

          <div className="flex flex-wrap gap-3">
            <Link
              href="/cards"
              className="rounded-lg border border-yellow-300/50 bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
            >
              Ver todas las cartas
            </Link>
            <Link
              href={`/vs?left=${card.id}`}
              className="rounded-lg border border-sky-300/40 bg-sky-300/10 px-5 py-3 font-black text-white transition hover:bg-sky-300/20"
            >
              Comparar en VS
            </Link>
          </div>
        </section>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}

function findCardIndex(id: string) {
  return cardsIndex.find((card) => card.id === id);
}

function StatsBlock({ card }: { card: CardIndex }) {
  const rows = [
    ["Minutos", card.stats?.minutes],
    ["Goles", card.stats?.goals],
    ["Goles / 90", card.stats?.goals_per_90],
    ["Asistencias", card.stats?.assists],
    ["Pases clave", card.stats?.key_passes],
    ["Pases clave / 90", card.stats?.key_passes_per_90],
    ["Regates exitosos", card.stats?.successful_dribbles],
    ["Regates / 90", card.stats?.successful_dribbles_per_90],
    ["Pases totales", card.stats?.total_passes],
    ["Acierto de pase", card.stats?.pass_accuracy ? `${formatScore(card.stats.pass_accuracy)}%` : null],
    ["Entradas", card.stats?.tackles],
    ["Intercepciones", card.stats?.interceptions],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  if (!rows.length) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <h2 className="text-2xl font-black">Estadisticas reales</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={String(label)} className="flex justify-between gap-4 border-b border-white/10 py-2">
            <span className="text-white/60">{label}</span>
            <span className="font-black text-white">{typeof value === "number" ? formatScore(value) : value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatScore(value: number | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}
