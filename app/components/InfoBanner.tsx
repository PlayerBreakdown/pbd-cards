"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InfoBanner() {
  const pathname = usePathname();

  // No mostrar en la página de metodología
  if (pathname === "/info") return null;

  return (
    <div className="border-b border-white/10 bg-white/5">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-white/80">
          Estas cartas se basan en estadísticas reales, pero muestran{" "}
          <b>calificaciones (0–100)</b>. Si quieres entender el cálculo y cómo
          interpretarlas, mira la metodología.
        </p>

        <Link
          href="/info"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
        >
          Ver metodología
        </Link>
      </div>
    </div>
  );
}
