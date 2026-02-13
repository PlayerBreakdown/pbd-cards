import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InfoBanner from "./components/InfoBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PBP Cards",
  description: "Player Breakdown cards",
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
    >
      {label}
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <header className="sticky top-0 z-50 bg-black/70 backdrop-blur border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-black text-lg">
              PBP Cards
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              <NavLink href="/" label="Cartas" />
              <NavLink href="/rankings" label="Rankings" />
              <NavLink href="/información" label="Información" />
            </nav>
          </div>
        </header>

        {/* Banner global (se oculta automáticamente en /info) */}
        <InfoBanner />

        {children}
      </body>
    </html>
  );
}
