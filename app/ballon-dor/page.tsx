"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CardArt } from "@/app/components/OptimizedImages";
import { formatStat } from "@/app/components/StatBlocks";
import { Card, CardIndex, RankKey } from "@/lib/cardTypes";
import { LABELS } from "@/lib/cardIndex";
import { ballonDorEntries, cardById } from "@/lib/ballonDor";
import { useCardDetail } from "@/lib/useCardDetail";
import { setQueryParam } from "@/lib/urlState";

type ViewMode = "duel" | "ballon" | "pbp";
type CompareMode = "stats" | "scores";
type CompareRow = {
  key: string;
  label: string;
  left: number | null | undefined;
  right: number | null | undefined;
  suffix?: string;
};

const SCORE_KEYS: RankKey[] = ["gol", "asist", "regate", "pase", "def"];

const viewLabels: Record<ViewMode, string> = {
  ballon: "Balón de Oro",
  duel: "VS",
  pbp: "Balón de Oro PB",
};

const compareLabels: Record<CompareMode, string> = {
  stats: "Stats",
  scores: "Puntuaciones",
};
const validViews = new Set<ViewMode>(["duel", "ballon", "pbp"]);
const validCompareModes = new Set<CompareMode>(["stats", "scores"]);
const validSeasons = new Set(ballonDorEntries.map((entry) => String(entry.seasonEnd)));
const DEFAULT_VIEW: ViewMode = "duel";
const DEFAULT_COMPARE: CompareMode = "stats";
const DEFAULT_SEASON = String(ballonDorEntries[0]?.seasonEnd ?? 2025);

export default function BallonDorPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black px-3 py-5 text-white sm:px-6" />}>
      <BallonDorContent />
    </Suspense>
  );
}

function BallonDorContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") as ViewMode | null;
  const compareParam = searchParams.get("compare") as CompareMode | null;
  const seasonParam = searchParams.get("season");
  const [viewMode, setViewMode] = useState<ViewMode>(
    viewParam && validViews.has(viewParam) ? viewParam : DEFAULT_VIEW
  );
  const [compareMode, setCompareMode] = useState<CompareMode>(
    compareParam && validCompareModes.has(compareParam) ? compareParam : DEFAULT_COMPARE
  );
  const [seasonEnd, setSeasonEnd] = useState(
    seasonParam && validSeasons.has(seasonParam) ? seasonParam : DEFAULT_SEASON
  );

  const selectedEntry = useMemo(
    () => ballonDorEntries.find((entry) => String(entry.seasonEnd) === seasonEnd) ?? ballonDorEntries[0],
    [seasonEnd]
  );

  const visibleEntries = viewMode === "duel" && selectedEntry ? [selectedEntry] : ballonDorEntries;
  const currentQuery = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(currentQuery);
    setQueryParam(params, "view", viewMode, DEFAULT_VIEW);
    setQueryParam(params, "compare", compareMode, DEFAULT_COMPARE);
    setQueryParam(params, "season", seasonEnd, DEFAULT_SEASON);

    const nextQuery = params.toString();
    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [compareMode, currentQuery, pathname, router, seasonEnd, viewMode]);

  return (
    <main className="min-h-screen bg-black px-3 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-[108rem] space-y-5">
        <section className="pbp-surface rounded-xl border border-white/10 px-4 py-5 sm:px-6">
          <p className="text-base font-black uppercase tracking-[0.14em] text-[#f1c14b]">
            Comparativa ofensiva
          </p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-[0.08em] sm:text-5xl">
            Balón de Oro vs Player Breakdown
          </h1>
          <p className="mt-2 max-w-4xl text-lg text-white/65">
            Compara al mejor según el Balón de Oro con el mejor según nuestro cálculo.
          </p>
        </section>

        <FilterPanel
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          seasonEnd={seasonEnd}
          onSeasonChange={setSeasonEnd}
          selectedEntry={selectedEntry}
        />

        {viewMode === "duel" && selectedEntry ? (
          <BallonDuel
            entry={selectedEntry}
            compareMode={compareMode}
            onCompareModeChange={setCompareMode}
          />
        ) : (
          <EntryGrid
            entries={visibleEntries}
            source={viewMode}
            onOpenDuel={(entrySeasonEnd) => {
              setSeasonEnd(String(entrySeasonEnd));
              setViewMode("duel");
              window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
            }}
          />
        )}
      </div>
    </main>
  );
}

function FilterPanel({
  viewMode,
  onViewModeChange,
  seasonEnd,
  onSeasonChange,
  selectedEntry,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  seasonEnd: string;
  onSeasonChange: (seasonEnd: string) => void;
  selectedEntry: typeof ballonDorEntries[number] | undefined;
}) {
  return (
    <div className="pbp-surface rounded-xl border border-white/10 p-4">
      <div className="grid grid-cols-1 gap-3">
        <label>
          <div className="pbp-control grid grid-cols-1 rounded-lg border border-yellow-400/20 p-1 sm:grid-cols-3">
            {(Object.keys(viewLabels) as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={`rounded-md px-3 py-2 text-base font-black ${
                  viewMode === mode ? "bg-yellow-400 text-black" : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                {viewLabels[mode]}
              </button>
            ))}
          </div>
        </label>

        {viewMode === "duel" && (
          <label className="mx-auto w-full max-w-md text-center">
            <span className="mb-2 block text-xl font-black uppercase tracking-[0.12em] text-[#f1c14b]">
              Temporada
            </span>
            <select
              value={seasonEnd}
              onChange={(event) => onSeasonChange(event.target.value)}
              className="pbp-control w-full rounded-xl border border-yellow-400/30 px-4 py-3 text-center text-xl font-black text-white outline-none focus:border-yellow-400/70"
            >
              {ballonDorEntries.map((entry) => (
                <option key={entry.seasonEnd} value={entry.seasonEnd} className="bg-black text-white">
                  {entry.seasonText}
                </option>
              ))}
            </select>
          </label>
        )}

        {viewMode === "duel" && selectedEntry && (
          <article className="pbp-surface-soft mx-auto max-w-5xl rounded-xl border border-white/10 p-4 text-center">
            <p className="text-lg font-black uppercase tracking-wide text-[#f1c14b]">
              Analisis
            </p>
            <p className="mt-2 text-base leading-relaxed text-white/72 sm:text-lg">
              {selectedEntry.analysis}
            </p>
          </article>
        )}
      </div>
    </div>
  );
}

function BallonDuel({
  entry,
  compareMode,
  onCompareModeChange,
}: {
  entry: typeof ballonDorEntries[number];
  compareMode: CompareMode;
  onCompareModeChange: (mode: CompareMode) => void;
}) {
  const ballonIndexCard = cardById(entry.ballonDorCardId);
  const pbpIndexCard = cardById(entry.pbpCardId);
  const { card: ballonDetail, loading: ballonLoading } = useCardDetail(ballonIndexCard?.id);
  const { card: pbpDetail, loading: pbpLoading } = useCardDetail(pbpIndexCard?.id);
  const leftCard = ballonDetail ?? ballonIndexCard;
  const rightCard = pbpDetail ?? pbpIndexCard;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 xl:grid-cols-[minmax(240px,1fr)_minmax(340px,460px)_minmax(240px,1fr)] xl:items-start xl:gap-4">
        <ReadOnlySide title="MVP Balón de Oro real (ofensivo)" card={leftCard} emptyLabel="Por anunciarse" />
        <DiffPanel
          left={ballonDetail}
          right={pbpDetail}
          mode={compareMode}
          onModeChange={onCompareModeChange}
          loading={ballonLoading || pbpLoading}
        />
        <ReadOnlySide title="MVP Player Breakdown (ofensivo)" card={rightCard} />
      </div>
    </section>
  );
}

function ReadOnlySide({
  title,
  card,
  emptyLabel = "Pendiente",
}: {
  title: string;
  card: CardIndex | Card | null;
  emptyLabel?: string;
}) {
  return (
    <section className="pbp-vs-side mx-auto flex w-full min-w-0 flex-col gap-2 xl:gap-3">
      <div className="pbp-control rounded-lg border border-yellow-400/20 px-3 py-2">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-200/75 sm:text-base">
          {title}
        </p>
        <p className="truncate text-lg font-black text-white">{card?.player_name ?? emptyLabel}</p>
      </div>
      {card ? <CardOnlyPreview card={card} /> : <EmptyCard label={emptyLabel} />}
    </section>
  );
}

function EntryGrid({
  entries,
  source,
  onOpenDuel,
}: {
  entries: typeof ballonDorEntries;
  source: ViewMode;
  onOpenDuel: (seasonEnd: number) => void;
}) {
  return (
    <section className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-4 2xl:grid-cols-6">
      {entries.map((entry) => {
        const card = source === "ballon" ? cardById(entry.ballonDorCardId) : cardById(entry.pbpCardId);

        return (
          <article key={`${source}-${entry.seasonEnd}`} className="pbp-surface rounded-xl border border-white/10 p-2 sm:p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-xl font-black uppercase tracking-wide text-[#f1c14b] sm:text-2xl">
                {entry.seasonText}
              </h2>
              <button
                type="button"
                onClick={() => onOpenDuel(entry.seasonEnd)}
                className="rounded-lg border border-yellow-400/25 px-2 py-1 text-sm font-bold text-yellow-200 hover:bg-yellow-400/10 sm:px-3 sm:py-2 sm:text-base"
              >
                Ver VS
              </button>
            </div>
            {card ? <CardOnlyPreview card={card} compact /> : <EmptyCard label="Por anunciarse" />}
          </article>
        );
      })}
    </section>
  );
}

function CardOnlyPreview({ card, compact = false }: { card: CardIndex | Card; compact?: boolean }) {
  return (
    <article className="pbp-surface rounded-xl border border-white/10 p-2 sm:p-3">
      {card.image_url ? (
        <CardArt
          src={card.image_url}
          alt={`Carta de ${card.player_name}`}
          sizes={compact ? "(min-width: 1536px) 14vw, (min-width: 1024px) 22vw, 30vw" : "(min-width: 1280px) 26vw, 47vw"}
          className="mx-auto w-full max-w-[24rem] rounded-lg"
        />
      ) : (
        <EmptyCard />
      )}
    </article>
  );
}

function EmptyCard({ label = "Carta pendiente" }: { label?: string }) {
  return (
    <div className="pbp-surface-soft flex aspect-[2/3] items-center justify-center rounded-lg border border-dashed border-white/15 p-6 text-center text-white/45">
      {label}
    </div>
  );
}

function CompareModeSwitch({
  mode,
  onChange,
}: {
  mode: CompareMode;
  onChange: (mode: CompareMode) => void;
}) {
  return (
    <div className="pbp-surface mx-auto grid w-full max-w-sm grid-cols-2 rounded-xl border border-white/10 p-1 text-sm sm:p-1.5 sm:text-base">
      {(Object.keys(compareLabels) as CompareMode[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-lg px-3 py-2 font-black sm:px-5 sm:py-3 ${
            mode === item ? "bg-yellow-400 text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {compareLabels[item]}
        </button>
      ))}
    </div>
  );
}

function DiffPanel({
  left,
  right,
  mode,
  onModeChange,
  loading,
}: {
  left: Card | null;
  right: Card | null;
  mode: CompareMode;
  onModeChange: (mode: CompareMode) => void;
  loading: boolean;
}) {
  const rows = left && right
    ? mode === "stats"
      ? statsCompareRows(left, right)
      : scoreCompareRows(left, right)
    : [];
  const title = mode === "stats" ? "Diferencia en stats reales" : "Diferencia en puntuaciones";

  return (
    <section className="pbp-surface order-3 col-span-2 min-w-0 rounded-lg border border-white/10 p-3 xl:order-none xl:col-span-1 xl:sticky xl:top-24 xl:p-4">
      <div className="mb-4">
        <CompareModeSwitch mode={mode} onChange={onModeChange} />
      </div>

      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center sm:mb-4 sm:gap-3">
        <PlayerCompareName card={left} fallback="Balón de Oro" />
        <div className="pbp-control rounded-md border border-white/10 px-3 py-1 text-sm text-white/70 sm:px-4 sm:text-base">
          VS
        </div>
        <PlayerCompareName card={right} fallback="Player Breakdown" />
      </div>

      <p className="mb-3 text-center text-sm text-white/55 sm:text-base">{title}</p>

      {loading ? (
        <div className="pbp-surface-soft rounded-lg border border-dashed border-white/15 p-4 text-center text-sm text-white/45 sm:p-6 sm:text-base">
          Cargando detalles para comparar...
        </div>
      ) : rows.length > 0 ? (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <DiffRow key={row.key} row={row} />
          ))}
        </div>
      ) : (
        <div className="pbp-surface-soft rounded-lg border border-dashed border-white/15 p-4 text-center text-sm text-white/45 sm:p-6 sm:text-base">
          Faltan cartas para esta comparativa.
        </div>
      )}
    </section>
  );
}

function PlayerCompareName({ card, fallback }: { card: Card | null; fallback: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold sm:text-base">{card?.player_name ?? fallback}</div>
      {card && (
        <>
          <div className="mt-1 text-xl font-black text-yellow-300 sm:text-2xl">{formatStat(card.scores?.overall ?? card.overall)}</div>
          <div className="text-xs text-white/55 sm:text-base">{formatStat(card.stats?.minutes)} minutos</div>
        </>
      )}
    </div>
  );
}

function DiffRow({ row }: { row: CompareRow }) {
  const leftValue = Number(row.left ?? 0);
  const rightValue = Number(row.right ?? 0);
  const leftDiff = leftValue - rightValue;
  const rightDiff = rightValue - leftValue;

  return (
    <div className="pbp-surface-soft grid grid-cols-[62px_1fr_62px] items-center gap-2 rounded-md border border-white/10 px-2 py-2 sm:grid-cols-[86px_1fr_86px] sm:gap-3 sm:px-3 sm:py-3">
      <DiffBadge diff={leftDiff} suffix={row.suffix} />
      <div className="text-center">
        <div className="text-xs uppercase text-white/50 sm:text-base">{row.label}</div>
        <div className="text-sm font-bold sm:text-base">
          {formatStat(row.left, row.suffix)} <span className="text-white/35">vs</span>{" "}
          {formatStat(row.right, row.suffix)}
        </div>
      </div>
      <DiffBadge diff={rightDiff} suffix={row.suffix} />
    </div>
  );
}

function DiffBadge({ diff, suffix = "" }: { diff: number; suffix?: string }) {
  const rounded = Math.round(diff * 100) / 100;
  const isPositive = rounded > 0;
  const isNegative = rounded < 0;
  const sign = isPositive ? "+" : "";
  const marker = isPositive ? "+" : isNegative ? "-" : "=";
  const color = isPositive ? "text-emerald-300" : isNegative ? "text-red-300" : "text-white/50";

  return (
    <div className={`text-center text-sm font-black sm:text-base ${color}`}>
      <div className="leading-none">{marker}</div>
      <div>
        {sign}
        {formatStat(rounded, suffix)}
      </div>
    </div>
  );
}

function scoreCompareRows(left: Card, right: Card): CompareRow[] {
  return SCORE_KEYS.map((key) => ({
    key,
    label: LABELS[key],
    left: left[key],
    right: right[key],
  }));
}

function statsCompareRows(left: Card, right: Card): CompareRow[] {
  return [
    { key: "goals", label: "Goles", left: left.stats?.goals, right: right.stats?.goals },
    { key: "goals_per_90", label: "Goles por 90 minutos", left: left.stats?.goals_per_90, right: right.stats?.goals_per_90 },
    { key: "assists", label: "Asistencias", left: left.stats?.assists, right: right.stats?.assists },
    { key: "key_passes", label: "Pases clave", left: left.stats?.key_passes, right: right.stats?.key_passes },
    { key: "key_passes_per_90", label: "Pases clave por 90 minutos", left: left.stats?.key_passes_per_90, right: right.stats?.key_passes_per_90 },
    { key: "successful_dribbles", label: "Regates exitosos", left: left.stats?.successful_dribbles, right: right.stats?.successful_dribbles },
    { key: "successful_dribbles_per_90", label: "Regates exitosos por 90 minutos", left: left.stats?.successful_dribbles_per_90, right: right.stats?.successful_dribbles_per_90 },
    { key: "total_passes", label: "Pases totales", left: left.stats?.total_passes, right: right.stats?.total_passes },
    { key: "total_passes_per_90", label: "Pases totales por 90 minutos", left: left.stats?.total_passes_per_90, right: right.stats?.total_passes_per_90 },
    { key: "pass_accuracy", label: "Acierto en pase", left: left.stats?.pass_accuracy, right: right.stats?.pass_accuracy, suffix: "%" },
    { key: "tackles", label: "Entradas", left: left.stats?.tackles, right: right.stats?.tackles },
    { key: "tackles_per_90", label: "Entradas por 90 minutos", left: left.stats?.tackles_per_90, right: right.stats?.tackles_per_90 },
    { key: "interceptions", label: "Intercepciones", left: left.stats?.interceptions, right: right.stats?.interceptions },
    { key: "interceptions_per_90", label: "Intercepciones por 90 minutos", left: left.stats?.interceptions_per_90, right: right.stats?.interceptions_per_90 },
  ];
}
