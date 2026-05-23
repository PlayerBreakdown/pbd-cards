"use client";

import { useMemo, useState } from "react";
import { Card, LABELS, optionsFor, searchCards, sortCards } from "@/lib/staticCards";

type SortKey =
  | "season_end_desc"
  | "overall_desc"
  | "gol_desc"
  | "asist_desc"
  | "regate_desc"
  | "pase_desc"
  | "def_desc"
  | "player_name_asc";

export default function Home() {
  const [search, setSearch] = useState("");
  const [series, setSeries] = useState("all");
  const [season, setSeason] = useState("all");
  const [country, setCountry] = useState("all");
  const [club, setClub] = useState("all");
  const [sort, setSort] = useState<SortKey>("season_end_desc");

  const seriesOptions = useMemo(() => optionsFor("series"), []);
  const seasonOptions = useMemo(() => optionsFor("season_text"), []);
  const countryOptions = useMemo(() => optionsFor("country"), []);
  const clubOptions = useMemo(() => optionsFor("club"), []);

  const cards = useMemo(() => {
    const filtered = searchCards(search).filter((card) => {
      if (series !== "all" && card.series !== series) return false;
      if (season !== "all" && card.season_text !== season) return false;
      if (country !== "all" && card.country !== country) return false;
      if (club !== "all" && card.club !== club) return false;
      return true;
    });

    return sortCards(filtered, sort).slice(0, 50);
  }, [search, series, season, country, club, sort]);

  const canClear =
    search.trim().length > 0 ||
    series !== "all" ||
    season !== "all" ||
    country !== "all" ||
    club !== "all" ||
    sort !== "season_end_desc";

  const clearAll = () => {
    setSearch("");
    setSeries("all");
    setSeason("all");
    setCountry("all");
    setClub("all");
    setSort("season_end_desc");
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">PBP Cards</h1>
          <p className="text-white/60 text-sm">
            Filtra por temporada/pais/club y ordena por atributo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar jugador... (ej: Messi)"
            className="sm:col-span-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30 text-white placeholder:text-white/40"
          />

          <Select value={season} onChange={setSeason} options={seasonOptions} allLabel="Todas las temporadas" />
          <Select value={country} onChange={setCountry} options={countryOptions} allLabel="Todos los paises" />
          <Select value={club} onChange={setClub} options={clubOptions} allLabel="Todos los clubes" />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            <option value="season_end_desc" className="bg-black text-white">Temporada (mas nueva)</option>
            <option value="overall_desc" className="bg-black text-white">Mejor calificado (mayor)</option>
            <option value="gol_desc" className="bg-black text-white">{LABELS.gol} (mayor)</option>
            <option value="asist_desc" className="bg-black text-white">{LABELS.asist} (mayor)</option>
            <option value="regate_desc" className="bg-black text-white">{LABELS.regate} (mayor)</option>
            <option value="pase_desc" className="bg-black text-white">{LABELS.pase} (mayor)</option>
            <option value="def_desc" className="bg-black text-white">{LABELS.def} (mayor)</option>
            <option value="player_name_asc" className="bg-black text-white">Nombre (A-Z)</option>
          </select>

          <button
            type="button"
            onClick={clearAll}
            disabled={!canClear}
            className="w-full rounded-lg border border-white/10 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5"
          >
            Limpiar
          </button>

          <select
            value={series}
            onChange={(event) => setSeries(event.target.value)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
        {cards.map((card) => (
          <CardPreview key={card.id} card={card} />
        ))}
      </div>
    </main>
  );
}

function Select({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-black text-white">
          {option === "all" ? allLabel : option}
        </option>
      ))}
    </select>
  );
}

function CardPreview({ card }: { card: Card }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold">{card.player_name}</p>
          <p className="text-xs text-white/60">
            {card.season_text ?? "-"}
            {card.club ? ` • ${card.club}` : ""}
            {card.country ? ` • ${card.country}` : ""}
          </p>
        </div>
        <div className="text-2xl font-black">{card.overall}</div>
      </div>

      {card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image_url}
          alt={card.player_name}
          className="w-full rounded-md border border-white/10"
        />
      ) : (
        <div className="w-full h-40 rounded-lg bg-white/10 flex items-center justify-center text-white/50">
          Sin imagen
        </div>
      )}
    </div>
  );
}
