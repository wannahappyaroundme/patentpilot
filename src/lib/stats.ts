import type { MarketStats } from "./types";

// 2026-06-07 정정: 활성 풀 실측 104,582건. urgency/org 분포 모두 실측 동기화 완료 — Supabase RPC 작동 시 동적 값 사용.
const FALLBACK_STATS: MarketStats = {
  total: 104582,
  red: 19723,    // 실측 18.9%
  yellow: 52554, // 실측 50.2% — 최대 구간
  green: 32305,  // 실측 30.9%
  univ: 69777,   // 실측 66.7%
  gri: 34704,    // 실측 33.2% (기타 101건은 별도)
  top_universities: [
    { university_name: "한국전자통신연구원", n: 29096 },
    { university_name: "한국과학기술원", n: 10218 },
    { university_name: "한국과학기술연구원", n: 7021 },
    { university_name: "연세대학교", n: 6645 },
    { university_name: "서울대학교", n: 6643 },
    { university_name: "고려대학교", n: 6528 },
    { university_name: "한양대학교", n: 4854 },
    { university_name: "성균관대학교", n: 4733 },
    { university_name: "한국기계연구원", n: 4720 },
    { university_name: "한국화학연구원", n: 4141 },
  ],
};

export async function fetchMarketStats(): Promise<MarketStats> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return FALLBACK_STATS;
  }
  try {
    const { getSupabase } = await import("./supabase");
    const { data, error } = await getSupabase().rpc("market_stats");
    if (error || !data) return FALLBACK_STATS;
    return data as MarketStats;
  } catch {
    return FALLBACK_STATS;
  }
}
