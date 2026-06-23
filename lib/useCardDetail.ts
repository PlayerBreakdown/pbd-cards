"use client";

import { useEffect, useState } from "react";
import { Card } from "@/lib/cardTypes";

const detailCache = new Map<string, Card>();

export function useCardDetail(id: string | null | undefined) {
  const [fetchedCard, setFetchedCard] = useState<Card | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!id) return;
    const cached = detailCache.get(id);
    if (cached) return;

    fetch(`/data/card-details/${encodeURIComponent(id)}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar el detalle de ${id}`);
        return response.json() as Promise<Card>;
      })
      .then((detail) => {
        detailCache.set(id, detail);
        if (!cancelled) setFetchedCard(detail);
      })
      .catch(() => {
        if (!cancelled) setFetchedCard(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const cachedCard = id ? detailCache.get(id) ?? null : null;
  const card = cachedCard ?? (fetchedCard?.id === id ? fetchedCard : null);
  const loading = Boolean(id && !card);

  return { card, loading };
}
