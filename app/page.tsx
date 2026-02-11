"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Card = {
  id: string;
  card_id: string;
  player_name: string;
  season_text: string | null;
  season_end: number | null; // <-- NUEVO
  overall: number;
  gol: number;
  asist: number;
  regate: number;
  pase: number;
  def: number;
  image_url: string | null;
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("cards")
        .select(
          "id, card_id, player_name, season_text, season_end, overall, gol, asist, regate, pase, def, image_url"
        )
        // Orden principal: temporada más nueva primero
        .order("season_end", { ascending: false })
        // Desempate: mayor overall primero
        .order("overall", { ascending: false })
        .limit(20);

      if (error) setError(error.message);
      else setCards((data as Card[]) ?? []);

      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">PBP Cards</h1>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{c.player_name}</p>
                <p className="text-xs text-white/60">{c.season_text ?? "-"}</p>
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

            <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
              <Stat label="GOL" v={c.gol} />
              <Stat label="AST" v={c.asist} />
              <Stat label="REG" v={c.regate} />
              <Stat label="PAS" v={c.pase} />
              <Stat label="DEF" v={c.def} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-md bg-black/40 border border-white/10 py-2">
      <div className="text-white/60">{label}</div>
      <div className="text-white font-bold">{v}</div>
    </div>
  );
}
