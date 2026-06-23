export function Select({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="pbp-control w-full rounded-lg border border-yellow-400/20 px-3 py-2 text-white outline-none focus:border-yellow-400/60"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-black text-white">
          {option === "all" ? allLabel : option}
        </option>
      ))}
    </select>
  );
}

export function FilterField({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-base font-bold uppercase tracking-wide text-yellow-200/75">
        {label}
      </span>
      {children}
    </label>
  );
}
