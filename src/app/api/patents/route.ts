import { NextResponse, type NextRequest } from "next/server";
import { getPatentsByAppNos } from "@/lib/patents";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ids = (sp.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) return NextResponse.json({ rows: [] });
  const rows = await getPatentsByAppNos(ids);
  return NextResponse.json({ rows });
}
