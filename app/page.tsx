"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type Card = {
  id: string;
  card_id: string;
  player_name: string;
  season_text: string | null;
  season_end: number | null;
  series: string | null;
  overall: number;
  gol: number; // = Definición
  asist: number; // = Visión
  regate: number; // = Regate
  pase: number; // = Pase
  def: number; // = Defensa
  image_url: string | null;
};

type SortKey =
  | "season_end_desc"
  | "overall_desc"
  | "gol_desc"
  | "asist_desc"
  | "regate_desc"
  | "pase_desc"
  | "def_desc"
  | "player_name_asc";

const LABELS = {
  gol: "Definición",
  asist: "Visión",
  regate: "Regate",
  pase: "Pase",
  def: "Defensa",
} as const;

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [search, setSearch] = useState("");
  const [series, setSeries] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("season_end_desc");

  // Debounce para no pegarle a Supabase en cada tecla
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) {
      if (c.series) set.add(c.series);
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [cards]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      let q = supabase
        .from("cards")
        .select(
          "id, card_id, player_name, season_text, season_end, series, overall, gol, asist, regate, pase, def, image_url"
        )
        .limit(50);

      // filtro por nombre
      if (debouncedSearch.length > 0) {
        q = q.ilike("player_name", `%${debouncedSearch}%`);
      }

      // filtro por serie
      if (series !== "all") {
        q = q.eq("series", series);
      }

      // orden (las columnas siguen siendo gol/asist/etc en DB)
      if (sort === "season_end_desc")
        q = q.order("season_end", { ascending: false });
      if (sort === "overall_desc") q = q.order("overall", { ascending: false });
      if (sort === "gol_desc") q = q.order("gol", { ascending: false });
      if (sort === "asist_desc") q = q.order("asist", { ascending: false });
      if (sort === "regate_desc") q = q.order("regate", { ascending: false });
      if (sort === "pase_desc") q = q.order("pase", { ascending: false });
      if (sort === "def_desc") q = q.order("def", { ascending: false });
      if (sort === "player_name_asc")
        q = q.order("player_name", { ascending: true });

      const { data, error } = await q;

      if (error) setError(error.message);
      else setCards((data as Card[]) ?? []);

      setLoading(false);
    };

    load();
  }, [debouncedSearch, series, sort]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">PBP Cards</h1>
          <p className="text-white/60 text-sm">
            Búsqueda + filtros + orden (default: temporada más nueva)
          </p>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jugador… (ej: Messi)"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30 text-white placeholder:text-white/40"
          />

          {/* Select SERIES (fondo oscuro + opciones negras) */}
          <select
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            {seriesOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-black text-white">
                {opt === "all" ? "Todas las series" : opt}
              </option>
            ))}
          </select>

          {/* Select ORDEN (fondo oscuro + opciones negras) */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            <option value="season_end_desc" className="bg-black text-white">
              Temporada (más nueva)
            </option>
            <option value="overall_desc" className="bg-black text-white">
              Overall (mayor)
            </option>
            <option value="gol_desc" className="bg-black text-white">
              {LABELS.gol} (mayor)
            </option>
            <option value="asist_desc" className="bg-black text-white">
              {LABELS.asist} (mayor)
            </option>
            <option value="regate_desc" className="bg-black text-white">
              {LABELS.regate} (mayor)
            </option>
            <option value="pase_desc" className="bg-black text-white">
              {LABELS.pase} (mayor)
            </option>
            <option value="def_desc" className="bg-black text-white">
              {LABELS.def} (mayor)
            </option>
            <option value="player_name_asc" className="bg-black text-white">
              Nombre (A → Z)
            </option>
          </select>
        </div>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && cards.length === 0 && (
        <p className="text-white/60">No hay resultados con esos filtros.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{c.player_name}</p>
                <p className="text-xs text-white/60">
                  {c.season_text ?? "-"} {c.series ? `• ${c.series}` : ""}
                </p>
              </div>
              <div className="text-2xl font-black">{c.overall}</div>
            </div>

            {c.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.image_url}
                alt={c.player_name}
                className="w-full rounded-lg border border-white/10"
              />
            ) : (
              <div className="w-full h-40 rounded-lg bg-white/10 flex items-center justify-center text-white/50">
                Sin imagen
              </div>
            )}

            {/* Chips inferiores: etiquetas coherentes con las cartas PNG */}
            <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
              <Stat label="DEF." title={LABELS.gol} v={c.gol} />
              <Stat label="VIS." title={LABELS.asist} v={c.asist} />
              <Stat label="REG." title={LABELS.regate} v={c.regate} />
              <Stat label="PASE" title={LABELS.pase} v={c.pase} />
              <Stat label="DEF." title={LABELS.def} v={c.def} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Stat({
  label,
  title,
  v,
}: {
  label: string;
  title?: string;
  v: number;
}) {
  return (
    <div
      className="rounded-md bg-black/40 border border-white/10 py-2"
      title={title}
    >
      <div className="text-white/60">{label}</div>
      <div className="text-white font-bold">{v}</div>
    </div>
  );
}
