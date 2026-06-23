import Link from "next/link";

const navLinks = [
  { href: "/vs", label: "VS" },
  { href: "/", label: "Cartas" },
  { href: "/rankings", label: "Rankings" },
  { href: "/ballon-dor", label: "Balon de Oro" },
  { href: "/info", label: "Metodo" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#d89b18]/20 bg-[#01060a] px-5 py-8 text-white">
      <div className="mx-auto grid max-w-[108rem] gap-6 md:grid-cols-[1.4fr_1fr_1fr] md:items-start">
        <div>
          <p className="text-xl font-black uppercase tracking-[0.12em] text-[#f1c14b]">
            Player Breakdown
          </p>
          <p className="mt-2 max-w-2xl text-base text-white/62">
            Cartas, rankings y comparaciones de futbolistas basadas en estadisticas.
          </p>
          <p className="mt-4 max-w-3xl text-sm text-white/45">
            Proyecto independiente de analisis futbolistico. No afiliado a clubes,
            ligas, jugadores o marcas mencionadas. Las puntuaciones son calculos
            propios basados en estadisticas publicas.
          </p>
        </div>

        <nav aria-label="Navegacion secundaria">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.12em] text-yellow-200/75">
            Navegar
          </p>
          <div className="flex flex-wrap gap-3 text-base font-bold text-white/70">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[#f1c14b]">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div>
          <p className="mb-2 text-sm font-black uppercase tracking-[0.12em] text-yellow-200/75">
            Comunidad
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://ko-fi.com/playerbreakdown"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#f1c14b]/55 bg-[linear-gradient(135deg,#07141d,#102532)] px-4 py-2 text-base font-black uppercase tracking-wide text-[#f1c14b] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#ffe274] hover:bg-[#132d3a] hover:text-[#ffe274]"
            >
              Apoya el proyecto
            </a>
            <a
              href="https://ko-fi.com/playerbreakdown"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#d89b18]/35 bg-[#d89b18]/18 px-3 py-2 text-base font-black uppercase tracking-wide text-[#f1c14b] hover:bg-[#d89b18]/28"
            >
              Pedir carta
            </a>
            <a
              href="https://www.youtube.com/@Player-Breakdown"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-red-400/30 bg-red-950/30 px-3 py-2 text-base font-black uppercase tracking-wide text-red-100 hover:bg-red-800/45"
            >
              YouTube
            </a>
          </div>
          <p className="mt-4 text-sm text-white/45">
            © 2026 Player Breakdown. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
