const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_ROOT = path.resolve(ROOT, "..");
const CSV_PATH = path.join(SOURCE_ROOT, "EXPORT.csv");
const NEW_CSV_PATH = path.join(SOURCE_ROOT, "PUNTUACIONES_ATACANTES.csv");
const ASSET_MAP_PATH = path.join(SOURCE_ROOT, "assets", "asset-map.json");
const OUTPUT_DIR = path.join(SOURCE_ROOT, "output");
const PUBLIC_CARDS_DIR = path.join(ROOT, "public", "cards");
const PUBLIC_DATA_DIR = path.join(ROOT, "public", "data");
const DATA_PATH = path.join(PUBLIC_DATA_DIR, "cards.json");

const COUNTRY_NAMES = {
  argentina: "Argentina",
  brasil: "Brasil",
  colombia: "Colombia",
  espana: "Espana",
  francia: "Francia",
  nigeria: "Nigeria",
  paisesbajos: "Paises Bajos",
  portugal: "Portugal",
};

const CLUB_NAMES = {
  atalanta: "Atalanta",
  barcelona: "Barcelona",
  bilbao: "Athletic Club",
  city: "Manchester City",
  leipzig: "RB Leipzig",
  psg: "PSG",
  realmadrid: "Real Madrid",
};

function clean(value) {
  return String(value ?? "").trim().replace(/^\uFEFF/, "");
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function compactSlug(value) {
  return slugify(value).replaceAll("-", "");
}

function playerSlugCandidates(playerName) {
  const slug = slugify(playerName);
  const parts = slug.split("-").filter(Boolean);
  const rest = parts.length > 1 ? parts.slice(1).join("-") : "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return Array.from(new Set([
    slug,
    compactSlug(playerName),
    rest,
    rest.replaceAll("-", ""),
    last,
  ].filter(Boolean)));
}

function resolveAsset(assetMap, playerName) {
  for (const key of playerSlugCandidates(playerName)) {
    if (assetMap[key]) return { key, asset: assetMap[key] };
  }
  return { key: "", asset: {} };
}

function parseNumber(value) {
  const parsed = Number(clean(value).replace(/\.$/, "").replace(/,$/, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundNumber(value) {
  return Math.round(parseNumber(value));
}

function normalizeSeason(seasonText) {
  return clean(seasonText).replace("/", "-");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((v) => clean(v) !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  row.push(cell);
  if (row.some((v) => clean(v) !== "")) rows.push(row);

  const [header, ...body] = rows;
  return body.map((values) =>
    Object.fromEntries(header.map((key, index) => [clean(key), clean(values[index])]))
  );
}

function slugFromAsset(assetPath) {
  const firstPath = clean(assetPath).split("|")[0] || "";
  if (!firstPath) return "";
  const base = path.basename(firstPath, path.extname(firstPath));
  return base.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function valueFromRow(row, names) {
  for (const name of names) {
    const value = clean(row[name]);
    if (value) return value;
  }
  return "";
}

function labelFromSlug(slug, map) {
  if (!slug) return "";
  if (map[slug]) return map[slug];
  return slug
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function numberValue(value) {
  return parseNumber(value);
}

function seasonEnd(seasonText) {
  const years = clean(seasonText).match(/\d{2,4}/g);
  if (!years?.length) return null;
  const last = years[years.length - 1];
  return Number(last.length === 2 ? `20${last}` : last);
}

function loadAssetMap() {
  if (!fs.existsSync(ASSET_MAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(ASSET_MAP_PATH, "utf8"));
}

function resolveClubPath(asset, seasonText) {
  const clubs = asset.clubs || {};
  const season = normalizeSeason(seasonText);
  return clubs[season] || clubs.default || Object.values(clubs)[0] || "";
}

function hasNewSheetColumns(row) {
  return "Score Gol" in row || "Total visual x2" in row;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyImages() {
  ensureDir(PUBLIC_CARDS_DIR);
  if (!fs.existsSync(OUTPUT_DIR)) return;

  for (const file of fs.readdirSync(OUTPUT_DIR)) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file)) continue;
    fs.copyFileSync(path.join(OUTPUT_DIR, file), path.join(PUBLIC_CARDS_DIR, file));
  }
}

function cardFromNewSheet(row, assetMap) {
  const playerName = clean(row.Jugador);
  const seasonText = normalizeSeason(row.Temporada);
  const { asset } = resolveAsset(assetMap, playerName);
  const endYear = seasonEnd(seasonText);
  const cardId = `${compactSlug(playerName)}_pvpv1_${endYear || ""}`;
  const rowCountry = valueFromRow(row, ["Pais", "País", "Nacionalidad", "Country"]);
  const rowClub = valueFromRow(row, ["Club", "Equipo", "Team"]);
  const clubPath = resolveClubPath(asset, seasonText);
  const clubSlug = slugFromAsset(clubPath);
  const cardImagePath = path.join(PUBLIC_CARDS_DIR, `${cardId}.png`);

  if (!fs.existsSync(cardImagePath)) {
    throw new Error(`No existe la imagen de carta para ${playerName}: ${cardImagePath}. Ejecuta npm.cmd run refresh:data desde pbd-cards para generar y sincronizar en orden.`);
  }

  return {
    id: cardId,
    card_id: cardId,
    player_name: clean(asset.display_name) || playerName.toUpperCase(),
    season_text: seasonText || null,
    season_end: endYear,
    series: "PBP",
    country: rowCountry || clean(asset.country) || labelFromSlug(slugFromAsset(asset.country_badge_path), COUNTRY_NAMES) || null,
    club: rowClub || clean(asset.club) || labelFromSlug(clubSlug, CLUB_NAMES) || null,
    overall: roundNumber(row["Total visual x2"] || row["Total base"]),
    gol: roundNumber(row["Score Gol"]),
    asist: roundNumber(row["Score Pase creativo"]),
    regate: roundNumber(row["Score Regate"]),
    pase: roundNumber(row["Score Pase"]),
    def: roundNumber(row["Score Defensa"]),
    image_url: `/cards/${cardId}.png`,
  };
}

function cardFromExport(row) {
  const cardId = clean(row.card_id);
  const countrySlug = slugFromAsset(row.country_badge_path);
  const clubSlug = slugFromAsset(row.club_badge_paths);

  return {
    id: cardId,
    card_id: cardId,
    player_name: clean(row.player_name),
    season_text: clean(row.season_text) || null,
    season_end: seasonEnd(row.season_text),
    series: clean(row.series) || null,
    country: labelFromSlug(countrySlug, COUNTRY_NAMES) || null,
    club: labelFromSlug(clubSlug, CLUB_NAMES) || null,
    overall: numberValue(row.overall),
    gol: numberValue(row.gol),
    asist: numberValue(row.asist),
    regate: numberValue(row.regate),
    pase: numberValue(row.pase),
    def: numberValue(row.def),
    image_url: `/cards/${cardId}.png`,
  };
}

function uniqueByCardId(cards) {
  const seen = new Set();
  const unique = [];

  for (const card of cards) {
    const key = clean(card.card_id || card.id);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(card);
  }

  return unique;
}

function sortByOverallDesc(cards) {
  return [...cards].sort((a, b) => {
    const byOverall = Number(b.overall ?? 0) - Number(a.overall ?? 0);
    if (byOverall !== 0) return byOverall;
    return clean(a.player_name).localeCompare(clean(b.player_name));
  });
}

function main() {
  const inputCsvPath = fs.existsSync(NEW_CSV_PATH) ? NEW_CSV_PATH : CSV_PATH;

  if (!fs.existsSync(inputCsvPath)) {
    throw new Error(`No encuentro CSV en ${inputCsvPath}`);
  }

  ensureDir(PUBLIC_DATA_DIR);
  copyImages();

  const assetMap = loadAssetMap();
  const rows = parseCsv(fs.readFileSync(inputCsvPath, "utf8"));
  const cards = sortByOverallDesc(
    uniqueByCardId(
      rows
        .filter((row) => clean(row.Jugador || row.player_name))
        .map((row) => (hasNewSheetColumns(row) ? cardFromNewSheet(row, assetMap) : cardFromExport(row)))
    )
  );

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
  console.log(`Sincronizadas ${cards.length} cartas en ${DATA_PATH}`);
}

main();
