import { CardArt } from "@/app/components/OptimizedImages";
import { StatRow } from "@/app/components/StatBlocks";
import { CardIndex } from "@/lib/cardTypes";

type StatGroup = {
  title: string;
  rows: Array<[string, number | null | undefined, string?]>;
};

function statGroupsFor(card: CardIndex): StatGroup[] {
  return [
    {
      title: "Producción ofensiva",
      rows: [
        ["Goles", card.stats?.goals],
        ["Goles por 90 minutos", card.stats?.goals_per_90],
        ["Asistencias", card.stats?.assists],
        ["Pases clave", card.stats?.key_passes],
        ["Pases clave por 90 minutos", card.stats?.key_passes_per_90],
      ],
    },
    {
      title: "Juego y regate",
      rows: [
        ["Regates exitosos", card.stats?.successful_dribbles],
        ["Regates exitosos por 90 minutos", card.stats?.successful_dribbles_per_90],
        ["Pases totales", card.stats?.total_passes],
        ["Pases totales por 90 minutos", card.stats?.total_passes_per_90],
        ["Acierto en pase", card.stats?.pass_accuracy, "%"],
      ],
    },
    {
      title: "Defensa y contexto",
      rows: [
        ["Minutos", card.stats?.minutes],
        ["Entradas", card.stats?.tackles],
        ["Entradas por 90 minutos", card.stats?.tackles_per_90],
        ["Intercepciones", card.stats?.interceptions],
        ["Intercepciones por 90 minutos", card.stats?.interceptions_per_90],
      ],
    },
  ];
}

export function CardDetailContent({ card }: { card: CardIndex }) {
  const statGroups = statGroupsFor(card);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(260px,360px)_1fr]">
      <div>
        {card.image_url ? (
          <CardArt
            src={card.image_url}
            alt={card.player_name}
            sizes="(min-width: 1024px) 360px, 90vw"
            className="w-full rounded-lg border border-white/10"
          />
        ) : (
          <div className="pbp-surface-soft flex h-80 items-center justify-center rounded-lg text-white/50">
            Sin imagen
          </div>
        )}
      </div>

      <div className="space-y-4">
        {card.stats ? (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {statGroups.map((group) => (
              <div key={group.title} className="pbp-surface rounded-lg border border-white/10 p-4">
                <h3 className="mb-3 font-bold">{group.title}</h3>
                <div className="space-y-2">
                  {group.rows.map(([label, value, suffix]) => (
                    <StatRow key={label} label={label} value={value} suffix={suffix} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pbp-surface rounded-lg border border-white/10 p-4 text-white/70">
            Esta carta todavía no tiene estadísticas detalladas guardadas.
          </div>
        )}
      </div>
    </div>
  );
}
