import { NextResponse, type NextRequest } from "next/server";
import { searchPatents, type SearchParams } from "@/lib/patents";
import type { Urgency, OrgType } from "@/lib/types";

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
  return NextResponse.json(result);
}
