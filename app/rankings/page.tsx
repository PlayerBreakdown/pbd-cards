"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CardDetailContent } from "@/app/components/CardDetailContent";
import { FilterField, Select } from "@/app/components/FilterControls";
import { PlayerFace } from "@/app/components/OptimizedImages";
import { CardIndex } from "@/lib/cardTypes";
import { LABELS, RankKey, cardsIndex, latestSeasonIndex, optionsForIndex, primeCards, sortCards } from "@/lib/cardIndex";
import { useSessionState } from "@/lib/useSessionState";
import { useCardDetail } from "@/lib/useCardDetail";
import { useModalHistory } from "@/lib/useModalHistory";
import { setQueryParam, validOption } from "@/lib/urlState";

const DEFAULT_SEASON = latestSeasonIndex();
const validRankKeys = new Set<RankKey>(["overall", "gol", "asist", "regate", "pase", "def"]);
const validViewModes = new Set(["all", "prime"]);
const validLimits = new Set([50, 100]);
const validFilterValues = {
  season: new Set(cardsIndex.map((card) => card.season_text).filter(Boolean)),
  country: new Set(cardsIndex.map((card) => card.country).filter(Boolean)),
  club: new Set(cardsIndex.map((card) => card.club).filter(Boolean)),
};

export default function RankingsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black px-6 py-5 text-white" />}>
      <RankingsContent />
    </Suspense>
  );
}

function RankingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");
  const countryParam = searchParams.get("country");
  const clubParam = searchParams.get("club");
  const rankParam = searchParams.get("rank") as RankKey | null;
  const viewParam = searchParams.get("view") as "all" | "prime" | null;
  const limitParam = Number(searchParams.get("limit"));
  const pageParam = Number(searchParams.get("page"));
  const cardParam = searchParams.get("card");
  const hasUrlFilter = Boolean(seasonParam || countryParam || clubParam || rankParam || viewParam || searchParams.get("limit") || searchParams.get("page") || cardParam);
  const initialSeason =
    seasonParam === "all" || (seasonParam && validOption(seasonParam, validFilterValues.season))
      ? seasonParam
      : DEFAULT_SEASON;
  const initialCountry = countryParam && validOption(countryParam, validFilterValues.country) ? countryParam : "all";
  const initialClub = clubParam && validOption(clubParam, validFilterValues.club) ? clubParam : "all";
  const initialRank = rankParam && validRankKeys.has(rankParam) ? rankParam : "overall";
  const initialView = viewParam && validViewModes.has(viewParam) ? viewParam : "prime";
  const initialLimit = validLimits.has(limitParam) ? (limitParam as 50 | 100) : 50;
  const initialPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [season, setSeason] = useSessionState("pbp-rankings-season", initialSeason, { load: !hasUrlFilter });
  const [country, setCountry] = useSessionState("pbp-rankings-country", initialCountry, { load: !hasUrlFilter });
  const [club, setClub] = useSessionState("pbp-rankings-club", initialClub, { load: !hasUrlFilter });
  const [rankBy, setRankBy] = useSessionState<RankKey>("pbp-rankings-rank", initialRank, { load: !hasUrlFilter });
  const [viewMode, setViewMode] = useSessionState<"all" | "prime">("pbp-rankings-view", initialView, { load: !hasUrlFilter });
  const [limit, setLimit] = useSessionState<50 | 100>("pbp-rankings-limit", initialLimit, { load: !hasUrlFilter });
  const [page, setPage] = useSessionState("pbp-rankings-page", initialPage, { load: !hasUrlFilter });
  const [selected, setSelected] = useState<CardIndex | null>(
    cardParam ? cardsIndex.find((card) => card.id === cardParam) ?? null : null
  );
  const closeSelected = useModalHistory(selected, setSelected, "pbpRankingsModal");

  const seasonOptions = useMemo(() => optionsForIndex("season_text"), []);
  const countryOptions = useMemo(() => optionsForIndex("country"), []);
  const clubOptions = useMemo(() => optionsForIndex("club"), []);

  const allRows = useMemo(() => {
    const filtered = cardsIndex.filter((card) => {
      if (season !== "all" && card.season_text !== season) return false;
      if (country !== "all" && card.country !== country) return false;
      if (club !== "all" && card.club !== club) return false;
      return true;
    });

    const rows = viewMode === "prime" ? primeCards(filtered, rankBy) : filtered;

    return sortCards(rows, `${rankBy}_desc`);
  }, [season, country, club, rankBy, viewMode]);

  const totalPages = Math.max(1, Math.ceil(allRows.length / limit));
  const rows = allRows.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, setPage, totalPages]);

  const currentQuery = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(currentQuery);
    setQueryParam(params, "season", season, DEFAULT_SEASON);
    setQueryParam(params, "country", country, "all");
    setQueryParam(params, "club", club, "all");
    setQueryParam(params, "rank", rankBy, "overall");
    setQueryParam(params, "view", viewMode, "prime");
    setQueryParam(params, "limit", String(limit), "50");
    setQueryParam(params, "page", String(page), "1");
    setQueryParam(params, "card", selected?.id ?? "", "");

    const nextQuery = params.toString();
    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [club, country, currentQuery, limit, page, pathname, rankBy, router, season, selected?.id, viewMode]);

  return (
    <main className="min-h-screen bg-black px-6 py-5 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 space-y-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
            <FilterField label="Vista">
              <SegmentedSwitch value={viewMode} onChange={(value) => { setViewMode(value); setPage(1); }} />
            </FilterField>
            <FilterField label="Temporada">
              <Select value={season} onChange={(value) => { setSeason(value); setPage(1); }} options={seasonOptions} allLabel="Todas las temporadas" />
            </FilterField>
            <FilterField label="Ranking">
              <select
                value={rankBy}
                onChange={(event) => {
                  setRankBy(event.target.value as RankKey);
                  setPage(1);
                }}
                className="pbp-control w-full rounded-lg border border-yellow-400/20 px-3 py-2 text-white outline-none focus:border-yellow-400/60"
              >
                <option value="overall" className="bg-black text-white">Mayor puntuación</option>
                <option value="gol" className="bg-black text-white">{LABELS.gol}</option>
                <option value="asist" className="bg-black text-white">{LABELS.asist}</option>
                <option value="regate" className="bg-black text-white">{LABELS.regate}</option>
                <option value="pase" className="bg-black text-white">{LABELS.pase}</option>
                <option value="def" className="bg-black text-white">{LABELS.def}</option>
              </select>
            </FilterField>
            <FilterField label="Club">
              <Select value={club} onChange={(value) => { setClub(value); setPage(1); }} options={clubOptions} allLabel="Todos los clubes" />
            </FilterField>
            <FilterField label="País">
              <Select value={country} onChange={(value) => { setCountry(value); setPage(1); }} options={countryOptions} allLabel="Todos los países" />
            </FilterField>
            <FilterField label="Cantidad">
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value) as 50 | 100);
                  setPage(1);
                }}
                className="pbp-control w-full rounded-lg border border-yellow-400/20 px-3 py-2 text-white outline-none focus:border-yellow-400/60"
              >
                <option value={50} className="bg-black text-white">Top 50</option>
                <option value={100} className="bg-black text-white">Top 100</option>
              </select>
            </FilterField>
          </div>
        </div>

        {rows.length === 0 && (
          <p className="text-white/60">No hay resultados con esos filtros.</p>
        )}

        {rows.length > 0 && (
          <div className="pbp-surface overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full table-auto text-base">
              <thead className="bg-[#11151a]">
                <tr>
                  <th className="w-24 px-3 py-2 text-left">Top</th>
                  <th className="w-28 px-3 py-2 text-right">Puntuación</th>
                  <th className="px-3 py-2 text-left">Nombre completo</th>
                  <th className="w-28 px-3 py-2 text-left">Temporada</th>
                  <th className="w-36 px-3 py-2 text-left">Club</th>
                  <th className="w-32 px-3 py-2 text-left">Pais</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t border-white/10 hover:bg-white/5"
                    onClick={() => {
                      setSelected(row);
                    }}
                  >
                    <td className="px-3 py-2">
                      <TopCell
                        rank={(page - 1) * limit + index + 1}
                        faceUrl={page === 1 && index < 3 ? row.face_url : null}
                        name={row.player_name}
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-xl font-black">{row[rankBy]}</td>
                    <td className="px-3 py-2 font-semibold">{row.player_name}</td>
                    <td className="px-3 py-2 text-white/80">{row.season_text ?? "-"}</td>
                    <td className="px-3 py-2 text-white/80">{row.club ?? "-"}</td>
                    <td className="px-3 py-2 text-white/80">{row.country ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {allRows.length > limit && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={allRows.length}
            pageSize={limit}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              scrollToResults();
            }}
          />
        )}

        {selected && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={closeSelected}
          >
            <div
              className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-white/10 bg-[#080808] p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FaceImage src={selected.face_url} alt={selected.player_name} size="lg" />
                  <div>
                    <div className="text-lg font-bold">{selected.player_name}</div>
                    <div className="text-base text-white/60">
                      {selected.season_text ?? "-"}
                      {selected.club ? ` - ${selected.club}` : ""}
                      {selected.country ? ` - ${selected.country}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Link
                    href={`/cards/${selected.id}`}
                    className="rounded-lg border border-sky-300/40 bg-sky-300/10 px-3 py-2 text-base font-bold text-white hover:bg-sky-300/20"
                  >
                    Página de carta
                  </Link>
                  <Link
                    href={`/vs?left=${encodeURIComponent(selected.id)}`}
                    className="rounded-lg border border-yellow-400/30 bg-yellow-400 px-3 py-2 text-base font-bold text-black hover:bg-yellow-300"
                  >
                    Comparar en VS
                  </Link>
                  <button
                    className="pbp-control rounded-lg border border-white/10 px-3 py-2 text-base hover:bg-white/10"
                    onClick={closeSelected}
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <RankingDetail card={selected} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="pbp-surface mt-5 flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 px-4 py-4 sm:flex-row">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="pbp-control rounded-lg border border-yellow-400/20 px-4 py-2 font-bold text-white transition hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <p className="text-base font-semibold text-white/70">
        Página {page} de {totalPages} · {totalItems} resultados · {pageSize} por página
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

function RankingDetail({ card }: { card: CardIndex }) {
  const { card: detailCard, loading } = useCardDetail(card.id);

  return (
    <>
      {loading && (
        <div className="pbp-surface-soft mb-3 rounded-lg border border-white/10 px-3 py-2 text-base text-white/60">
          Cargando estadísticas...
        </div>
      )}
      <CardDetailContent card={detailCard ?? card} />
    </>
  );
}

function TopCell({
  rank,
  faceUrl,
  name,
}: {
  rank: number;
  faceUrl: string | null;
  name: string;
}) {
  const color =
    rank === 1
      ? "text-yellow-300"
      : rank === 2
        ? "text-slate-200"
        : rank === 3
          ? "text-amber-600"
          : rank <= 5
            ? "text-sky-200"
            : "text-white/60";

  return (
    <div className="flex items-center gap-2">
      <span className={`min-w-8 font-mono text-2xl font-black ${color}`}>#{rank}</span>
      {faceUrl && <FaceImage src={faceUrl} alt={name} size="sm" />}
    </div>
  );
}

function FaceImage({
  src,
  alt,
  size,
}: {
  src: string | null;
  alt: string;
  size: "sm" | "lg";
}) {
  const dimensions = size === "lg" ? "h-16 w-16" : "h-10 w-10";

  if (!src) {
    return <div className={`${dimensions} shrink-0 rounded-full border border-white/10 bg-white/10`} />;
  }

  return (
    <PlayerFace
      src={src}
      alt={alt}
      size={size === "lg" ? 64 : 40}
      className={`${dimensions} shrink-0 rounded-full border border-sky-300/20 bg-black object-cover object-top`}
    />
  );
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

