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
      className="group relative z-[60] inline-flex shrink-0 cursor-pointer items-center gap-0.5 sm:gap-1 xl:absolute xl:left-0 xl:top-1/2 xl:-translate-y-1/2 2xl:-left-14"
      aria-label="Volver a Cartas"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/pbp-logo-header.webp"
        alt="PBP"
        width={192}
        height={192}
        decoding="async"
        className="mt-0.5 h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:mt-1 xl:h-[72px] xl:w-[72px]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/player-breakdown-wordmark.png"
        alt="Player Breakdown"
        width={301}
        height={160}
        decoding="async"
        className="mt-0.5 h-9 w-auto max-w-[155px] object-contain sm:h-11 sm:max-w-[185px] lg:h-12 lg:max-w-[210px] xl:mt-1 xl:h-[68px] xl:max-w-[255px]"
      />
    </Link>
  );
}
