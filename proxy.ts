import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "playerbreakdowncards.com";
const legacyHosts = new Set(["pbd-cards.vercel.app"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();

  if (!host || !legacyHosts.has(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = canonicalHost;

  return NextResponse.redirect(url, 301);
}
