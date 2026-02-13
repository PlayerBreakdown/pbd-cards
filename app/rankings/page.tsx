"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type CardRow = {
  id: string;
  card_id: string;
  player_name: string;
  season_text: string | null;
  season_end: number | null;
  series: string | null;
  country: string | null;
  club: string | null;
  overall: number;
  gol: number; // Definición
  asist: number; // Visión
  regate: number; // Regate
  pase: number; // Pase
  def: number; // Defensa
  image_url: string | null;
};

type RankKey = "overall" | "gol" | "asist" | "regate" | "pase" | "def";

const LABELS: Record<RankKey, string> = {
  overall: "Mejor calificado",
  gol: "Definición",
  asist: "Visión",
  regate: "Regate",
  pase: "Pase",
  def: "Defensa",
};

function norm(s: string) {
  return s.trim();
}

export default function RankingsPage() {
  const [rows, setRows] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtros (single)
  const [season, setSeason] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [club, setClub] = useState<string>("all");

  // ranking
  const [rankBy, setRankBy] = useState<RankKey>("overall");
  const [limit, setLimit] = useState<50 | 100>(50);

  // opciones
  const [seasonOptions, setSeasonOptions] = useState<string[]>(["all"]);
  const [countryOptions, setCountryOptions] = useState<string[]>(["all"]);
  const [clubOptions, setClubOptions] = useState<string[]>(["all"]);

  // modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CardRow | null>(null);

  // Cargar opciones para selects
  useEffect(() => {
    const loadOptions = async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("season_text, country, club")
        .limit(2000);

      if (error) {
        console.log("⚠️ No pude cargar opciones:", error.message);
        return;
      }

      const seSet = new Set<string>();
      const coSet = new Set<string>();
      const clSet = new Set<string>();

      for (const row of (data as any[]) ?? []) {
        if (row.season_text) seSet.add(norm(row.season_text));
        if (row.country) coSet.add(norm(row.country));
        if (row.club) clSet.add(norm(row.club));
      }

      const sortAlpha = (a: string, b: string) => a.localeCompare(b);

      const seasonSorted = Array.from(seSet).sort((a, b) => {
        const ay = Number(a.split("-")[1] ?? a);
        const by = Number(b.split("-")[1] ?? b);
        if (Number.isFinite(ay) && Number.isFinite(by)) return by - ay;
        return b.localeCompare(a);
      });

      setSeasonOptions(["all", ...seasonSorted]);
      setCountryOptions(["all", ...Array.from(coSet).sort(sortAlpha)]);
      setClubOptions(["all", ...Array.from(clSet).sort(sortAlpha)]);
    };

    loadOptions();
  }, []);

  // Cargar ranking
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      let q = supabase
        .from("cards")
        .select(
          "id, card_id, player_name, season_text, season_end, series, country, club, overall, gol, asist, regate, pase, def, image_url"
        )
        .limit(limit);

      if (season !== "all") q = q.eq("season_text", season);
      if (country !== "all") q = q.eq("country", country);
      if (club !== "all") q = q.eq("club", club);

      q = q.order(rankBy, { ascending: false });

      const { data, error } = await q;

      if (error) setError(error.message);
      else setRows((data as CardRow[]) ?? []);

      setLoading(false);
    };

    load();
  }, [season, country, club, rankBy, limit]);

  const title = useMemo(() => {
    return `Ranking • ${LABELS[rankBy]} (mayor) • Top ${limit}`;
  }, [rankBy, limit]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-white/60 text-sm">
            Filtra por temporada/país/club y elige el atributo del ranking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 w-full sm:w-auto">
          {/* Temporada */}
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            {seasonOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-black text-white">
                {opt === "all" ? "Todas las temporadas" : opt}
              </option>
            ))}
          </select>

          {/* País */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            {countryOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-black text-white">
                {opt === "all" ? "Todos los países" : opt}
              </option>
            ))}
          </select>

          {/* Club */}
          <select
            value={club}
            onChange={(e) => setClub(e.target.value)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            {clubOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-black text-white">
                {opt === "all" ? "Todos los clubes" : opt}
              </option>
            ))}
          </select>

          {/* Ranking por */}
          <select
            value={rankBy}
            onChange={(e) => setRankBy(e.target.value as RankKey)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            <option value="overall" className="bg-black text-white">
              Mejor calificado (mayor)
            </option>
            <option value="gol" className="bg-black text-white">
              Definición (mayor)
            </option>
            <option value="asist" className="bg-black text-white">
              Visión (mayor)
            </option>
            <option value="regate" className="bg-black text-white">
              Regate (mayor)
            </option>
            <option value="pase" className="bg-black text-white">
              Pase (mayor)
            </option>
            <option value="def" className="bg-black text-white">
              Defensa (mayor)
            </option>
          </select>

          {/* Top N */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) as 50 | 100)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            <option value={50} className="bg-black text-white">
              Top 50
            </option>
            <option value={100} className="bg-black text-white">
              Top 100
            </option>
          </select>
        </div>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && rows.length === 0 && (
        <p className="text-white/60">No hay resultados con esos filtros.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Jugador</th>
                <th className="text-left p-3">Temporada</th>
                <th className="text-left p-3">Club</th>
                <th className="text-left p-3">País</th>
                <th className="text-right p-3">{LABELS[rankBy]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-t border-white/10 hover:bg-white/5 cursor-pointer"
                  onClick={() => {
                    setSelected(r);
                    setOpen(true);
                  }}
                >
                  <td className="p-3 text-white/60">{idx + 1}</td>
                  <td className="p-3 font-semibold">{r.player_name}</td>
                  <td className="p-3 text-white/80">{r.season_text ?? "-"}</td>
                  <td className="p-3 text-white/80">{r.club ?? "-"}</td>
                  <td className="p-3 text-white/80">{r.country ?? "-"}</td>
                  <td className="p-3 text-right font-black">
                    {(r as any)[rankBy]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {open && selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-lg w-full rounded-xl border border-white/10 bg-black p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-bold text-lg">{selected.player_name}</div>
                <div className="text-white/60 text-sm">
                  {selected.season_text ?? "-"}
                  {selected.club ? ` • ${selected.club}` : ""}
                  {selected.country ? ` • ${selected.country}` : ""}
                </div>
              </div>
              <button
                className="rounded-lg border border-white/10 px-3 py-1 bg-white/5 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </button>
            </div>

            {selected.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.image_url}
                alt={selected.player_name}
                className="w-full rounded-lg border border-white/10"
              />
            ) : (
              <div className="w-full h-56 rounded-lg bg-white/10 flex items-center justify-center text-white/50">
                Sin imagen
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
