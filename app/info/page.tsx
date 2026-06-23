import type { ReactNode } from "react";

const attributes = [
  ["Mayor puntuación", "El resumen general de la carta."],
  ["Definición", "Goles y frecuencia goleadora."],
  ["Visión", "Pases que crean ocasiones."],
  ["Regate", "Capacidad para superar rivales."],
  ["Pase", "Cantidad y precisión de pases."],
  ["Defensa", "Entradas e intercepciones."],
];

const attributeWeights = [
  ["Definición", "35%"],
  ["Visión", "17.5%"],
  ["Regate", "17.5%"],
  ["Pase", "15%"],
  ["Defensa", "15%"],
];

const attributeParts = [
  ["Definición", "Goles totales", "70%"],
  ["Definición", "Goles cada 90 minutos", "30%"],
  ["Visión", "Pases clave totales", "70%"],
  ["Visión", "Pases clave cada 90 minutos", "30%"],
  ["Regate", "Regates exitosos totales", "70%"],
  ["Regate", "Regates exitosos cada 90 minutos", "30%"],
  ["Pase", "Pases completados exitosamente", "30%"],
  ["Pase", "Pases completados exitosamente cada 90 minutos", "30%"],
  ["Pase", "Porcentaje de acierto en pase", "40%"],
  ["Defensa", "Entradas totales", "30%"],
  ["Defensa", "Intercepciones totales", "30%"],
  ["Defensa", "Entradas cada 90 minutos", "20%"],
  ["Defensa", "Intercepciones cada 90 minutos", "20%"],
];

const references = [
  ["Goles totales", "73", "Lionel Messi 2011-12"],
  ["Goles cada 90 minutos", "1.36", "Harry Kane 2025-26"],
  ["Pases clave totales", "184", "Bruno Fernandes 2022-23"],
  ["Pases clave cada 90 minutos", "4.6", "Dimitri Payet 2017-18"],
  ["Regates exitosos totales", "260", "Lionel Messi 2019-20"],
  ["Regates exitosos cada 90 minutos", "7.2", "Neymar 2017-18"],
  ["Pases completados exitosamente", "4935", "Rodri 2023-24"],
  ["Pases completados exitosamente cada 90 minutos", "124.2", "Xavi Hernandez 2010-11"],
  ["Porcentaje de acierto en pase", "95.9", "Thiago Silva 2017-18"],
  ["Entradas totales", "177", "Joao Palhinha 2023-24"],
  ["Intercepciones totales", "156", "N'Golo Kanté 2015-16"],
  ["Entradas cada 90 minutos", "5.2", "N'Golo Kanté 2015-16"],
  ["Intercepciones cada 90 minutos", "4.6", "N'Golo Kanté 2015-16"],
];

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <Section title="Qué estás viendo">
          <p className="text-white/80 leading-relaxed">
            Cada carta resume una temporada de un jugador usando estadísticas
            reales. La carta sirve para leer rápido en qué fue fuerte: gol,
            creatividad, regate, pase o defensa.
          </p>

          <p className="mt-3 text-white/80 leading-relaxed">
            Existen referencias anteriores a 2015-16, pero las cartas completas
            necesitan datos comparables en todos los apartados. Por eso, en
            general no se crean cartas de temporadas anteriores a 2015-16. Las
            cartas antiguas que sí aparecen son casos de referencia: se hicieron
            con una fuente previa cuyos datos eran prácticamente equivalentes a
            los de la fuente actual.
          </p>

          <p className="mt-3 text-white/80 leading-relaxed">
            El alcance actual es de clubes: las cartas solo consideran
            rendimiento en clubes de las cinco grandes ligas europeas. No
            incluyen partidos ni rendimiento con selecciones nacionales.
          </p>
        </Section>

        <Section title="Cómo leer una carta">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {attributes.map(([name, description]) => (
              <div key={name} className="pbp-surface rounded-lg border border-white/10 p-4">
                <h3 className="font-bold">{name}</h3>
                <p className="mt-1 text-lg text-white/70">{description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Cartas especiales">
          <p className="mb-4 text-white/80 leading-relaxed">
            Algunas cartas tienen un marco especial para que puedas identificar
            rápido quién destaca dentro de toda la colección o dentro de una
            temporada concreta.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SpecialCardExample
              type="goat"
              badge="GOAT"
              title="GOAT"
              subtitle="Mejor carta de toda la colección"
              text="Es la carta con la puntuación más alta entre todas las temporadas cargadas. Si aparece una nueva carta con mejor puntuación, el marco GOAT pasa automáticamente a esa carta."
            />
            <SpecialCardExample
              type="season"
              title="Mejor de temporada"
              subtitle="Mejor carta dentro de su temporada"
              text="Marca al jugador con mayor puntuación en esa temporada. Si varios jugadores parecen empatados por el número visible, se decide con el valor exacto con decimales."
            />
          </div>
        </Section>

        <Section title="Perfiles de cartas">
          <p className="mb-4 text-white/80 leading-relaxed">
            Las cartas pueden cambiar según el perfil del jugador. No se pesa
            igual a un atacante que a un mediocampista equilibrado o a un
            defensor. Los pesos actuales corresponden al perfil ofensivo.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ProfileCard
              title="Ofensivo"
              status="Activo"
              text="Perfil usado actualmente para atacantes."
              weights={[
                "Definición 35%",
                "Visión 17.5%",
                "Regate 17.5%",
                "Pase 15%",
                "Defensa 15%",
              ]}
            />
            <ProfileCard
              title="Neutro"
              status="Próximamente"
              text="Pensado para perfiles más equilibrados."
            />
            <ProfileCard
              title="Defensivo"
              status="Próximamente"
              text="Pensado para defensores y perfiles de mayor peso defensivo."
            />
          </div>
        </Section>

        <Section title="Cómo usar la página">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <UseCard title="Cartas" text="Busca jugadores y filtra por temporada, país o club." />
            <UseCard title="Rankings" text="Ordena todas las cartas por el atributo que quieras." />
            <UseCard title="VS" text="Compara dos cartas y mira quién gana en cada apartado." />
            <UseCard title="Balón de Oro" text="Compara al elegido por el Balón de Oro con el mejor según nuestro cálculo." />
          </div>
        </Section>

        <Section title="¿De dónde salen las puntuaciones?">
          <p className="text-white/80 leading-relaxed">
            Comparamos los datos de cada jugador con referencias históricas y
            luego combinamos esos resultados con distintos pesos. La fórmula
            activa es ofensiva y usa definición, visión, regate, pase y defensa.
          </p>

          <p className="mt-3 text-white/80 leading-relaxed">
            Cada estadística se convierte a una puntuación de 1 a 100. Para
            hacerlo, tomamos el récord o referencia más alta disponible y la
            usamos como el 100. A partir de ahí, los demás jugadores reciben una
            puntuación proporcional según qué tan cerca estén de esa referencia.
          </p>

          <p className="mt-3 text-white/80 leading-relaxed">
            Para que un dato pueda ser usado como referencia, el jugador debe
            haber disputado al menos 2000 minutos sumando competiciones
            europeas y partidos de clubes en las cinco grandes ligas.
          </p>

          <FormulaBox>puntuación = dato del jugador / referencia * 100</FormulaBox>
        </Section>

        <Section title="Ejemplo: Dembélé 2024-25">
          <p className="text-white/80 leading-relaxed">
            Dembélé marcó 35 goles en la temporada 2024-25. La referencia de
            goles totales es Messi 2011-12 con 73 goles.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard label="Dato de Dembélé" value="35 goles" />
            <StatCard label="Referencia" value="73 goles" />
            <StatCard label="Resultado" value="47.9 / 100" />
          </div>

          <FormulaBox>35 / 73 * 100 = 47.9</FormulaBox>

          <p className="mt-3 text-white/80 leading-relaxed">
            Ese no es todavía el atributo completo. Para Definición también se
            usa goles cada 90 minutos. Al juntar ambos datos, Dembélé queda con
            53.86 en Definición.
          </p>
        </Section>

        <Section title="Qué peso tiene cada atributo">
          <SimpleTable
            headers={["Atributo", "Peso en la puntuación final"]}
            rows={attributeWeights}
          />
        </Section>

        <Section title="Qué usa cada atributo">
          <SimpleTable
            headers={["Atributo", "Dato usado", "Peso dentro del atributo"]}
            rows={attributeParts}
          />
        </Section>

        <Section title="Puntuación final">
          <p className="text-white/80 leading-relaxed">
            Primero se calcula una nota base combinando los cinco atributos. En
            los atacantes, Definición pesa más porque el gol suele ser lo más
            importante para ese perfil.
          </p>

          <FormulaBox>
            base = Definición*35% + Visión*17.5% + Regate*17.5% + Pase*15% +
            Defensa*15%
          </FormulaBox>

          <p className="mt-3 text-white/80 leading-relaxed">
            Como al comparar contra récords históricos los resultados suelen
            quedar bajos, la nota final de la carta se multiplica por 2 para que
            visualmente sea más fácil de leer.
          </p>

          <FormulaBox>mayor puntuación = base * 2</FormulaBox>
        </Section>

        <Section title="Records y referencias">
          <SimpleTable
            headers={["Estadística", "Referencia", "Jugador"]}
            rows={references}
          />
        </Section>
      </div>
    </main>
  );
}

function SpecialCardExample({
  type,
  badge,
  title,
  subtitle,
  text,
}: {
  type: "goat" | "season";
  badge?: string;
  title: string;
  subtitle: string;
  text: string;
}) {
  const isGoat = type === "goat";

  return (
    <div className="pbp-surface grid gap-4 rounded-lg border border-white/10 p-4 sm:grid-cols-[8rem_1fr]">
      <div
        className={`pbp-surface-soft mx-auto w-28 rounded-lg border p-1 ${
          isGoat
            ? "pbp-goat-card-preview border-orange-300/80"
            : "pbp-season-card-preview border-blue-500/50"
        }`}
      >
        <div className="mb-1 flex items-center justify-between gap-1 text-[10px] font-black">
          <span className="rounded-full border border-yellow-300/35 bg-yellow-300/15 px-1.5 py-0.5 text-yellow-100">
            1
          </span>
          {isGoat ? (
            <span className="pbp-goat-badge rounded-full px-1.5 py-0.5 text-[9px] uppercase">
              {badge}
            </span>
          ) : (
            <span
              className="pbp-season-badge inline-flex items-center rounded-full px-1.5 py-0.5"
              aria-label="Mejor carta de la temporada"
            >
              <MiniGoldenBallIcon />
            </span>
          )}
        </div>
        <div
          className={`aspect-[2/3] rounded-md border border-white/10 bg-[linear-gradient(180deg,rgba(250,204,21,0.22),rgba(0,0,0,0.88))] p-3 ${
            isGoat ? "pbp-goat-inner-breathe" : "pbp-season-inner-breathe"
          }`}
        >
          <div className="flex h-full flex-col justify-between text-center">
            <div>
              <p className="text-xs font-black text-yellow-300">{title}</p>
              <p className="mt-1 text-[10px] text-white/55">Ejemplo</p>
            </div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-yellow-300/40 bg-black text-xl font-black text-yellow-300">
              99
            </div>
            <div className="rounded border border-white/10 bg-black/40 px-1 py-0.5 text-[9px] font-black uppercase text-white/80">
              PBP
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black">{title}</h3>
        <p className="mt-1 font-bold text-yellow-200/80">{subtitle}</p>
        <p className="mt-2 text-lg leading-relaxed text-white/75">{text}</p>
      </div>
    </div>
  );
}

function MiniGoldenBallIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
      <path
        d="M12 3.4c3.2 0 5.8 2.35 5.8 5.25 0 2.55-2 4.68-4.68 5.15v2.08h2.65c.84 0 1.52.68 1.52 1.52v.9H6.72v-.9c0-.84.68-1.52 1.52-1.52h2.64V13.8C8.2 13.33 6.2 11.2 6.2 8.65 6.2 5.75 8.8 3.4 12 3.4Z"
        fill="url(#infoGoldenBallGradient)"
        stroke="#fff0a6"
        strokeWidth="1.1"
      />
      <path
        d="M8.35 8.6c1.8.42 4.4.42 7.3 0M9.15 5.92c1.58 1.65 3.14 4.12 3.9 7.25M14.86 5.92c-1.58 1.65-3.14 4.12-3.9 7.25"
        stroke="#6d3b00"
        strokeLinecap="round"
        strokeWidth="0.85"
        opacity="0.62"
      />
      <defs>
        <linearGradient id="infoGoldenBallGradient" x1="7" x2="17.5" y1="4" y2="17.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7a8" />
          <stop offset="0.45" stopColor="#f5b81d" />
          <stop offset="1" stopColor="#9a5600" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ProfileCard({
  title,
  status,
  text,
  weights,
}: {
  title: string;
  status: string;
  text: string;
  weights?: string[];
}) {
  const active = status === "Activo";

  return (
    <div className={`rounded-lg border p-4 ${active ? "border-yellow-400/25 bg-yellow-400/10" : "pbp-surface border-white/10"}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">{title}</h3>
        <span className={`rounded-full px-2 py-1 text-base font-bold ${active ? "bg-yellow-400 text-black" : "pbp-control text-white/60"}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-base text-white/70">{text}</p>

      {weights && (
        <ul className="mt-3 space-y-1 text-base text-white/75">
          {weights.map((weight) => (
            <li key={weight}>{weight}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pbp-surface mb-8 rounded-xl border border-white/10 p-5">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function UseCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="pbp-surface rounded-lg border border-white/10 p-4">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-base text-white/70">{text}</p>
    </div>
  );
}

function FormulaBox({ children }: { children: ReactNode }) {
  return (
    <div className="pbp-control mt-3 rounded-lg border border-yellow-400/20 p-3 font-mono text-base text-yellow-100">
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="pbp-surface rounded-lg border border-white/10 p-4">
      <p className="text-base uppercase text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-base">
        <thead className="text-white">
          <tr className="border-b border-white/10">
            {headers.map((header) => (
              <th key={header} className="py-2 pr-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-white/75">
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-b border-white/10">
              {row.map((cell) => (
                <td key={cell} className="py-2 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

