import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { patentRank, patentRankGrade, AXIS_WEIGHTS } from "@/lib/patent-rank";
import type { PatentRow } from "@/lib/types";

export const revalidate = 1800; // 30분 캐시

const FALLBACK_SAMPLE_SIZE = 2000;

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
  bin: number;
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
  is_full_pool: boolean;
  overall: AxisStat;
  axes: Record<keyof typeof AXIS_WEIGHTS, AxisStat>;
  grade_distribution: GradeDist[];
  overall_histogram: OverallHist[];
  top_orgs: TopOrg[];
  generated_at: string;
}

const GRADE_COLORS: Record<string, string> = {
  S: "#7C3AED",
  A: "#006EFF",
  B: "#059669",
  C: "#D97706",
  D: "#64748B",
};

function stats(values: number[]): AxisStat {
  if (values.length === 0) return { mean: 0, median: 0, p25: 0, p75: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    mean: Math.round(sum / sorted.length),
    median: sorted[Math.floor(sorted.length / 2)] ?? 0,
    p25: sorted[Math.floor(sorted.length * 0.25)] ?? 0,
    p75: sorted[Math.floor(sorted.length * 0.75)] ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tryFullPoolStats(sb: any): Promise<PatentRankStatsResponse | null> {
  // 3개 RPC 병렬 호출. ETL 적용 안 됐으면 데이터가 비어 있어 null 반환.
  try {
    const [dist, hist, topOrgs] = await Promise.all([
      sb.rpc("patent_rank_distribution"),
      sb.rpc("patent_rank_histogram"),
      // RPC 인자 타입은 Supabase 자동 생성 타입이 없어 unknown 캐스트
      (sb.rpc as unknown as (
        fn: string,
        params: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: unknown }>)(
        "patent_rank_top_orgs",
        { min_count: 20, top_n: 15 },
      ),
    ]);

    if (dist.error || hist.error || topOrgs.error) return null;
    const distRows = (dist.data ?? []) as Array<{
      total_active: number;
      mean_overall: number;
      median_overall: number;
      p25_overall: number;
      p75_overall: number;
      grade: string;
      grade_count: number;
    }>;
    if (distRows.length === 0) return null;
    const first = distRows[0]!;
    const total = Number(first.total_active);
    if (total === 0) return null;

    const gradeMap = new Map<string, number>();
    for (const r of distRows) gradeMap.set(r.grade, Number(r.grade_count));
    const gradeDist: GradeDist[] = (["S", "A", "B", "C", "D"] as const).map(
      (g) => {
        const c = gradeMap.get(g) ?? 0;
        return {
          grade: g,
          color: GRADE_COLORS[g] ?? "#64748B",
          count: c,
          pct: Math.round((c / total) * 1000) / 10,
        };
      },
    );

    const histRows = (hist.data ?? []) as Array<{
      bin: number;
      count: number;
    }>;
    const histMap = new Map<number, number>();
    for (const h of histRows) histMap.set(Number(h.bin), Number(h.count));
    const overallHistogram: OverallHist[] = Array.from(
      { length: 20 },
      (_, i) => ({ bin: i * 5, count: histMap.get(i * 5) ?? 0 }),
    );

    const orgRows = (topOrgs.data ?? []) as Array<{
      org_name: string;
      avg_overall: number;
      patent_count: number;
    }>;
    const top: TopOrg[] = orgRows.map((o) => ({
      org_name: o.org_name,
      avg_overall: Number(o.avg_overall),
      count: Number(o.patent_count),
    }));

    // 5축 평균은 별도 RPC 없음 → 샘플로 보강 (가벼운 1000건)
    const { data: sampleData } = await sb
      .from("patents")
      .select("*")
      .eq("latest_status", "연차료납부")
      .not("patent_rank", "is", null)
      .order("application_number", { ascending: true })
      .limit(1000);
    const sample = (sampleData ?? []) as PatentRow[];
    const computed = sample.map((p) => patentRank(p));

    return {
      sample_size: total,
      total_active_pool: total,
      is_full_pool: true,
      overall: {
        mean: Math.round(Number(first.mean_overall)),
        median: Number(first.median_overall),
        p25: Number(first.p25_overall),
        p75: Number(first.p75_overall),
      },
      axes: {
        inv: stats(computed.map((r) => r.inv)),
        imp: stats(computed.map((r) => r.imp)),
        mkt: stats(computed.map((r) => r.mkt)),
        net: stats(computed.map((r) => r.net)),
        com: stats(computed.map((r) => r.com)),
      },
      grade_distribution: gradeDist,
      overall_histogram: overallHistogram,
      top_orgs: top,
      generated_at: new Date().toISOString(),
    };
  } catch (e) {
    console.warn("[stats] full-pool RPC 실패, 샘플로 폴백:", e);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sampleStats(sb: any): Promise<PatentRankStatsResponse | null> {
  const { data, error, count } = await sb
    .from("patents")
    .select("*", { count: "exact" })
    .eq("latest_status", "연차료납부")
    .order("application_number", { ascending: true })
    .limit(FALLBACK_SAMPLE_SIZE);

  if (error || !data) return null;
  const rows = data as PatentRow[];
  const totalActive = count ?? rows.length;
  const ranked = rows.map((p) => ({ p, r: patentRank(p) }));

  const gradeCounts = new Map<string, { count: number; color: string }>();
  for (const { r } of ranked) {
    const g = patentRankGrade(r.overall);
    const cur = gradeCounts.get(g.grade) ?? { count: 0, color: g.color };
    cur.count++;
    gradeCounts.set(g.grade, cur);
  }
  const gradeDist: GradeDist[] = (["S", "A", "B", "C", "D"] as const).map(
    (g) => {
      const entry = gradeCounts.get(g) ?? { count: 0, color: GRADE_COLORS[g]! };
      return {
        grade: g,
        color: entry.color,
        count: entry.count,
        pct: Math.round((entry.count / ranked.length) * 1000) / 10,
      };
    },
  );

  const hist: OverallHist[] = Array.from({ length: 20 }, (_, i) => ({
    bin: i * 5,
    count: 0,
  }));
  for (const { r } of ranked) {
    const idx = Math.min(19, Math.floor(r.overall / 5));
    hist[idx]!.count++;
  }

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

  return {
    sample_size: ranked.length,
    total_active_pool: totalActive,
    is_full_pool: false,
    overall: stats(ranked.map((x) => x.r.overall)),
    axes: {
      inv: stats(ranked.map((x) => x.r.inv)),
      imp: stats(ranked.map((x) => x.r.imp)),
      mkt: stats(ranked.map((x) => x.r.mkt)),
      net: stats(ranked.map((x) => x.r.net)),
      com: stats(ranked.map((x) => x.r.com)),
    },
    grade_distribution: gradeDist,
    overall_histogram: hist,
    top_orgs: topOrgs,
    generated_at: new Date().toISOString(),
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

  // ETL이 적용됐으면 전수 통계, 아니면 샘플로 폴백
  const full = await tryFullPoolStats(sb);
  const result = full ?? (await sampleStats(sb));

  if (!result) {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
