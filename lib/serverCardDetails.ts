import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import { Card } from "@/lib/cardTypes";

const DETAILS_DIR = path.join(process.cwd(), "public", "data", "card-details");

export const getCardDetail = cache(async (id: string): Promise<Card | null> => {
  if (!isSafeCardId(id)) return null;

  try {
    const file = await fs.readFile(path.join(DETAILS_DIR, `${id}.json`), "utf8");
    return JSON.parse(file) as Card;
  } catch {
    return null;
  }
});

function isSafeCardId(id: string) {
  return Boolean(id) && !id.includes("/") && !id.includes("\\") && !id.includes("..");
}
