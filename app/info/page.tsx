export const dynamic = "force-dynamic";

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* ✅ Solo título grande (sin explicación debajo) */}
        <h1 className="text-3xl font-black mb-8">Información</h1>

        <Section title="Qué estás viendo">
          <p className="text-white/80 leading-relaxed">
            Son cartas de jugadores creadas a partir de datos reales.
          </p>

          <p className="text-white/80 leading-relaxed mt-3">
            Usamos una escala de <b>0 a 100</b> para sus habilidades como{" "}
            <b>definición</b>, <b>visión</b> y <b>regate</b>, y también mostramos
            una <b>nota general</b>.
          </p>

          <p className="text-white/80 leading-relaxed mt-3">
            Todas las calificaciones se calculan combinando distintas
            estadísticas reales.
          </p>
        </Section>

        <Section title="Qué significa cada atributo">
          <ul className="list-disc pl-5 text-white/80 space-y-2">
            <li>
              <b>Mejor calificado:</b> puntuación final/resumen general.
            </li>
            <li>
              <b>Definición:</b> finalización y amenaza de gol.
            </li>
            <li>
              <b>Visión:</b> creatividad, lectura y generación de ocasiones
              mediante pases clave.
            </li>
            <li>
              <b>Regate:</b> 1v1 y desequilibrio.
            </li>
            <li>
              <b>Pase:</b> distribución y precisión en los pases.
            </li>
            <li>
              <b>Defensa:</b> aporte defensivo.
            </li>
          </ul>
        </Section>

        <Section title="Cómo usar la web">
          <ul className="list-disc pl-5 text-white/80 space-y-2">
            <li>
              En <b>Cartas</b> puedes buscar por nombre y filtrar por temporada,
              país y club.
            </li>
            <li>
              En <b>Rankings</b> eliges un atributo y ves el top ordenado, con
              los mismos filtros.
            </li>
          </ul>
        </Section>

        <Section title="Cálculo (fórmula)">
          <p className="text-white/80 leading-relaxed">
            Este sistema convierte estadísticas reales en una puntuación de{" "}
            <b>0 a 100</b>, según el rendimiento del jugador y la importancia de
            cada aspecto en su posición.
          </p>

          <div className="mt-4 text-white/80 leading-relaxed space-y-4">
            <div>
              <b>🔹 Paso 1: Calificación individual por estadística</b>
              <div className="mt-1">
                Cada dato se compara con el mejor registro existente (histórico
                o de temporada).
              </div>
            </div>

            <div>
              <b>🔹 Paso 2: Fórmula</b>
              <div className="mt-1">
                Si más alto es mejor (goles, asistencias, regates):
              </div>
              <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm text-white">
                (Valor del jugador ÷ Mejor valor) × 100
              </div>

              <div className="mt-3">
                Si más bajo es mejor (pérdidas, errores):
              </div>
              <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm text-white">
                (Mejor valor ÷ Valor del jugador) × 100
              </div>

              <div className="mt-3">
                Así, el mejor en cada estadística siempre obtiene{" "}
                <b>100 puntos</b>, y los demás quedan en proporción.
              </div>
            </div>

            <div>
              <b>🔹 Paso 3: Ponderación por importancia</b>
              <div className="mt-1">
                Cada estadística tiene un porcentaje de valor distinto según el
                perfil del jugador:
              </div>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>En un atacante, el gol puede valer más.</li>
                <li>En un mediocampista, el pase.</li>
                <li>En un defensor, los duelos o quites.</li>
              </ul>

              <div className="mt-3">
                Calificación ponderada = <b>Puntuación × peso (%)</b>
              </div>
            </div>

            <div>
              <b>🔹 Paso 4: Puntuación final</b>
              <div className="mt-1">
                Se suman todas las <b>calificaciones ponderadas</b> para obtener
                el resultado total de <b>0 a 100</b>. En otras palabras: cada
                estadística aporta una parte del total según su peso, y la suma
                de todas esas partes da el “Mejor calificado”.
              </div>
            </div>
          </div>
        </Section>

        {/* ✅ NUEVO: Ejemplo con imágenes */}
        <Section title="Ejemplo (referencia)">
          <p className="text-white/80 leading-relaxed">
            Aquí se ve un ejemplo real del cálculo: primero comparamos las
            estadísticas del jugador con los mejores valores de referencia, y
            luego el resultado se refleja en la carta final.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/info/calculo.png"
              alt="Ejemplo de cálculo con métricas y referencias"
              className="w-full rounded-xl border border-white/10 bg-black/40"
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/info/carta.png"
              alt="Ejemplo de carta final generada"
              className="w-full rounded-xl border border-white/10 bg-black/40"
            />
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
