const fs = require("fs");
const path = require("path");

let sharp = null;
try {
  sharp = require("sharp");
} catch {
  sharp = null;
}

const ROOT = path.resolve(__dirname, "..");
const SOURCE_ROOT = path.resolve(ROOT, "..");
const CSV_PATH = path.join(SOURCE_ROOT, "EXPORT.csv");
const NEW_CSV_PATH = path.join(SOURCE_ROOT, "PUNTUACIONES_ATACANTES.csv");
const ASSET_MAP_PATH = path.join(SOURCE_ROOT, "assets", "asset-map.json");
const PLAYERS_DIR = path.join(SOURCE_ROOT, "assets", "players");
const OUTPUT_DIR = path.join(SOURCE_ROOT, "generator", ".generated-v2");
const PUBLIC_CARDS_DIR = path.join(ROOT, "public", "cards");
const PUBLIC_FACES_DIR = path.join(ROOT, "public", "player-faces");
const PUBLIC_DATA_DIR = path.join(ROOT, "public", "data");
const PUBLIC_CARD_DETAILS_DIR = path.join(PUBLIC_DATA_DIR, "card-details");
const DATA_PATH = path.join(PUBLIC_DATA_DIR, "cards.json");
const DATA_INDEX_PATH = path.join(PUBLIC_DATA_DIR, "cards.index.json");
const DATA_META_PATH = path.join(PUBLIC_DATA_DIR, "catalog.meta.json");
const CARD_IMAGE_EXT = ".webp";
const FACE_IMAGE_EXT = ".webp";
const FACE_IMAGE_SIZE = 512;
const FACE_IMAGE_QUALITY = 82;
const CARD_SCHEMA_VERSION = "1.1.0";
const FORMULA_VERSION = "pbp-v2";
const DATA_SOURCE_VERSION = "puntuaciones-atacantes-v1";

const COUNTRY_NAMES = {
  argentina: "Argentina",
  brasil: "Brasil",
  colombia: "Colombia",
  espana: "Espana",
  francia: "Francia",
  nigeria: "Nigeria",
  paisesbajos: "Países Bajos",
  portugal: "Portugal",
};

const CLUB_NAMES = {
  atalanta: "Atalanta",
  barcelona: "Barcelona",
  bilbao: "Athletic Club",
  bayern: "Bayern Munich",
  bayernmunich: "Bayern Munich",
  city: "Manchester City",
  leipzig: "RB Leipzig",
  psg: "PSG",
  realmadrid: "Real Madrid",
};

const CLUB_ALIASES = {
  "atletico-de-madrid": "Atletico de Madrid",
  "atletico-madrid": "Atletico de Madrid",
  "bayern": "Bayern Munich",
  "bayern-munich": "Bayern Munich",
  "city": "Manchester City",
  "leeds": "Leeds United",
  "leeds-united": "Leeds United",
  "man-city": "Manchester City",
  "manchester-city": "Manchester City",
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

function canonicalClubName(value) {
  const raw = clean(value);
  if (!raw) return "";
  return CLUB_ALIASES[slugify(raw)] || raw;
}

function numberValue(value) {
  return parseNumber(value);
}

function optionalNumber(value) {
  const raw = clean(value);
  if (!raw) return null;
  return parseNumber(raw);
}

function publicAssetUrl(publicPath, absolutePath) {
  if (!fs.existsSync(absolutePath)) return publicPath;
  const stat = fs.statSync(absolutePath);
  const version = `${Math.round(stat.mtimeMs)}-${stat.size}`;
  return `${publicPath}?v=${version}`;
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

function cardMetadata(inputCsvPath) {
  return {
    schema_version: CARD_SCHEMA_VERSION,
    formula_version: FORMULA_VERSION,
    data_source_version: DATA_SOURCE_VERSION,
    source_file: path.basename(inputCsvPath),
  };
}

function statsFromNewSheet(row) {
  return {
    minutes: optionalNumber(row.Minutos),
    goals: optionalNumber(row.Goles),
    goals_per_90: optionalNumber(row["Goles/90"]),
    assists: optionalNumber(row.AST),
    key_passes: optionalNumber(row.KEYP),
    key_passes_per_90: optionalNumber(row["KEYP/90"]),
    successful_dribbles: optionalNumber(row.SDR),
    successful_dribbles_per_90: optionalNumber(row["SDR/90"]),
    total_passes: optionalNumber(row.APS),
    total_passes_per_90: optionalNumber(row["APS/90"]),
    pass_accuracy: optionalNumber(row["APS%"]),
    tackles: optionalNumber(row.TACK),
    tackles_per_90: optionalNumber(row["TACK/90"]),
    interceptions: optionalNumber(row.INT),
    interceptions_per_90: optionalNumber(row["INT/90"]),
    base_score: optionalNumber(row["Total base"]),
    visual_score: optionalNumber(row["Total visual x2"]),
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyImages() {
  ensureDir(PUBLIC_CARDS_DIR);
  if (!fs.existsSync(OUTPUT_DIR)) return;

  for (const file of fs.readdirSync(OUTPUT_DIR)) {
    if (path.extname(file).toLowerCase() !== CARD_IMAGE_EXT) continue;
    fs.copyFileSync(path.join(OUTPUT_DIR, file), path.join(PUBLIC_CARDS_DIR, file));
  }
}

function resolvePlayerFacePath(asset, playerName) {
  const mappedPath = clean(asset.player_photo_path);
  if (mappedPath) {
    const sourcePath = path.join(SOURCE_ROOT, mappedPath);
    if (fs.existsSync(sourcePath)) return sourcePath;
  }

  if (!fs.existsSync(PLAYERS_DIR)) return "";

  const candidates = new Set([
    slugify(playerName),
    compactSlug(playerName),
    ...playerSlugCandidates(playerName),
  ]);

  for (const file of fs.readdirSync(PLAYERS_DIR)) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(file)) continue;
    const base = path.basename(file, path.extname(file));
    const fileCandidates = new Set([slugify(base), compactSlug(base)]);
    for (const candidate of candidates) {
      if (fileCandidates.has(candidate)) return path.join(PLAYERS_DIR, file);
    }
  }

  return "";
}

function displayNameFromFacePath(asset, playerName) {
  const sourcePath = resolvePlayerFacePath(asset, playerName);
  if (!sourcePath) return playerName;

  const base = path.basename(sourcePath, path.extname(sourcePath));
  const nameFromAsset = clean(base);
  if (!nameFromAsset) return playerName;
  if (nameFromAsset === nameFromAsset.toLowerCase()) return playerName;
  return nameFromAsset;
}

async function copyPlayerFace(asset, playerName, cardId) {
  const sourcePath = resolvePlayerFacePath(asset, playerName);
  if (!fs.existsSync(sourcePath)) return null;

  ensureDir(PUBLIC_FACES_DIR);
  const fileName = `${cardId}${FACE_IMAGE_EXT}`;
  const destinationPath = path.join(PUBLIC_FACES_DIR, fileName);

  if (sharp) {
    await sharp(sourcePath)
      .rotate()
      .resize({
        width: FACE_IMAGE_SIZE,
        height: FACE_IMAGE_SIZE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: FACE_IMAGE_QUALITY })
      .toFile(destinationPath);
  } else {
    fs.copyFileSync(sourcePath, destinationPath);
  }

  return publicAssetUrl(`/player-faces/${fileName}`, destinationPath);
}

async function cardFromNewSheet(row, assetMap, inputCsvPath) {
  const playerName = clean(row.Jugador);
  const seasonText = normalizeSeason(row.Temporada);
  const { asset } = resolveAsset(assetMap, playerName);
  const endYear = seasonEnd(seasonText);
  const cardId = `${compactSlug(playerName)}_pvpv1_${endYear || ""}`;
  const rowCountry = valueFromRow(row, ["Pais", "País", "Nacionalidad", "Country"]);
  const rowClub = valueFromRow(row, ["Club", "Equipo", "Team"]);
  const clubPath = resolveClubPath(asset, seasonText);
  const clubSlug = slugFromAsset(clubPath);
  const cardImagePath = path.join(PUBLIC_CARDS_DIR, `${cardId}${CARD_IMAGE_EXT}`);
  const faceUrl = await copyPlayerFace(asset, playerName, cardId);
  const displayName = displayNameFromFacePath(asset, playerName);

  if (!fs.existsSync(cardImagePath)) {
    throw new Error(`No existe la imagen de carta para ${playerName}: ${cardImagePath}. Ejecuta npm.cmd run refresh:data desde pbd-cards para generar y sincronizar en orden.`);
  }

  return {
    id: cardId,
    card_id: cardId,
    player_name: displayName,
    season_text: seasonText || null,
    season_end: endYear,
    series: "PBP",
    country: rowCountry || clean(asset.country) || labelFromSlug(slugFromAsset(asset.country_badge_path), COUNTRY_NAMES) || null,
    club: canonicalClubName(rowClub || clean(asset.club) || labelFromSlug(clubSlug, CLUB_NAMES)) || null,
    overall: roundNumber(row["Total visual x2"] || row["Total base"]),
    gol: roundNumber(row["Score Gol"]),
    asist: roundNumber(row["Score Pase creativo"]),
    regate: roundNumber(row["Score Regate"]),
    pase: roundNumber(row["Score Pase"]),
    def: roundNumber(row["Score Defensa"]),
    scores: {
      overall: optionalNumber(row["Total visual x2"] || row["Total base"]),
      gol: optionalNumber(row["Score Gol"]),
      asist: optionalNumber(row["Score Pase creativo"]),
      regate: optionalNumber(row["Score Regate"]),
      pase: optionalNumber(row["Score Pase"]),
      def: optionalNumber(row["Score Defensa"]),
    },
    image_url: publicAssetUrl(`/cards/${cardId}${CARD_IMAGE_EXT}`, cardImagePath),
    face_url: faceUrl,
    stats: statsFromNewSheet(row),
    metadata: cardMetadata(inputCsvPath),
  };
}

function cardFromExport(row, inputCsvPath) {
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
    club: canonicalClubName(labelFromSlug(clubSlug, CLUB_NAMES)) || null,
    overall: numberValue(row.overall),
    gol: numberValue(row.gol),
    asist: numberValue(row.asist),
    regate: numberValue(row.regate),
    pase: numberValue(row.pase),
    def: numberValue(row.def),
    scores: null,
    image_url: publicAssetUrl(`/cards/${cardId}${CARD_IMAGE_EXT}`, path.join(PUBLIC_CARDS_DIR, `${cardId}${CARD_IMAGE_EXT}`)),
    face_url: null,
    stats: null,
    metadata: {
      ...cardMetadata(inputCsvPath),
      formula_version: "legacy-export",
      data_source_version: "export-v1",
    },
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

function normalizeSearchText(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cardIndex(card) {
  const { stats, ...rest } = card;
  return {
    ...rest,
    has_stats: Boolean(stats),
    search_text: normalizeSearchText(
      [
        card.player_name,
        card.season_text,
        card.club,
        card.country,
        card.series,
        card.id,
        card.card_id,
      ]
        .filter(Boolean)
        .join(" ")
    ),
  };
}

function catalogMeta(cards, inputCsvPath) {
  const formulaVersions = new Set();
  const seasons = new Set();
  const generatedAt = new Date().toISOString();

  for (const card of cards) {
    if (card.metadata?.formula_version) formulaVersions.add(card.metadata.formula_version);
    if (card.season_text) seasons.add(card.season_text);
  }

  return {
    schema_version: CARD_SCHEMA_VERSION,
    generated_at: generatedAt,
    source_file: path.basename(inputCsvPath),
    card_count: cards.length,
    formula_versions: Array.from(formulaVersions).sort(),
    seasons: Array.from(seasons).sort(),
  };
}

function writeCardDetails(cards) {
  ensureDir(PUBLIC_CARD_DETAILS_DIR);

  const currentFiles = new Set(
    fs.existsSync(PUBLIC_CARD_DETAILS_DIR)
      ? fs.readdirSync(PUBLIC_CARD_DETAILS_DIR).filter((file) => file.endsWith(".json"))
      : []
  );

  for (const card of cards) {
    const fileName = `${card.id}.json`;
    fs.writeFileSync(path.join(PUBLIC_CARD_DETAILS_DIR, fileName), JSON.stringify(card), "utf8");
    currentFiles.delete(fileName);
  }

  for (const staleFile of currentFiles) {
    fs.unlinkSync(path.join(PUBLIC_CARD_DETAILS_DIR, staleFile));
  }
}

async function main() {
  const inputCsvPath = fs.existsSync(NEW_CSV_PATH) ? NEW_CSV_PATH : CSV_PATH;

  if (!fs.existsSync(inputCsvPath)) {
    throw new Error(`No encuentro CSV en ${inputCsvPath}`);
  }

  ensureDir(PUBLIC_DATA_DIR);
  copyImages();

  const assetMap = loadAssetMap();
  const rows = parseCsv(fs.readFileSync(inputCsvPath, "utf8"));
  const parsedCards = await Promise.all(
    rows
      .filter((row) => clean(row.Jugador || row.player_name))
      .map((row) => (hasNewSheetColumns(row) ? cardFromNewSheet(row, assetMap, inputCsvPath) : cardFromExport(row, inputCsvPath)))
  );

  const cards = sortByOverallDesc(
    uniqueByCardId(
      parsedCards
    )
  );

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
  fs.writeFileSync(DATA_INDEX_PATH, `${JSON.stringify(cards.map(cardIndex), null, 2)}\n`, "utf8");
  fs.writeFileSync(DATA_META_PATH, `${JSON.stringify(catalogMeta(cards, inputCsvPath), null, 2)}\n`, "utf8");
  writeCardDetails(cards);
  console.log(`Sincronizadas ${cards.length} cartas en ${DATA_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
