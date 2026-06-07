import type { MarketStats } from "./types";

// 2026-06-07 정정: 활성 풀 실측 104,582건. 비율 임시 추정 — Supabase RPC 작동 시 동적 값 사용.
const FALLBACK_STATS: MarketStats = {
  total: 104582,
  red: 16253,
  yellow: 38159,
  green: 50170,
  univ: 69518,    // 기존 105,562의 비율 65.86%
  gri: 34925,     // 기존 53,039의 비율 33.4%
  top_universities: [
    { university_name: "한국전자통신연구원", n: 28988 },
    { university_name: "한국과학기술원", n: 10180 },
    { university_name: "한국과학기술연구원", n: 6995 },
    { university_name: "연세대학교", n: 6620 },
    { university_name: "서울대학교", n: 6618 },
    { university_name: "고려대학교", n: 6504 },
    { university_name: "한양대학교", n: 4836 },
    { university_name: "성균관대학교", n: 4715 },
    { university_name: "한국기계연구원", n: 4703 },
    { university_name: "한국화학연구원", n: 4126 },
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
