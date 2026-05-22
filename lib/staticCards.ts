import cardsData from "@/public/data/cards.json";

export type Card = {
  id: string;
  card_id: string;
  player_name: string;
  season_text: string | null;
  season_end: number | null;
  series: string | null;
  country: string | null;
  club: string | null;
  overall: number;
  gol: number;
  asist: number;
  regate: number;
  pase: number;
  def: number;
  image_url: string | null;
};

export type RankKey = "overall" | "gol" | "asist" | "regate" | "pase" | "def";

export const cards = cardsData as Card[];

export const LABELS: Record<RankKey, string> = {
  overall: "Mejor calificado",
  gol: "Definicion",
  asist: "Vision",
  regate: "Regate",
  pase: "Pase",
  def: "Defensa",
};

export function optionsFor(field: "series" | "season_text" | "country" | "club") {
  const values = new Set<string>();

  for (const card of cards) {
    const value = card[field];
    if (value) values.add(value.trim());
  }

  const list = Array.from(values);

  if (field === "season_text") {
    list.sort((a, b) => {
      const ay = Number(a.split("-")[1] ?? a);
      const by = Number(b.split("-")[1] ?? b);
      if (Number.isFinite(ay) && Number.isFinite(by)) return by - ay;
      return b.localeCompare(a);
    });
  } else {
    list.sort((a, b) => a.localeCompare(b));
  }

  return ["all", ...list];
}

export function searchCards(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return cards;
  return cards.filter((card) => card.player_name.toLowerCase().includes(needle));
}

export function sortCards(rows: Card[], sort: string) {
  const sorted = [...rows];

  if (sort === "player_name_asc") {
    return sorted.sort((a, b) => a.player_name.localeCompare(b.player_name));
  }

  const field = sort.replace("_desc", "") as keyof Card;
  return sorted.sort((a, b) => Number(b[field] ?? 0) - Number(a[field] ?? 0));
}
