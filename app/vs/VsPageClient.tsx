"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CardArt } from "@/app/components/OptimizedImages";
import { formatStat } from "@/app/components/StatBlocks";
import { Card, CardIndex } from "@/lib/cardTypes";
import { LABELS, RankKey, cardsIndex, normalizeSearch, sortCards } from "@/lib/cardIndex";
import { useCardDetail } from "@/lib/useCardDetail";
import { useSessionState } from "@/lib/useSessionState";

type ViewMode = "scores" | "stats";
type CompareRow = {
  key: string;
  label: string;
  left: number | null | undefined;
  right: number | null | undefined;
  suffix?: string;
};

const SCORE_KEYS: RankKey[] = ["gol", "asist", "regate", "pase", "def"];
const DEFAULT_LEFT_ID = "michaelolise_pvpv1_2026";
const DEFAULT_RIGHT_ID = "lamineyamal_pvpv1_2026";
const CARD_IDS = new Set(cardsIndex.map((card) => card.id));

const modeLabels: Record<ViewMode, string> = {
  stats: "Stats",
  scores: "Puntuaciones",
};

function cardLabel(card: CardIndex) {
  return `${card.player_name} ${card.season_text ?? ""} ${card.club ?? ""}`.trim();
}

function validCardId(cardId: string | null) {
  return Boolean(cardId && CARD_IDS.has(cardId));
}

function validMode(mode: string | null): mode is ViewMode {
  return mode === "stats" || mode === "scores";
}

export default function VsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black p-6 text-white" />}>
      <VsContent />
    </Suspense>
  );
}

function VsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const leftParam = searchParams.get("left");
  const rightParam = searchParams.get("right");
  const modeParam = searchParams.get("view");
  const initialLeftId = validCardId(leftParam) && leftParam ? leftParam : DEFAULT_LEFT_ID;
  const initialRightId = validCardId(rightParam) && rightParam ? rightParam : DEFAULT_RIGHT_ID;
  const initialMode: ViewMode = validMode(modeParam) ? modeParam : "stats";
  const [leftId, setLeftId] = useSessionState("pbp-vs-left", initialLeftId, { load: !leftParam });
  const [rightId, setRightId] = useSessionState("pbp-vs-right", initialRightId, { load: !rightParam });
  const [mode, setMode] = useSessionState<ViewMode>("pbp-vs-mode-v2", initialMode, { load: !modeParam });

  const sortedCards = useMemo(() => sortCards(cardsIndex, "overall_desc"), []);
  const selectOptions = useMemo(
    () => [...cardsIndex].sort((a, b) => cardLabel(a).localeCompare(cardLabel(b))),
    []
  );
  const leftIndexCard = sortedCards.find((card) => card.id === leftId) ?? null;
  const rightIndexCard = sortedCards.find((card) => card.id === rightId) ?? null;
  const { card: leftDetailCard, loading: leftLoading } = useCardDetail(leftIndexCard?.id);
  const { card: rightDetailCard, loading: rightLoading } = useCardDetail(rightIndexCard?.id);
  const leftCard = leftDetailCard ?? leftIndexCard;
  const rightCard = rightDetailCard ?? rightIndexCard;
  const leftCompareCard = leftDetailCard;
  const rightCompareCard = rightDetailCard;
  const currentQuery = searchParams.toString();

  useEffect(() => {
    if (!leftIndexCard || !rightIndexCard) return;

    const params = new URLSearchParams(currentQuery);
    const isDefaultView =
      leftId === DEFAULT_LEFT_ID && rightId === DEFAULT_RIGHT_ID && mode === "stats";

    if (isDefaultView) {
      params.delete("left");
      params.delete("right");
      params.delete("view");
    } else {
      params.set("left", leftId);
      params.set("right", rightId);
      params.set("view", mode);
    }

    const nextQuery = params.toString();
    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [currentQuery, leftId, leftIndexCard, mode, pathname, rightId, rightIndexCard, router]);

  return (
    <main className="min-h-screen bg-black p-3 text-white sm:p-6">
      {sortedCards.length < 2 ? (
        <p className="text-white/60">Necesitas al menos dos cartas para comparar.</p>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 xl:grid-cols-[minmax(240px,1fr)_minmax(340px,460px)_minmax(240px,1fr)] xl:items-start xl:gap-4">
          <CompareSide
            side="left"
            selectedId={leftIndexCard?.id ?? ""}
            onChange={setLeftId}
            options={selectOptions}
            card={leftCard}
          />

          <DiffPanel left={leftCompareCard} right={rightCompareCard} mode={mode} onModeChange={setMode} loading={leftLoading || rightLoading} />

          <CompareSide
            side="right"
            selectedId={rightIndexCard?.id ?? ""}
            onChange={setRightId}
            options={selectOptions}
            card={rightCard}
          />
        </div>
      )}
    </main>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="pbp-surface mx-auto grid w-full max-w-sm grid-cols-2 rounded-xl border border-white/10 p-1 text-sm sm:p-1.5 sm:text-base">
      {(Object.keys(modeLabels) as ViewMode[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-lg px-3 py-2 font-black transition sm:px-5 sm:py-3 ${
            mode === item
              ? "bg-yellow-400 text-black"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {modeLabels[item]}
        </button>
      ))}
    </div>
  );
}

function CompareSide({
  side,
  selectedId,
  onChange,
  options,
  card,
}: {
  side: "left" | "right";
  selectedId: string;
  onChange: (id: string) => void;
  options: CardIndex[];
  card: CardIndex | Card | null;
}) {
  const mobileOrder = side === "left" ? "order-1" : "order-2";

  return (
    <section className={`${mobileOrder} pbp-vs-side mx-auto flex w-full min-w-0 flex-col gap-2 xl:order-none xl:gap-3`}>
      <SearchableCardSelect
        side={side}
        selectedId={selectedId}
        onChange={onChange}
        options={options}
      />

      {card ? (
        <CardOnlyPreview card={card} />
      ) : (
        <EmptySide />
      )}
    </section>
  );
}

function SearchableCardSelect({
  side,
  selectedId,
  onChange,
  options,
}: {
  side: "left" | "right";
  selectedId: string;
  onChange: (id: string) => void;
  options: CardIndex[];
}) {
  const selected = options.find((option) => option.id === selectedId);
  const [query, setQuery] = useState(selected ? cardLabel(selected) : "");
  const [open, setOpen] = useState(false);
  const inputValue = open ? query : selected ? cardLabel(selected) : "";

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return options.slice(0, 15);

    return options
      .filter((option) =>
        normalizeSearch(`${cardLabel(option)} ${option.club ?? ""} ${option.country ?? ""}`).includes(needle)
      )
      .slice(0, 15);
  }, [options, query]);

  return (
    <div className="relative min-w-0">
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-yellow-200/75 sm:text-base">
        Jugador
      </label>
      <input
        value={inputValue}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
          }, 120);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        aria-label={side === "left" ? "Jugador izquierdo" : "Jugador derecho"}
        placeholder="Buscar jugador..."
        className="pbp-control w-full min-w-0 rounded-lg border border-yellow-400/20 px-2 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-yellow-400/60 sm:px-3 sm:text-base"
      />

      {open && (
        <div className="absolute left-0 right-0 top-14 z-20 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-black shadow-xl sm:top-16">
          {filtered.map((option) => (
            <button
              key={option.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.id);
                setQuery(cardLabel(option));
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 border-b border-white/5 px-2 py-2 text-left text-sm hover:bg-white/10 sm:gap-3 sm:px-3 sm:text-base"
            >
              <span className="min-w-0 truncate">{cardLabel(option)}</span>
              <span className="shrink-0 font-black text-white/80">{option.overall}</span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-white/50 sm:text-base">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptySide() {
  return (
    <div className="pbp-surface-soft flex min-h-80 items-center justify-center rounded-xl border border-dashed border-white/15 p-6 text-center text-white/45">
      Busca y selecciona un jugador para empezar.
    </div>
  );
}

function CardOnlyPreview({ card }: { card: CardIndex | Card }) {
  return (
    <article className="pbp-surface rounded-xl border border-white/10 p-2 sm:p-3">
      {card.image_url ? (
        <CardArt
          src={card.image_url}
          alt={`Carta de ${card.player_name}`}
          sizes="(min-width: 1280px) 26vw, 47vw"
          className="mx-auto w-full max-w-[24rem] rounded-lg"
        />
      ) : (
        <div className="flex aspect-[2/3] items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/50">
          Sin carta
        </div>
      )}
    </article>
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
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  loading: boolean;
}) {
  const rows = left && right
    ? mode === "stats"
      ? statsCompareRows(left, right)
      : scoreCompareRows(left, right)
    : [];
  const hasBothCards = rows.length > 0;
  const title = mode === "stats" ? "Diferencia en stats reales" : "Diferencia en puntuaciones";

  return (
    <section className="pbp-surface order-3 col-span-2 min-w-0 rounded-lg border border-white/10 p-3 xl:order-none xl:col-span-1 xl:sticky xl:top-24 xl:p-4">
      <div className="mb-4">
        <ModeSwitch mode={mode} onChange={onModeChange} />
      </div>

      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center sm:mb-4 sm:gap-3">
        <PlayerCompareName card={left} fallback="Jugador 1" />
        <div className="pbp-control rounded-md border border-white/10 px-3 py-1 text-sm text-white/70 sm:px-4 sm:text-base">
          VS
        </div>
        <PlayerCompareName card={right} fallback="Jugador 2" />
      </div>

      <p className="mb-3 text-center text-sm text-white/55 sm:text-base">{title}</p>

      {loading ? (
        <div className="pbp-surface-soft rounded-lg border border-dashed border-white/15 p-4 text-center text-sm text-white/45 sm:p-6 sm:text-base">
          Cargando detalles para comparar...
        </div>
      ) : hasBothCards ? (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <DiffRow key={row.key} row={row} />
          ))}
        </div>
      ) : (
        <div className="pbp-surface-soft rounded-lg border border-dashed border-white/15 p-4 text-center text-sm text-white/45 sm:p-6 sm:text-base">
          Selecciona dos jugadores para ver la comparación.
        </div>
      )}
    </section>
  );
}

function PlayerCompareName({
  card,
  fallback,
}: {
  card: CardIndex | Card | null;
  fallback: string;
}) {
  return (
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold sm:text-base">{card?.player_name ?? fallback}</div>
      {card && (
        <>
          <div className="mt-1 text-xl font-black text-yellow-300 sm:text-2xl">{card.overall}</div>
          <div className="text-xs text-white/55 sm:text-base">
            {formatStat(card.stats?.minutes)} minutos
          </div>
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
  const rounded = roundForDisplay(diff);
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

function statsCompareRows(left: CardIndex | Card, right: CardIndex | Card): CompareRow[] {
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

function roundForDisplay(value: number) {
  return Math.round(value * 100) / 100;
}

