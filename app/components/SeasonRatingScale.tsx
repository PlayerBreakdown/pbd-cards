const ratingBands = [
  { range: "0-29", label: "Temporada deficiente", detail: "Temporada muy baja o con poco impacto estadístico." },
  { range: "30-39", label: "Temporada insuficiente", detail: "Rendimiento flojo para el estándar evaluado." },
  { range: "40-49", label: "Temporada aceptable", detail: "Temporada normal, sin destacar demasiado." },
  { range: "50-59", label: "Temporada competente", detail: "Buen rendimiento, sólido y útil." },
  { range: "60-69", label: "Temporada notable", detail: "Muy buena temporada. Jugador claramente destacado." },
  { range: "70-79", label: "Temporada sobresaliente", detail: "Temporadón. Rendimiento de alto impacto." },
  { range: "80-89", label: "Temporada élite mundial", detail: "Nivel de los mejores jugadores del mundo." },
  { range: "90-99", label: "Nivel Balón de Oro", detail: "Temporada digna de pelear el máximo premio individual." },
  { range: "100-109", label: "Temporada histórica", detail: "Temporada fuera de lo común, de recuerdo histórico." },
  { range: "110-119", label: "Temporada antológica", detail: "Rendimiento extraordinario, con cifras dignas de una temporada memorable." },
  { range: "120+", label: "Temporada legendaria", detail: "Temporada que, por sus cifras, alcanza la categoría más alta de la escala." },
] as const;

export default function SeasonRatingScale() {
  return (
    <section
      aria-labelledby="season-rating-title"
      className="rounded-xl border border-sky-300/15 bg-[#070b0f]/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <h2
        id="season-rating-title"
        className="pbp-display mb-3 whitespace-normal text-center text-2xl font-black uppercase leading-tight tracking-[0.06em] text-[#f1c14b] sm:text-left sm:text-3xl sm:leading-none sm:tracking-[0.08em]"
      >
        Calificación de temporada
      </h2>

      <ul className="grid grid-flow-col grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-6 gap-1.5">
        {ratingBands.map((band) => (
          <li
            key={band.range}
            tabIndex={0}
            className="group relative min-w-0 rounded-lg border border-sky-300/15 bg-[#081520]/82 px-2 py-1.5 outline-none focus:border-yellow-300/55 sm:px-3"
          >
            <p className="min-w-0 break-words text-xs font-bold uppercase leading-tight tracking-wide text-white/85 sm:text-sm">
              <strong className="mr-1.5 text-sm font-black text-yellow-300 sm:mr-2 sm:text-base">{band.range}</strong>
              <span>
                {band.label}
              </span>
            </p>
            <span
              role="tooltip"
              className="pointer-events-none absolute inset-x-2 top-full z-30 mt-1 hidden rounded-md border border-yellow-300/30 bg-[#05090d] px-3 py-2 text-sm leading-snug text-white shadow-xl group-hover:block group-focus:block"
            >
              {band.detail}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
