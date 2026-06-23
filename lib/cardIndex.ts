import cardsIndexData from "@/public/data/cards.index.json";
import { CardIndex, RankKey } from "@/lib/cardTypes";
import {
  LABELS,
  isLegacyCard,
  latestSeasonForCards,
  normalizeSearch,
  optionsForCards,
  primeCards,
  searchCardsIn,
  sortCards,
} from "@/lib/cardUtils";

export type { CardIndex, RankKey };
export { LABELS, isLegacyCard, normalizeSearch, primeCards, sortCards };

export const cardsIndex = cardsIndexData as CardIndex[];

export function optionsForIndex(field: "series" | "season_text" | "country" | "club") {
  return optionsForCards(cardsIndex, field);
}

export function latestSeasonIndex() {
  return latestSeasonForCards(cardsIndex);
}

export function searchCardsIndex(query: string) {
  return searchCardsIn(cardsIndex, query);
}
