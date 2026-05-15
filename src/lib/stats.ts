import type { MarketStats } from "./types";

const FALLBACK_STATS: MarketStats = {
  total: 158777,
  red: 24677,
  yellow: 57933,
  green: 76167,
  univ: 105562,
  gri: 53039,
  top_universities: [
    { university_name: "한국전자통신연구원", n: 44005 },
    { university_name: "한국과학기술원", n: 15454 },
    { university_name: "한국과학기술연구원", n: 10619 },
    { university_name: "연세대학교", n: 10050 },
    { university_name: "서울대학교", n: 10048 },
    { university_name: "고려대학교", n: 9874 },
    { university_name: "한양대학교", n: 7342 },
    { university_name: "성균관대학교", n: 7159 },
    { university_name: "한국기계연구원", n: 7141 },
    { university_name: "한국화학연구원", n: 6263 },
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
