"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CardDetailContent } from "@/app/components/CardDetailContent";
import { FilterField, Select } from "@/app/components/FilterControls";
import { CardArt, PlayerFace } from "@/app/components/OptimizedImages";
import SeasonRatingScale from "@/app/components/SeasonRatingScale";
import { CardIndex } from "@/lib/cardTypes";
import { LABELS, RankKey, cardsIndex, isLegacyCard, latestSeasonIndex, optionsForIndex, primeCards, searchCardsIndex, sortCards } from "@/lib/cardIndex";
import { useSessionState } from "@/lib/useSessionState";
import { useCardDetail } from "@/lib/useCardDetail";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useModalHistory } from "@/lib/useModalHistory";
import { setQueryParam, validOption } from "@/lib/urlState";

type SortKey =
  | "season_end_desc"
  | "overall_desc"
  | "gol_desc"
  | "asist_desc"
  | "regate_desc"
  | "pase_desc"
  | "def_desc"
  | "player_name_asc";

const DEFAULT_SEASON = latestSeasonIndex();
const PAGE_SIZE = 36;
const GOAT_CARD_ID = globalBestCardId();
const SEASON_BEST_CARD_IDS = seasonBestCardIds(GOAT_CARD_ID);
const validSortKeys = new Set<SortKey>([
  "season_end_desc",
  "overall_desc",
  "gol_desc",
  "asist_desc",
  "regate_desc",
  "pase_desc",
  "def_desc",
  "player_name_asc",
]);
const validViewModes = new Set(["all", "prime"]);
const validFilterValues = {
  series: new Set(cardsIndex.map((card) => card.series).filter(Boolean)),
  season: new Set(cardsIndex.map((card) => card.season_text).filter(Boolean)),
  country: new Set(cardsIndex.map((card) => card.country).filter(Boolean)),
  club: new Set(cardsIndex.map((card) => card.club).filter(Boolean)),
};

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black px-3 py-5 text-white sm:px-6" />}>
      <CardsContent />
    </Suspense>
  );
}

function CardsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const playerParam = searchParams.get("player")?.trim() ?? "";
  const seriesParam = searchParams.get("series");
  const seasonParam = searchParams.get("season");
  const countryParam = searchParams.get("country");
  const clubParam = searchParams.get("club");
  const sortParam = searchParams.get("sort") as SortKey | null;
  const viewParam = searchParams.get("view") as "all" | "prime" | null;
  const pageParam = Number(searchParams.get("page"));
  const cardParam = searchParams.get("card");
  const hasUrlFilter = Boolean(playerParam || seriesParam || seasonParam || countryParam || clubParam || sortParam || viewParam || searchParams.get("page") || cardParam);
  const initialSeries = seriesParam && validOption(seriesParam, validFilterValues.series) ? seriesParam : "all";
  const initialSeason =
    seasonParam === "all" || (seasonParam && validOption(seasonParam, validFilterValues.season))
      ? seasonParam
      : DEFAULT_SEASON;
  const initialCountry = countryParam && validOption(countryParam, validFilterValues.country) ? countryParam : "all";
  const initialClub = clubParam && validOption(clubParam, validFilterValues.club) ? clubParam : "all";
  const initialSort = sortParam && validSortKeys.has(sortParam) ? sortParam : "overall_desc";
  const initialView = viewParam && validViewModes.has(viewParam) ? viewParam : "prime";
  const initialPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [search, setSearch] = useSessionState("pbp-cards-search", playerParam, { load: !hasUrlFilter });
  const [series, setSeries] = useSessionState("pbp-cards-series", initialSeries, { load: !hasUrlFilter });
  const [season, setSeason] = useSessionState("pbp-cards-season", initialSeason, { load: !hasUrlFilter });
  const [country, setCountry] = useSessionState("pbp-cards-country", initialCountry, { load: !hasUrlFilter });
  const [club, setClub] = useSessionState("pbp-cards-club", initialClub, { load: !hasUrlFilter });
  const [sort, setSort] = useSessionState<SortKey>("pbp-cards-sort", initialSort, { load: !hasUrlFilter });
  const [viewMode, setViewMode] = useSessionState<"all" | "prime">("pbp-cards-view", initialView, { load: !hasUrlFilter });
  const [page, setPage] = useSessionState("pbp-cards-page", initialPage, { load: !hasUrlFilter });
  const [selectedCard, setSelectedCard] = useState<CardIndex | null>(
    cardParam ? cardsIndex.find((card) => card.id === cardParam) ?? null : null
  );
  const closeSelectedCard = useModalHistory(selectedCard, setSelectedCard, "pbpCardsModal");
  const debouncedSearch = useDebouncedValue(search, 250);

  const seriesOptions = useMemo(() => optionsForIndex("series"), []);
  const seasonOptions = useMemo(() => optionsForIndex("season_text"), []);
  const countryOptions = useMemo(() => optionsForIndex("country"), []);
  const clubOptions = useMemo(() => optionsForIndex("club"), []);
  const highlights = useMemo(() => seasonHighlights(DEFAULT_SEASON), []);

  const allCards = useMemo(() => {
    const filtered = searchCardsIndex(debouncedSearch).filter((card) => {
      if (series !== "all" && card.series !== series) return false;
      if (season !== "all" && card.season_text !== season) return false;
      if (country !== "all" && card.country !== country) return false;
      if (club !== "all" && card.club !== club) return false;
      return true;
    });

    const rows = viewMode === "prime" ? primeCards(filtered, rankKeyFromSort(sort)) : filtered;

    return sortCards(rows, sort);
  }, [debouncedSearch, series, season, country, club, sort, viewMode]);

  const totalPages = Math.max(1, Math.ceil(allCards.length / PAGE_SIZE));
  const cards = allCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, setPage, totalPages]);

  const currentQuery = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(currentQuery);
    setQueryParam(params, "player", search.trim(), "");
    setQueryParam(params, "series", series, "all");
    setQueryParam(params, "season", season, DEFAULT_SEASON);
    setQueryParam(params, "country", country, "all");
    setQueryParam(params, "club", club, "all");
    setQueryParam(params, "sort", sort, "overall_desc");
    setQueryParam(params, "view", viewMode, "prime");
    setQueryParam(params, "page", String(page), "1");
    setQueryParam(params, "card", selectedCard?.id ?? "", "");

    const nextQuery = params.toString();
    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [club, country, currentQuery, page, pathname, router, search, season, selectedCard?.id, series, sort, viewMode]);

  const canClear =
    search.trim().length > 0 ||
    series !== "all" ||
    season !== DEFAULT_SEASON ||
    country !== "all" ||
    club !== "all" ||
    sort !== "overall_desc" ||
    viewMode !== "prime";

  const clearAll = () => {
    setSearch("");
    setSeries("all");
    setSeason(DEFAULT_SEASON);
    setCountry("all");
    setClub("all");
    setSort("overall_desc");
    setViewMode("prime");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-black px-3 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-[108rem]">
      <div className="mb-5 space-y-4">
        <div className="grid gap-4 2xl:grid-cols-2 2xl:items-stretch">
          <SeasonRatingScale />
          <HighlightStrip highlights={highlights} season={DEFAULT_SEASON} onOpen={setSelectedCard} />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <FilterField label="Jugador" className="xl:col-span-2">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar jugador... (ej: Messi)"
              className="pbp-control w-full rounded-lg border border-yellow-400/20 px-3 py-2 outline-none focus:border-yellow-400/60 text-white placeholder:text-white/40"
            />
          </FilterField>

          <FilterField label="Vista">
            <SegmentedSwitch
              value={viewMode}
              onChange={(value) => {
                setViewMode(value);
                setPage(1);
              }}
            />
          </FilterField>
          <FilterField label="Temporada">
            <Select
              value={season}
              onChange={(value) => {
                setSeason(value);
                setPage(1);
              }}
              options={seasonOptions}
              allLabel="Todas las temporadas"
            />
          </FilterField>
          <FilterField label="Orden">
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortKey);
                setPage(1);
              }}
              className="pbp-control w-full rounded-lg text-white border border-yellow-400/20 px-3 py-2 outline-none focus:border-yellow-400/60"
            >
              <option value="overall_desc" className="bg-black text-white">Mayor puntuación</option>
              <option value="gol_desc" className="bg-black text-white">{LABELS.gol}</option>
              <option value="asist_desc" className="bg-black text-white">{LABELS.asist}</option>
              <option value="regate_desc" className="bg-black text-white">{LABELS.regate}</option>
              <option value="pase_desc" className="bg-black text-white">{LABELS.pase}</option>
              <option value="def_desc" className="bg-black text-white">{LABELS.def}</option>
              <option value="player_name_asc" className="bg-black text-white">Nombre (A-Z)</option>
              <option value="season_end_desc" className="bg-black text-white">Temporada (más nueva)</option>
            </select>
          </FilterField>

          <FilterField label="Club">
            <Select
              value={club}
              onChange={(value) => {
                setClub(value);
                setPage(1);
              }}
              options={clubOptions}
              allLabel="Todos los clubes"
            />
          </FilterField>
          <FilterField label="País">
            <Select value={country} onChange={(value) => { setCountry(value); setPage(1); }} options={countryOptions} allLabel="Todos los países" />
          </FilterField>

          <button
            type="button"
            onClick={clearAll}
            disabled={!canClear}
            className="pbp-control mt-5 w-full rounded-lg border border-yellow-400/20 px-3 py-2 hover:bg-yellow-400/10 disabled:opacity-40"
          >
            Limpiar
          </button>

          <select
            value={series}
            onChange={(event) => {
              setSeries(event.target.value);
              setPage(1);
            }}
            className="hidden"
            aria-label="Serie"
          >
            {seriesOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {cards.length === 0 && (
        <p className="text-white/60">No hay resultados con esos filtros.</p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-4 2xl:grid-cols-6">
        {cards.map((card, index) => (
          <CardPreview
            key={card.id}
            card={card}
            rank={(page - 1) * PAGE_SIZE + index + 1}
            isGoat={card.id === GOAT_CARD_ID}
            isSeasonBest={SEASON_BEST_CARD_IDS.has(card.id)}
            onOpen={setSelectedCard}
          />
        ))}
      </div>

      {allCards.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={allCards.length}
          onPageChange={(nextPage) => {
            setPage(nextPage);
            scrollToResults();
          }}
        />
      )}

      {selectedCard && (
        <CardDetail card={selectedCard} onClose={closeSelectedCard} />
      )}
      </div>
    </main>
  );
}

function seasonHighlights(seasonText: string) {
  const seasonCards = searchCardsIndex("")
    .filter((card) => card.season_text === seasonText);

  const pickBest = (key: RankKey) =>
    [...seasonCards].sort((a, b) => scoreValue(b, key) - scoreValue(a, key))[0] ?? null;

  return [
    { title: "Mejor jugador ofensivo", stat: "Mayor puntuación", key: "overall" as RankKey, card: pickBest("overall") },
    { title: "Mejor definición", stat: LABELS.gol, key: "gol" as RankKey, card: pickBest("gol") },
    { title: "Mejor visión", stat: LABELS.asist, key: "asist" as RankKey, card: pickBest("asist") },
    { title: "Mejor regate", stat: LABELS.regate, key: "regate" as RankKey, card: pickBest("regate") },
  ];
}

function rankKeyFromSort(sort: SortKey): RankKey {
  if (sort === "gol_desc") return "gol";
  if (sort === "asist_desc") return "asist";
  if (sort === "regate_desc") return "regate";
  if (sort === "pase_desc") return "pase";
  if (sort === "def_desc") return "def";
  return "overall";
}

function scoreValue(card: CardIndex, key: RankKey) {
  return Number(card.scores?.[key] ?? card[key] ?? 0);
}

function globalBestCardId() {
  return [...searchCardsIndex("")]
    .sort((a, b) => {
      const byOverall = scoreValue(b, "overall") - scoreValue(a, "overall");
      if (byOverall !== 0) return byOverall;
      return (a.player_name ?? "").localeCompare(b.player_name ?? "");
    })[0]?.id ?? null;
}

function seasonBestCardIds(goatCardId: string | null) {
  const bestBySeason = new Map<string, CardIndex>();

  for (const card of searchCardsIndex("")) {
    const seasonKey = card.season_text ?? String(card.season_end ?? "");
    if (!seasonKey) continue;

    const current = bestBySeason.get(seasonKey);
    if (!current || compareBestCard(card, current) < 0) {
      bestBySeason.set(seasonKey, card);
    }
  }

  return new Set(
    [...bestBySeason.values()]
      .filter((card) => card.id !== goatCardId)
      .map((card) => card.id),
  );
}

function compareBestCard(a: CardIndex, b: CardIndex) {
  const byOverall = scoreValue(b, "overall") - scoreValue(a, "overall");
  if (byOverall !== 0) return byOverall;

  const bySeasonEnd = Number(b.season_end ?? 0) - Number(a.season_end ?? 0);
  if (bySeasonEnd !== 0) return bySeasonEnd;

  return (a.player_name ?? "").localeCompare(b.player_name ?? "");
}

function HighlightStrip({
  highlights,
  season,
  onOpen,
}: {
  highlights: Array<{ title: string; stat: string; key: RankKey; card: CardIndex | null }>;
  season: string;
  onOpen: (card: CardIndex) => void;
}) {
  return (
    <section className="rounded-xl border border-sky-300/15 bg-[#070b0f]/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex flex-col gap-1 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <h2 className="pbp-display text-2xl font-black uppercase leading-none tracking-[0.08em] text-[#f1c14b] sm:text-3xl">
            Destacados de la temporada
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {highlights.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => item.card && onOpen(item.card)}
            disabled={!item.card}
            className="rounded-lg border border-sky-300/15 bg-[#081520]/82 p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] hover:border-yellow-300/45 hover:bg-[#0b1c29] disabled:cursor-default disabled:hover:border-sky-300/15 disabled:hover:bg-[#081520]/82"
          >
          <p className="text-sm font-bold uppercase tracking-wide text-yellow-200/75">
            {item.title}
          </p>
          {item.card ? (
            <div className="mt-2 flex items-center gap-2">
              <FaceImage src={item.card.face_url} alt={item.card.player_name} />
              <div className="min-w-0">
                <p className="truncate text-base font-black">{item.card.player_name}</p>
                <p className="text-sm text-white/60">{item.stat}</p>
              </div>
              <div className="ml-auto text-xl font-black text-yellow-300">
                {formatDecimal(scoreValue(item.card, item.key))}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/50">Sin datos para {season}</p>
          )}
          </button>
        ))}
      </div>
    </section>
  );
}

function FaceImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return <div className="h-12 w-12 shrink-0 rounded-full border border-white/10 bg-white/10" />;
  }

  return (
    <PlayerFace
      src={src}
      alt={alt}
      size={48}
      className="h-12 w-12 shrink-0 rounded-full border border-sky-300/20 bg-black object-cover object-top"
    />
  );
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function CardPreview({
  card,
  rank,
  isGoat,
  isSeasonBest,
  onOpen,
}: {
  card: CardIndex;
  rank: number;
  isGoat: boolean;
  isSeasonBest: boolean;
  onOpen: (card: CardIndex) => void;
}) {
  const legacy = isLegacyCard(card);
  const featuredClass = isGoat
    ? "pbp-goat-card-preview border-orange-300/80"
    : isSeasonBest
      ? "pbp-season-card-preview border-fuchsia-300/70"
      : "border-white/10 hover:border-yellow-400/40";

  return (
    <button
      type="button"
      onClick={() => onOpen(card)}
      aria-label={`Ver detalle de ${card.player_name}`}
      className={`min-w-0 rounded-lg border bg-[#08121b]/75 p-1 hover:bg-[#0b1b27]/85 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 sm:p-2 ${featuredClass}`}
    >
      <div className="mb-1 flex min-h-5 items-center justify-between gap-1 text-[10px] font-bold sm:mb-2 sm:min-h-6 sm:gap-2 sm:text-base">
        <div className="flex min-w-0 items-center gap-1">
          <span className="rounded-full border border-yellow-300/35 bg-yellow-300/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-yellow-100 sm:px-2 sm:text-sm">
            {rank}
          </span>
          {isGoat && (
            <span className="pbp-goat-badge rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide sm:px-2 sm:text-xs">
              GOAT
            </span>
          )}
          {!isGoat && isSeasonBest && (
            <span
              className="pbp-season-badge inline-flex items-center rounded-full px-1.5 py-0.5 sm:px-2"
              aria-label="Mejor carta de la temporada"
              title="Mejor carta de la temporada"
            >
              <GoldenBallIcon />
            </span>
          )}
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2 text-right text-yellow-200/80">
          <span className="truncate">{card.season_text ?? "-"}</span>
          {legacy && (
            <span className="hidden shrink-0 rounded-full border border-yellow-400/20 bg-sky-300/10 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-sky-100 sm:inline">
              Datos antiguos
            </span>
          )}
        </div>
      </div>

      {card.image_url ? (
        <div
          className={`mx-auto aspect-[2/3] w-[96%] overflow-hidden rounded-md bg-black/30 ${
            isGoat ? "pbp-goat-inner-breathe" : isSeasonBest ? "pbp-season-inner-breathe" : ""
          }`}
        >
          <CardArt
            src={card.image_url}
            alt={card.player_name}
            sizes="(min-width: 1536px) 15vw, (min-width: 1024px) 24vw, (min-width: 768px) 24vw, 31vw"
            className="h-full w-full rounded-md object-cover"
          />
        </div>
      ) : (
        <div className="mx-auto flex aspect-[2/3] w-[96%] items-center justify-center rounded-md bg-white/10 text-white/50">
          Sin imagen
        </div>
      )}
    </button>
  );
}

function GoldenBallIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
      fill="none"
    >
      <path
        d="M12 3.4c3.2 0 5.8 2.35 5.8 5.25 0 2.55-2 4.68-4.68 5.15v2.08h2.65c.84 0 1.52.68 1.52 1.52v.9H6.72v-.9c0-.84.68-1.52 1.52-1.52h2.64V13.8C8.2 13.33 6.2 11.2 6.2 8.65 6.2 5.75 8.8 3.4 12 3.4Z"
        fill="url(#goldenBallGradient)"
        stroke="#fff0a6"
        strokeWidth="1.1"
      />
      <path
        d="M8.35 8.6c1.8.42 4.4.42 7.3 0M9.15 5.92c1.58 1.65 3.14 4.12 3.9 7.25M14.86 5.92c-1.58 1.65-3.14 4.12-3.9 7.25"
        stroke="#6d3b00"
        strokeLinecap="round"
        strokeWidth="0.85"
        opacity="0.62"
      />
      <path
        d="M9.2 5.65c.82-.54 1.8-.85 2.8-.85"
        stroke="#fff8bf"
        strokeLinecap="round"
        strokeWidth="1.2"
        opacity="0.8"
      />
      <defs>
        <linearGradient id="goldenBallGradient" x1="7" x2="17.5" y1="4" y2="17.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7a8" />
          <stop offset="0.45" stopColor="#f5b81d" />
          <stop offset="1" stopColor="#9a5600" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="pbp-surface mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 px-4 py-4 sm:flex-row">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="pbp-control rounded-lg border border-yellow-400/20 px-4 py-2 font-bold text-white transition hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <p className="text-base font-semibold text-white/70">
        Página {page} de {totalPages} · {totalItems} cartas
      </p>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="pbp-control rounded-lg border border-yellow-400/20 px-4 py-2 font-bold text-white transition hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}

function scrollToResults() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  });
}

function SegmentedSwitch({
  value,
  onChange,
}: {
  value: "all" | "prime";
  onChange: (value: "all" | "prime") => void;
}) {
  return (
    <div className="pbp-control grid grid-cols-2 rounded-lg border border-yellow-400/20 p-1">
      <button
        type="button"
        onClick={() => onChange("prime")}
        className={`rounded-md px-2 py-1.5 text-base font-bold transition ${
          value === "prime" ? "bg-yellow-400 text-black" : "text-white/70 hover:bg-white/10"
        }`}
      >
        Solo prime
      </button>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-md px-2 py-1.5 text-base font-bold transition ${
          value === "all" ? "bg-sky-300/20 text-white" : "text-white/70 hover:bg-white/10"
        }`}
      >
        Todas
      </button>
    </div>
  );
}

function CardDetail({ card, onClose }: { card: CardIndex; onClose: () => void }) {
  const { card: detailCard, loading } = useCardDetail(card.id);
  const displayCard = detailCard ?? card;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-white/10 bg-[#080808] p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-base text-yellow-300">Detalle de carta</p>
            <h2 className="text-2xl font-black">{displayCard.player_name}</h2>
            <p className="text-base text-white/60">
              {displayCard.season_text ?? "-"}
              {displayCard.club ? ` - ${displayCard.club}` : ""}
              {displayCard.country ? ` - ${displayCard.country}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href={`/cards/${displayCard.id}`}
              className="rounded-lg border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-base font-bold text-white hover:bg-sky-300/20"
            >
              Página de carta
            </Link>
            <Link
              href={`/vs?left=${encodeURIComponent(displayCard.id)}`}
              className="rounded-lg border border-yellow-400/30 bg-yellow-400 px-3 py-2 text-base font-bold text-black hover:bg-yellow-300"
            >
              Comparar en VS
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="pbp-control rounded-lg border border-white/10 px-3 py-2 text-base hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>

        {loading && (
          <div className="pbp-surface-soft mb-3 rounded-lg border border-white/10 px-3 py-2 text-base text-white/60">
            Cargando estadísticas...
          </div>
        )}

        <CardDetailContent card={displayCard} />
      </div>
    </div>
  );
}

