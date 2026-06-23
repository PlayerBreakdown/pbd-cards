"use client";

import Link from "next/link";

export default function BrandHomeLink() {
  return (
    <Link
      href="/"
      onClick={(event) => {
        event.preventDefault();
        for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
          const key = window.sessionStorage.key(index);
          if (key?.startsWith("pbp-")) window.sessionStorage.removeItem(key);
        }
        window.location.assign("/");
      }}
      className="group relative z-[60] inline-flex shrink-0 cursor-pointer items-center gap-0.5 sm:gap-1 xl:absolute xl:-left-14 xl:top-1/2 xl:-translate-y-1/2"
      aria-label="Volver a Cartas"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/pbp-logo-header.webp"
        alt="PBP"
        width={192}
        height={192}
        decoding="async"
        className="mt-1 h-14 w-14 object-contain sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/player-breakdown-wordmark.png"
        alt="Player Breakdown"
        width={301}
        height={160}
        decoding="async"
        className="mt-1 h-12 w-auto max-w-[185px] object-contain sm:h-16 sm:max-w-[240px] lg:h-[68px] lg:max-w-[255px]"
      />
    </Link>
  );
}
