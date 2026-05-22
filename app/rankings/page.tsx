"use client";

import { useMemo, useState } from "react";
import { Card, LABELS, RankKey, cards, optionsFor, sortCards } from "@/lib/staticCards";

export default function RankingsPage() {
  const [season, setSeason] = useState("all");
  const [country, setCountry] = useState("all");
  const [club, setClub] = useState("all");
  const [rankBy, setRankBy] = useState<RankKey>("overall");
  const [limit, setLimit] = useState<50 | 100>(50);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);

  const seasonOptions = useMemo(() => optionsFor("season_text"), []);
  const countryOptions = useMemo(() => optionsFor("country"), []);
  const clubOptions = useMemo(() => optionsFor("club"), []);

  const rows = useMemo(() => {
    const filtered = cards.filter((card) => {
      if (season !== "all" && card.season_text !== season) return false;
      if (country !== "all" && card.country !== country) return false;
      if (club !== "all" && card.club !== club) return false;
      return true;
    });

    return sortCards(filtered, `${rankBy}_desc`).slice(0, limit);
  }, [season, country, club, rankBy, limit]);

  const title = `Ranking • ${LABELS[rankBy]} (mayor) • Top ${limit}`;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-white/60 text-sm">
            Filtra por temporada/pais/club y elige el atributo del ranking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 w-full sm:w-auto">
          <Select value={season} onChange={setSeason} options={seasonOptions} allLabel="Todas las temporadas" />
          <Select value={country} onChange={setCountry} options={countryOptions} allLabel="Todos los paises" />
          <Select value={club} onChange={setClub} options={clubOptions} allLabel="Todos los clubes" />

          <select
            value={rankBy}
            onChange={(event) => setRankBy(event.target.value as RankKey)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            <option value="overall" className="bg-black text-white">Mejor calificado (mayor)</option>
            <option value="gol" className="bg-black text-white">{LABELS.gol} (mayor)</option>
            <option value="asist" className="bg-black text-white">{LABELS.asist} (mayor)</option>
            <option value="regate" className="bg-black text-white">{LABELS.regate} (mayor)</option>
            <option value="pase" className="bg-black text-white">{LABELS.pase} (mayor)</option>
            <option value="def" className="bg-black text-white">{LABELS.def} (mayor)</option>
          </select>

          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value) as 50 | 100)}
            className="w-full rounded-lg bg-white/5 text-white border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          >
            <option value={50} className="bg-black text-white">Top 50</option>
            <option value={100} className="bg-black text-white">Top 100</option>
          </select>
        </div>
      </div>

      {rows.length === 0 && (
        <p className="text-white/60">No hay resultados con esos filtros.</p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Jugador</th>
                <th className="text-left p-3">Temporada</th>
                <th className="text-left p-3">Club</th>
                <th className="text-left p-3">Pais</th>
                <th className="text-right p-3">{LABELS[rankBy]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-t border-white/10 hover:bg-white/5 cursor-pointer"
                  onClick={() => {
                    setSelected(row);
                    setOpen(true);
                  }}
                >
                  <td className="p-3 text-white/60">{index + 1}</td>
                  <td className="p-3 font-semibold">{row.player_name}</td>
                  <td className="p-3 text-white/80">{row.season_text ?? "-"}</td>
                  <td className="p-3 text-white/80">{row.club ?? "-"}</td>
                  <td className="p-3 text-white/80">{row.country ?? "-"}</td>
                  <td className="p-3 text-right font-black">{row[rankBy]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-lg w-full rounded-xl border border-white/10 bg-black p-4"
            onClick={(event) => event.stopPropagation()}
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
