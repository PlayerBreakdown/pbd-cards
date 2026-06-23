import { CardIndex, RankKey } from "@/lib/cardTypes";

export const LABELS: Record<RankKey, string> = {
  overall: "Mayor puntuación",
  gol: "Definición",
  asist: "Visión",
  regate: "Regate",
  pase: "Pase",
  def: "Defensa",
};

export function optionsForCards<T extends CardIndex>(
  cards: T[],
  field: "series" | "season_text" | "country" | "club"
) {
  const values = new Set<string>();
  const seasonEnds = new Map<string, number>();

  for (const card of cards) {
    const value = card[field];
    if (!value) continue;

    const option = value.trim();
    values.add(option);

    if (field === "season_text") {
      seasonEnds.set(option, Math.max(seasonEnds.get(option) ?? 0, Number(card.season_end ?? parseSeasonEnd(option))));
    }
  }

  const list = Array.from(values);
  list.sort((a, b) => {
    if (field === "season_text") {
      return (seasonEnds.get(b) ?? 0) - (seasonEnds.get(a) ?? 0);
    }

    return a.localeCompare(b);
  });

  return ["all", ...list];
}

export function latestSeasonForCards<T extends CardIndex>(cards: T[]) {
  return (
    [...cards]
      .filter((card) => card.season_text && card.season_end)
      .sort((a, b) => Number(b.season_end ?? 0) - Number(a.season_end ?? 0))[0]
      ?.season_text ?? "all"
  );
}

export function searchCardsIn<T extends CardIndex>(cards: T[], query: string) {
  const needle = normalizeSearch(query);
  if (!needle) return cards;

  return cards.filter((card) => {
    const haystack =
      card.search_text ??
      normalizeSearch(`${card.player_name} ${card.club ?? ""} ${card.country ?? ""} ${card.season_text ?? ""}`);

    return haystack.includes(needle);
  });
}

export function normalizeSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function sortCards<T extends CardIndex>(rows: T[], sort: string) {
  const sorted = [...rows];

  if (sort === "player_name_asc") {
    return sorted.sort((a, b) => a.player_name.localeCompare(b.player_name));
  }

  const field = sort.replace("_desc", "") as keyof CardIndex;
  return sorted.sort((a, b) => {
    const primary = sortableValue(b, field) - sortableValue(a, field);
    if (primary !== 0) return primary;

    if (field === "season_end") {
      const byOverall = Number(b.overall ?? 0) - Number(a.overall ?? 0);
      if (byOverall !== 0) return byOverall;
    }

    return a.player_name.localeCompare(b.player_name);
  });
}

export function primeCards<T extends CardIndex>(rows: T[], rankBy: RankKey = "overall") {
  const bestByPlayer = new Map<string, T>();

  for (const card of rows) {
    const key = normalizeSearch(card.player_name);
    const current = bestByPlayer.get(key);

    if (!current || comparePrime(card, current, rankBy) < 0) {
      bestByPlayer.set(key, card);
    }
  }

  return Array.from(bestByPlayer.values());
}

export function isLegacyCard(card: CardIndex) {
  return Number(card.season_end ?? 0) <= 2015;
}

function comparePrime(a: CardIndex, b: CardIndex, rankBy: RankKey) {
  const bySelectedSkill = sortableValue(b, rankBy) - sortableValue(a, rankBy);
  if (bySelectedSkill !== 0) return bySelectedSkill;

  const byOverall = sortableValue(b, "overall") - sortableValue(a, "overall");
  if (byOverall !== 0) return byOverall;

  const bySeason = Number(b.season_end ?? 0) - Number(a.season_end ?? 0);
  if (bySeason !== 0) return bySeason;

  return a.player_name.localeCompare(b.player_name);
}

function sortableValue(card: CardIndex, field: keyof CardIndex) {
  if (
    field === "overall" ||
    field === "gol" ||
    field === "asist" ||
    field === "regate" ||
    field === "pase" ||
    field === "def"
  ) {
    return Number(card.scores?.[field] ?? card[field] ?? 0);
  }

  return Number(card[field] ?? 0);
}

function parseSeasonEnd(seasonText: string) {
  const match = seasonText.match(/(\d{4})(?:-(\d{2}|\d{4}))?/);
  if (!match) return 0;

  if (!match[2]) return Number(match[1]);

  const start = Number(match[1]);
  const endPart = match[2];
  if (endPart.length === 4) return Number(endPart);

  const century = Math.floor(start / 100) * 100;
  const end = century + Number(endPart);
  return end < start ? end + 100 : end;
}
