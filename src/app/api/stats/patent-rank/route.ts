import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { patentRank, patentRankGrade, AXIS_WEIGHTS } from "@/lib/patent-rank";
import type { PatentRow } from "@/lib/types";

export const revalidate = 1800; // 30분 캐시

const SAMPLE_SIZE = 2000;

interface AxisStat {
  mean: number;
  median: number;
  p25: number;
  p75: number;
}

interface GradeDist {
  grade: string;
  color: string;
  count: number;
  pct: number;
}

interface OverallHist {
  bin: number; // 시작 점수 (0, 5, 10, ..., 95)
  count: number;
}

interface TopOrg {
  org_name: string;
  avg_overall: number;
  count: number;
}

export interface PatentRankStatsResponse {
  sample_size: number;
  total_active_pool: number;
  overall: AxisStat;
  axes: Record<keyof typeof AXIS_WEIGHTS, AxisStat>;
  grade_distribution: GradeDist[];
  overall_histogram: OverallHist[];
  top_orgs: TopOrg[];
  generated_at: string;
}

function stats(values: number[]): AxisStat {
  if (values.length === 0) {
    return { mean: 0, median: 0, p25: 0, p75: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    mean: Math.round(sum / sorted.length),
    median: sorted[Math.floor(sorted.length / 2)] ?? 0,
    p25: sorted[Math.floor(sorted.length * 0.25)] ?? 0,
    p75: sorted[Math.floor(sorted.length * 0.75)] ?? 0,
  };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const sb = createClient(url, anonKey, { auth: { persistSession: false } });

  // 활성 매물 풀에서 SAMPLE_SIZE개 가져와서 점수 분포 계산.
  // ORDER BY application_number로 결정적 샘플링 (cache 친화)
  const { data, error, count } = await sb
    .from("patents")
    .select("*", { count: "exact" })
    .eq("latest_status", "연차료납부")
    .order("application_number", { ascending: true })
    .limit(SAMPLE_SIZE);

  if (error || !data) {
    console.error("stats/patent-rank fetch error", error);
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }

  const rows = data as PatentRow[];
  const totalActive = count ?? rows.length;

  // 각 row에 대해 patentRank 계산
  const ranked = rows.map((p) => {
    const r = patentRank(p);
    return { p, r };
  });

  const overallVals = ranked.map((x) => x.r.overall);
  const invVals = ranked.map((x) => x.r.inv);
  const impVals = ranked.map((x) => x.r.imp);
  const mktVals = ranked.map((x) => x.r.mkt);
  const netVals = ranked.map((x) => x.r.net);
  const comVals = ranked.map((x) => x.r.com);

  // 등급 분포
  const gradeCounts = new Map<
    string,
    { count: number; color: string }
  >();
  for (const { r } of ranked) {
    const g = patentRankGrade(r.overall);
    const cur = gradeCounts.get(g.grade) ?? { count: 0, color: g.color };
    cur.count++;
    gradeCounts.set(g.grade, cur);
  }
  const gradeDist: GradeDist[] = (["S", "A", "B", "C", "D"] as const).map(
    (g) => {
      const entry = gradeCounts.get(g) ?? { count: 0, color: "#64748B" };
      return {
        grade: g,
        color: entry.color,
        count: entry.count,
        pct: Math.round((entry.count / ranked.length) * 1000) / 10,
      };
    },
  );

  // 종합 히스토그램 (5점 단위, 20개 bin)
  const hist: OverallHist[] = Array.from({ length: 20 }, (_, i) => ({
    bin: i * 5,
    count: 0,
  }));
  for (const v of overallVals) {
    const idx = Math.min(19, Math.floor(v / 5));
    hist[idx]!.count++;
  }

  // 기관별 평균 종합 점수 Top 10 (매물 수 ≥ 20개 기관만)
  const orgMap = new Map<string, { sum: number; count: number }>();
  for (const { p, r } of ranked) {
    const name = p.university_name || p.applicant;
    if (!name || name.length < 2) continue;
    const cur = orgMap.get(name) ?? { sum: 0, count: 0 };
    cur.sum += r.overall;
    cur.count++;
    orgMap.set(name, cur);
  }
  const topOrgs: TopOrg[] = Array.from(orgMap.entries())
    .filter(([, v]) => v.count >= 5)
    .map(([org_name, v]) => ({
      org_name,
      avg_overall: Math.round(v.sum / v.count),
      count: v.count,
    }))
    .sort((a, b) => b.avg_overall - a.avg_overall)
    .slice(0, 12);

  const result: PatentRankStatsResponse = {
    sample_size: ranked.length,
    total_active_pool: totalActive,
    overall: stats(overallVals),
    axes: {
      inv: stats(invVals),
      imp: stats(impVals),
      mkt: stats(mktVals),
      net: stats(netVals),
      com: stats(comVals),
    },
    grade_distribution: gradeDist,
    overall_histogram: hist,
    top_orgs: topOrgs,
    generated_at: new Date().toISOString(),
  };

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
