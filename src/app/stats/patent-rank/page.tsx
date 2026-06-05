import Link from "next/link";
import { headers } from "next/headers";
import type { PatentRankStatsResponse } from "@/app/api/stats/patent-rank/route";
import { AXIS_META, AXIS_WEIGHTS } from "@/lib/patent-rank";
import { KIPRIS_SYNC_DATE } from "@/lib/data-version";

export const metadata = {
  title: "PatentRank 매물 풀 통계",
  description:
    "PatentPilot 활성 매물 풀의 PatentRank 5축 점수 분포, 등급 분포, 기관별 평균 점수 통계.",
};

export const revalidate = 1800;

async function fetchStats(): Promise<PatentRankStatsResponse | null> {
  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const url = `${proto}://${host}/api/stats/patent-rank`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    return (await res.json()) as PatentRankStatsResponse;
  } catch {
    return null;
  }
}

export default async function PatentRankStatsPage() {
  const stats = await fetchStats();

  if (!stats) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="text-2xl font-bold">통계를 불러올 수 없습니다</h1>
        <p className="mt-3 text-sm text-ink-500">
          Supabase 연결을 확인하거나 잠시 후 다시 시도해주세요.
        </p>
        <Link href="/about/patent-rank" className="mt-6 inline-flex text-brand hover:underline">
          ← PatentRank 방법론 페이지로
        </Link>
      </div>
    );
  }

  const axes = Object.keys(AXIS_WEIGHTS) as Array<keyof typeof AXIS_WEIGHTS>;
  const maxHistCount = Math.max(...stats.overall_histogram.map((h) => h.count), 1);
  const maxGradeCount = Math.max(...stats.grade_distribution.map((g) => g.count), 1);

  return (
    <article className="mx-auto max-w-5xl py-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Pool Quality Snapshot
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          PatentRank 매물 풀 통계
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          PatentPilot 활성 매물 풀의 5축 점수가 어떻게 분포하는지, 어느 기관의
          매물이 평균적으로 더 높은 점수를 받는지 한 화면에 정리합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            샘플 {stats.sample_size.toLocaleString()}건 · 활성 풀{" "}
            {stats.total_active_pool.toLocaleString()}건
          </span>
          <span className="rounded-full bg-ink-50 px-3 py-1 font-medium text-ink-600">
            KIPRIS 동기화: {KIPRIS_SYNC_DATE}
          </span>
        </div>
      </header>

      {/* 종합 점수 KPI */}
      <section className="mb-10 grid gap-3 sm:grid-cols-4">
        <KpiCard label="평균" value={stats.overall.mean} suffix="점" />
        <KpiCard label="중앙값" value={stats.overall.median} suffix="점" />
        <KpiCard label="하위 25%" value={stats.overall.p25} suffix="점" />
        <KpiCard label="상위 25%" value={stats.overall.p75} suffix="점" />
      </section>

      {/* 종합 점수 히스토그램 */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-ink-900">종합 점수 분포</h2>
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="flex h-48 items-end gap-1">
            {stats.overall_histogram.map((h, i) => {
              const heightPct = (h.count / maxHistCount) * 100;
              const isMid = h.bin >= 50 && h.bin < 65;
              const isHigh = h.bin >= 65;
              const color = isHigh ? "#006EFF" : isMid ? "#059669" : "#CBD5E1";
              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center justify-end"
                >
                  <span className="text-[9px] text-ink-400">
                    {h.count > 0 ? h.count : ""}
                  </span>
                  <div
                    title={`${h.bin}~${h.bin + 5}점: ${h.count}건`}
                    style={{
                      height: `${heightPct}%`,
                      minHeight: h.count > 0 ? 2 : 0,
                      background: color,
                    }}
                    className="w-full rounded-t transition hover:brightness-110"
                  />
                  {i % 4 === 0 && (
                    <span className="mt-1 text-[10px] text-ink-500">
                      {h.bin}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-ink-500">
            가로축: 종합 점수 (5점 단위) · 세로축: 매물 수 · 청색 = 65점 이상(A·S
            등급) · 녹색 = 50~64점(B 등급)
          </p>
        </div>
      </section>

      {/* 등급 분포 */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-ink-900">등급 분포</h2>
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="space-y-3">
            {stats.grade_distribution.map((g) => (
              <div key={g.grade} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-black text-white"
                  style={{ background: g.color }}
                >
                  {g.grade}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-ink-700">
                      {g.count.toLocaleString()}건
                    </span>
                    <span className="font-mono text-ink-500">{g.pct}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink-50">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(g.count / maxGradeCount) * 100}%`,
                        background: g.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5축 평균 */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-ink-900">5축 평균 점수</h2>
        <div className="grid gap-3 sm:grid-cols-5">
          {axes.map((a) => {
            const stat = stats.axes[a];
            const meta = AXIS_META[a];
            return (
              <div
                key={a}
                className="rounded-xl border border-ink-100 bg-white p-4 text-center"
              >
                <div className="text-xs font-semibold text-ink-500">
                  {meta.name}
                </div>
                <div className="mt-1 text-2xl font-bold text-brand">
                  {stat.mean}
                </div>
                <div className="text-[10px] text-ink-400">
                  중앙 {stat.median} · P25 {stat.p25} · P75 {stat.p75}
                </div>
                <div className="mt-2 text-[10px] text-ink-300">
                  ×{AXIS_WEIGHTS[a].toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 기관별 평균 Top */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-ink-900">
          기관별 평균 PatentRank Top {stats.top_orgs.length}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2.5">#</th>
                <th className="px-4 py-2.5">기관</th>
                <th className="px-4 py-2.5 text-right">샘플 매물</th>
                <th className="px-4 py-2.5 text-right">평균 점수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {stats.top_orgs.map((o, i) => (
                <tr key={o.org_name}>
                  <td className="px-4 py-2.5 text-xs text-ink-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-semibold text-ink-900">
                    <Link
                      href={`/market?university=${encodeURIComponent(o.org_name)}`}
                      className="hover:text-brand"
                    >
                      {o.org_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-ink-700">
                    {o.count}건
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-brand">
                    {o.avg_overall}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-500">
          ※ 본 통계는 활성 매물 풀 중 출원번호 기준 결정적 샘플 {stats.sample_size.toLocaleString()}건이며,
          전수 통계는 v2의 patents.patent_rank 컬럼 사전 계산 후 제공됩니다.
        </p>
      </section>

      <footer className="mt-12 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-6 text-sm">
        <Link href="/about/patent-rank" className="text-brand hover:underline">
          ← PatentRank 방법론 페이지
        </Link>
        <span className="text-ink-300">·</span>
        <Link href="/market" className="text-ink-500 hover:text-brand">
          매물 찾기 →
        </Link>
      </footer>
    </article>
  );
}

function KpiCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </div>
      <div className="mt-1 text-3xl font-black text-brand">
        {value}
        {suffix && <span className="text-base font-normal text-ink-400">{suffix}</span>}
      </div>
    </div>
  );
}
