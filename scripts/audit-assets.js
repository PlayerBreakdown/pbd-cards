const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TARGETS = [
  { name: "cards", dir: path.join(ROOT, "public", "cards") },
  { name: "player-faces", dir: path.join(ROOT, "public", "player-faces") },
  { name: "brand", dir: path.join(ROOT, "public", "brand") },
];

function fileRows(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .map((name) => {
      const fullPath = path.join(dir, name);
      const stat = fs.statSync(fullPath);
      return stat.isFile()
        ? {
            name,
            ext: path.extname(name).toLowerCase() || "(none)",
            bytes: stat.size,
          }
        : null;
    })
    .filter(Boolean);
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

for (const target of TARGETS) {
  const rows = fileRows(target.dir);
  const total = rows.reduce((sum, row) => sum + row.bytes, 0);
  const byExt = new Map();

  for (const row of rows) {
    const current = byExt.get(row.ext) ?? { count: 0, bytes: 0 };
    current.count += 1;
    current.bytes += row.bytes;
    byExt.set(row.ext, current);
  }

  console.log(`\n${target.name}`);
  console.log(`  files: ${rows.length}`);
  console.log(`  total: ${formatBytes(total)}`);

  for (const [ext, summary] of [...byExt.entries()].sort()) {
    console.log(`  ${ext}: ${summary.count} files, ${formatBytes(summary.bytes)}`);
  }

  const largest = [...rows].sort((a, b) => b.bytes - a.bytes).slice(0, 5);
  if (largest.length) {
    console.log("  largest:");
    for (const row of largest) {
      console.log(`    ${row.name}: ${formatBytes(row.bytes)}`);
    }
  }
}
