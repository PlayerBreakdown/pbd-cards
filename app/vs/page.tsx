"use client";

import { useMemo, useState } from "react";
import { Card, LABELS, RankKey, cards, normalizeSearch, sortCards } from "@/lib/staticCards";

const STAT_KEYS: RankKey[] = ["gol", "asist", "regate", "pase", "def"];

function cardLabel(card: Card) {
  return `${card.player_name} ${card.season_text ?? ""} ${card.club ?? ""}`.trim();
}

function findInitialPair() {
  const sorted = sortCards(cards, "overall_desc");
  return {
    left: sorted[0]?.id ?? "",
    right: sorted[1]?.id ?? sorted[0]?.id ?? "",
  };
}

export default function VsPage() {
  const initial = useMemo(() => findInitialPair(), []);
  const [leftId, setLeftId] = useState(initial.left);
  const [rightId, setRightId] = useState(initial.right);

  const sortedCards = useMemo(() => sortCards(cards, "overall_desc"), []);
  const leftCard = sortedCards.find((card) => card.id === leftId) ?? sortedCards[0];
  const rightCard = sortedCards.find((card) => card.id === rightId) ?? sortedCards[1] ?? sortedCards[0];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-3xl font-bold">VS</h1>
        <p className="text-sm text-white/60">Compara dos cartas por puntuacion y atributos.</p>
      </div>

      {sortedCards.length < 2 ? (
        <p className="text-white/60">Necesitas al menos dos cartas para comparar.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,1fr)_minmax(340px,440px)_minmax(240px,1fr)] xl:items-start">
          <CompareSide
            side="left"
            selectedId={leftCard.id}
            onChange={setLeftId}
            options={sortedCards}
            card={leftCard}
          />

          <DiffPanel left={leftCard} right={rightCard} />

          <CompareSide
            side="right"
            selectedId={rightCard.id}
            onChange={setRightId}
            options={sortedCards}
            card={rightCard}
          />
        </div>
      )}
    </main>
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
  options: Card[];
  card: Card;
}) {
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <SearchableCardSelect
        side={side}
        selectedId={selectedId}
        onChange={onChange}
        options={options}
      />

      <CardImage card={card} />
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
  options: Card[];
}) {
  const selected = options.find((option) => option.id === selectedId);
  const [query, setQuery] = useState(selected ? cardLabel(selected) : "");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return options.slice(0, 10);

    return options
      .filter((option) =>
        normalizeSearch(`${cardLabel(option)} ${option.club ?? ""} ${option.country ?? ""}`).includes(needle)
      )
      .slice(0, 10);
  }, [options, query]);

  return (
    <div className="relative">
      <input
        value={query}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            if (selected) setQuery(cardLabel(selected));
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
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-white/40 focus:border-white/30"
      />

      {open && (
        <div className="absolute left-0 right-0 top-11 z-20 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-black shadow-xl">
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
              className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-3 py-2 text-left text-sm hover:bg-white/10"
            >
              <span className="min-w-0 truncate">{cardLabel(option)}</span>
              <span className="shrink-0 font-black text-white/80">{option.overall}</span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-white/50">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}

function CardImage({ card }: { card: Card }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">{card.player_name}</h2>
          <p className="text-xs text-white/60">
            {card.season_text ?? "-"}
            {card.club ? ` - ${card.club}` : ""}
            {card.country ? ` - ${card.country}` : ""}
          </p>
        </div>
        <div className="text-2xl font-black">{card.overall}</div>
      </div>

      {card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image_url}
          alt={card.player_name}
          className="mx-auto w-full max-w-xs rounded-md border border-white/10"
        />
      ) : (
        <div className="mx-auto flex h-72 max-w-xs items-center justify-center rounded-md bg-white/10 text-white/50">
          Sin imagen
        </div>
      )}
    </article>
  );
}

function DiffPanel({ left, right }: { left: Card; right: Card }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4 xl:sticky xl:top-24">
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <div className="min-w-0 truncate text-base font-semibold">{left.player_name}</div>
        <div className="rounded-md border border-white/10 bg-black/40 px-4 py-1 text-sm text-white/70">
          DIF
        </div>
        <div className="min-w-0 truncate text-base font-semibold">{right.player_name}</div>
      </div>

      <div className="flex flex-col gap-2">
        {STAT_KEYS.map((key) => (
          <DiffRow key={key} statKey={key} left={left} right={right} />
        ))}
      </div>
    </section>
  );
}

function DiffRow({ statKey, left, right }: { statKey: RankKey; left: Card; right: Card }) {
  const leftValue = Number(left[statKey] ?? 0);
  const rightValue = Number(right[statKey] ?? 0);
  const leftDiff = leftValue - rightValue;
  const rightDiff = rightValue - leftValue;

  return (
    <div className="grid grid-cols-[86px_1fr_86px] items-center gap-3 rounded-md border border-white/10 bg-black/35 px-3 py-3">
      <DiffBadge diff={leftDiff} />

      <div className="text-center">
        <div className="text-sm uppercase text-white/50">{LABELS[statKey]}</div>
        <div className="text-base font-bold">
          {leftValue} <span className="text-white/35">vs</span> {rightValue}
        </div>
      </div>

      <DiffBadge diff={rightDiff} />
    </div>
  );
}

function DiffBadge({ diff }: { diff: number }) {
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  const sign = isPositive ? "+" : "";
  const marker = isPositive ? "+" : isNegative ? "-" : "=";
  const color = isPositive ? "text-emerald-300" : isNegative ? "text-red-300" : "text-white/50";

  return (
    <div className={`text-center text-base font-black ${color}`}>
      <div className="leading-none">{marker}</div>
      <div>
        {sign}
        {diff}
      </div>
    </div>
  );
}
