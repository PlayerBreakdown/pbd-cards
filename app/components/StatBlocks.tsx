export function ScoreBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-yellow-400/30 bg-yellow-400/10" : "pbp-surface border-white/10"}`}>
      <p className="text-base text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

export function StatRow({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number | null | undefined;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 text-base last:border-b-0 last:pb-0">
      <span className="text-white/65">{label}</span>
      <span className="font-semibold">{formatStat(value, suffix)}</span>
    </div>
  );
}

export function formatStat(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
  return `${formatted}${suffix}`;
}
