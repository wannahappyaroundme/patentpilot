import { NextResponse } from "next/server";
import { fetchMarketStats } from "@/lib/stats";

export const revalidate = 300;

export async function GET() {
  const stats = await fetchMarketStats();
  return NextResponse.json(stats);
}
