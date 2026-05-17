import { NextResponse, type NextRequest } from "next/server";
import { searchPatents, type SearchParams } from "@/lib/patents";
import type { Urgency, OrgType } from "@/lib/types";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const revalidate = 60;

function parseUrgency(v: string | null): SearchParams["urgency"] {
  if (v === "RED" || v === "YELLOW" || v === "GREEN") return v as Urgency;
  return "ALL";
}

function parseOrg(v: string | null): SearchParams["org"] {
  if (v === "UNIV" || v === "GRI" || v === "OTHER") return v as OrgType;
  return "ALL";
}

function parseSort(v: string | null): SearchParams["sort"] {
  if (
    v === "recent" ||
    v === "citations" ||
    v === "claims" ||
    v === "transfers" ||
    v === "urgency"
  )
    return v;
  return "urgency";
}

export async function GET(req: NextRequest) {
  // Rate limit: IP당 1분에 60회 (사용자 검색은 충분, 스크래퍼는 차단)
  const rl = rateLimit(req, "search", 60, 60);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "too many requests" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const sp = req.nextUrl.searchParams;
  const result = await searchPatents({
    q: sp.get("q") ?? undefined,
    urgency: parseUrgency(sp.get("urgency")),
    org: parseOrg(sp.get("org")),
    ipc: sp.get("ipc") ?? undefined,
    university: sp.get("university") ?? undefined,
    page: Number(sp.get("page")) || 1,
    perPage: Number(sp.get("perPage")) || 20,
    sort: parseSort(sp.get("sort")),
  });
  return NextResponse.json(result, {
    headers: {
      // 스크래핑 방지: 캐시 무효화 + 검색엔진 색인 차단
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      ...rateLimitHeaders(rl),
    },
  });
}
