"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Cartas" },
  { href: "/vs", label: "VS" },
  { href: "/rankings", label: "Rankings" },
  { href: "/ballon-dor", label: "Balón de Oro" },
  { href: "/info", label: "Método", featured: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "/cards" || pathname.startsWith("/cards/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const pathname = usePathname();

  return (
    <div className="relative grid w-full min-w-0 grid-cols-1 items-center gap-2 xl:gap-3 min-[1800px]:grid-cols-[minmax(0,54rem)_minmax(30rem,1fr)]">
      <nav className="grid w-full min-w-0 grid-cols-5 gap-1 border-b border-[#d89b18]/25 pb-1 sm:gap-2 min-[1800px]:w-[54rem]">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            active={isActive(pathname, item.href)}
            featured={Boolean(item.featured)}
          />
        ))}
      </nav>

      <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end xl:flex-nowrap min-[1800px]:col-start-2 min-[1800px]:pl-4">
        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-1.5 rounded-2xl border border-[#d89b18]/35 bg-black/35 p-1.5 shadow-[0_0_18px_rgba(216,155,24,0.08)] sm:min-w-[14rem] sm:flex-[1_1_15rem] xl:w-64 xl:flex-none">
          <p className="text-center text-xs font-bold uppercase leading-none tracking-[0.06em] text-[#f6d47a] sm:text-sm sm:tracking-[0.08em]">
            ¿No encontraste un jugador? ¡Pídelo!
          </p>

          <a
            href="https://ko-fi.com/playerbreakdown"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl xl:h-12 border border-[#f1c14b]/70 bg-[linear-gradient(135deg,#f1c14b,#d89b18_48%,#9a5f05)] px-3 text-base font-black uppercase tracking-[0.08em] text-[#08111f] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:border-[#ffe274] hover:bg-[#f1c14b] sm:flex-none xl:px-5 xl:text-lg xl:tracking-[0.12em]"
          >
            <span aria-hidden="true">★</span>
            Pedir carta
          </a>
        </div>

        <a
          href="https://ko-fi.com/playerbreakdown"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#f1c14b]/45 xl:h-12 bg-[#07141d] px-3 text-sm font-black uppercase tracking-[0.08em] text-[#f6d47a] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#ffe274] hover:bg-[#102532] hover:text-[#ffe274] sm:flex-[0_1_8rem] xl:flex-none min-[1800px]:px-3"
        >
          <span aria-hidden="true">♥</span>
          <span>Apoya</span>
        </a>

        <a
          href="https://www.youtube.com/@Player-Breakdown"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Canal de YouTube de Player Breakdown"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-red-400/35 xl:h-12 bg-red-950/35 px-3 text-sm font-black uppercase tracking-[0.08em] text-red-100 hover:border-red-300/70 hover:bg-red-700/55 hover:text-white sm:flex-[0_1_9rem] xl:flex-none xl:text-base min-[1800px]:px-3"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-current"
          >
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
          </svg>
          <span className="hidden lg:inline">YouTube</span>
        </a>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  active,
  featured,
}: {
  href: string;
  label: string;
  active: boolean;
  featured: boolean;
}) {
  const featuredClass = featured
    ? active
      ? "rounded-xl border border-[#f1c14b]/60 bg-[#0b1b22] text-[#f1c14b]"
      : "rounded-xl border border-[#f1c14b]/35 bg-[#061219] text-[#e7eef5] hover:border-[#f1c14b]/65 hover:bg-[#0b1b22] hover:text-[#f1c14b]"
    : active
      ? "text-[#f1c14b]"
      : "text-white/78 hover:text-[#f1c14b]";

  return (
    <Link
      href={href}
      className={`group relative flex min-h-11 min-w-0 items-center justify-center whitespace-nowrap px-1 py-2 text-center text-[0.68rem] font-black uppercase tracking-[0.02em] sm:min-h-11 sm:px-2 sm:py-2 sm:text-sm sm:tracking-[0.04em] md:text-base lg:text-lg xl:min-h-12 xl:py-3 min-[1800px]:text-[1.3rem] ${
        featuredClass
      }`}
    >
      <span
        className={`absolute inset-x-6 bottom-0 h-0.5 rounded-full ${
          active ? "bg-[#d89b18]" : "bg-[#d89b18]/0 group-hover:bg-[#d89b18]/60"
        }`}
      />
      {label}
    </Link>
  );
}
