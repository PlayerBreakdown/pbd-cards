const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "public", "data", "cards.index.json");
const baseCards = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));

const scenarios = [1000, 2000, 10000];

function normalizeSearch(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreValue(card, field) {
  return Number((card.scores && card.scores[field]) ?? card[field] ?? 0);
}

function sortCards(rows, sort) {
  const sorted = [...rows];

  if (sort === "player_name_asc") {
    return sorted.sort((a, b) => a.player_name.localeCompare(b.player_name));
  }

  const field = sort.replace("_desc", "");
  return sorted.sort((a, b) => {
    const primary = scoreValue(b, field) - scoreValue(a, field);
    if (primary !== 0) return primary;
    return a.player_name.localeCompare(b.player_name);
  });
}

function primeCards(rows, rankBy = "overall") {
  const bestByPlayer = new Map();

  for (const card of rows) {
    const key = normalizeSearch(card.player_name);
    const current = bestByPlayer.get(key);

    if (!current || comparePrime(card, current, rankBy) < 0) {
      bestByPlayer.set(key, card);
    }
  }

  return Array.from(bestByPlayer.values());
}

function comparePrime(a, b, rankBy) {
  const bySelectedSkill = scoreValue(b, rankBy) - scoreValue(a, rankBy);
  if (bySelectedSkill !== 0) return bySelectedSkill;

  const byOverall = scoreValue(b, "overall") - scoreValue(a, "overall");
  if (byOverall !== 0) return byOverall;

  return Number(b.season_end ?? 0) - Number(a.season_end ?? 0);
}

function makeCards(count) {
  const cards = [];

  for (let index = 0; index < count; index += 1) {
    const source = baseCards[index % baseCards.length];
    const copy = Math.floor(index / baseCards.length);
    const playerName = `${source.player_name} ${copy}`;

    cards.push({
      ...source,
      id: `${source.id}_${index}`,
      player_name: playerName,
      search_text: normalizeSearch(
        `${playerName} ${source.club ?? ""} ${source.country ?? ""} ${source.season_text ?? ""}`
      ),
    });
  }

  return cards;
}

function measure(label, run) {
  const start = performance.now();
  const result = run();
  const elapsed = performance.now() - start;
  return { label, elapsed, result };
}

console.log(`Base real: ${baseCards.length} cartas en ${path.relative(ROOT, INDEX_PATH)}`);

for (const count of scenarios) {
  const cards = makeCards(count);
  const rows = [];

  rows.push(
    measure("buscar 'messi' + prime + ordenar", () => {
      const filtered = cards.filter((card) => card.search_text.includes("messi"));
      return sortCards(primeCards(filtered, "overall"), "overall_desc").slice(0, 50).length;
    })
  );

  rows.push(
    measure("temporada actual + prime + ordenar", () => {
      const filtered = cards.filter((card) => card.season_text === "2025-26");
      return sortCards(primeCards(filtered, "overall"), "overall_desc").slice(0, 50).length;
    })
  );

  rows.push(
    measure("todas + ordenar", () => sortCards(cards, "overall_desc").slice(0, 50).length)
  );

  console.log(`\n${count.toLocaleString("es-CO")} cartas simuladas`);
  for (const row of rows) {
    console.log(`  ${row.label}: ${row.elapsed.toFixed(2)} ms (${row.result} visibles)`);
  }
}
