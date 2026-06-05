import { FiltersSidebar } from "@/components/filters-sidebar";
import { PatentCard } from "@/components/patent-card";
import { Pagination } from "@/components/pagination";
import { PrintButton } from "@/components/print-button";
import { PrintHeader } from "@/components/print-header";
import { searchPatents, fetchActivePoolForRanking } from "@/lib/patents";
import { formatNumber } from "@/lib/format";
import type { Urgency, OrgType, PatentRow } from "@/lib/types";
import { patentRank, patentRankGrade } from "@/lib/patent-rank";

export const metadata = {
  title: "매물 찾기 — PatentPilot",
};

export const revalidate = 60;

const RANKING_POOL_SIZE = 200;
const VALID_GRADES = ["S", "A", "B", "C", "D"] as const;
type Grade = (typeof VALID_GRADES)[number];

function asUrgency(v: string | undefined): Urgency | "ALL" {
  return v === "RED" || v === "YELLOW" || v === "GREEN" ? (v as Urgency) : "ALL";
}
function asOrg(v: string | undefined): OrgType | "ALL" {
  return v === "UNIV" || v === "GRI" || v === "OTHER" ? (v as OrgType) : "ALL";
}
function asSort(v: string | undefined) {
  if (
    v === "recent" ||
    v === "citations" ||
    v === "claims" ||
    v === "transfers" ||
    v === "urgency" ||
    v === "patent_rank"
  )
    return v;
  return "urgency" as const;
}
function asGrades(v: string | undefined): Grade[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((g): g is Grade => (VALID_GRADES as readonly string[]).includes(g));
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const sp = (k: string) =>
    typeof searchParams[k] === "string" ? (searchParams[k] as string) : undefined;

  const page = Number(sp("page")) || 1;
  const perPage = 20;
  const sort = asSort(sp("sort"));
  const grades = asGrades(sp("grade"));
  const wantRanking = sort === "patent_rank" || grades.length > 0;

  let rows: PatentRow[] = [];
  let total = 0;
  let usedRankingPool = false;

  if (wantRanking) {
    // PatentRank 기반 정렬·필터: 큰 풀(200건)을 가져와 런타임 계산 → 정렬 → 슬라이스
    usedRankingPool = true;
    const pool = await fetchActivePoolForRanking(
      {
        q: sp("q"),
        urgency: asUrgency(sp("urgency")),
        org: asOrg(sp("org")),
        ipc: sp("ipc"),
        university: sp("university"),
      },
      RANKING_POOL_SIZE,
    );
    let enriched = pool.map((p) => {
      const r = patentRank(p);
      return { p, r, g: patentRankGrade(r.overall).grade };
    });
    if (grades.length > 0) {
      enriched = enriched.filter((e) => grades.includes(e.g as Grade));
    }
    if (sort === "patent_rank") {
      enriched.sort((a, b) => b.r.overall - a.r.overall);
    }
    total = enriched.length;
    const startIdx = (page - 1) * perPage;
    rows = enriched.slice(startIdx, startIdx + perPage).map((e) => e.p);
  } else {
    const result = await searchPatents({
      q: sp("q"),
      urgency: asUrgency(sp("urgency")),
      org: asOrg(sp("org")),
      ipc: sp("ipc"),
      university: sp("university"),
      sort,
      page,
      perPage,
    });
    rows = result.rows;
    total = result.total;
  }

  function buildHref(p: number): string {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (typeof v === "string" && v) params.set(k, v);
    });
    params.set("page", String(p));
    return `/market?${params.toString()}`;
  }

  return (
    <div className="py-8">
      <PrintHeader
        title="PatentPilot — 매물 검색 결과"
        subtitle={`총 ${formatNumber(total)}건 · 필터: urgency=${sp("urgency") ?? "ALL"} org=${sp("org") ?? "ALL"} ipc=${sp("ipc") ?? "ALL"} q=${sp("q") ?? "-"} sort=${sort}${grades.length ? ` grade=${grades.join(",")}` : ""}`}
      />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">매물 찾기</h1>
          <p className="mt-1 text-sm text-ink-500">
            연차료 납부 중인 활성 매물 풀에서 검색 · 총{" "}
            <span className="font-semibold tabular-nums text-ink-900">
              {formatNumber(total)}
            </span>
            건
            {usedRankingPool && (
              <span className="ml-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                PatentRank 정렬·필터 적용 (풀 {RANKING_POOL_SIZE}건 기준)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sp("q") && (
            <div className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand">
              검색어: <b>{sp("q")}</b>
            </div>
          )}
          <PrintButton label="PDF로 저장" target="market_print" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="no-print">
          <FiltersSidebar />
        </div>

        <section className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
              <div className="text-base font-semibold">검색 결과가 없습니다</div>
              <p className="mt-2 text-sm text-ink-500">
                필터를 완화하거나 검색어를 다시 입력해보세요.
              </p>
            </div>
          ) : (
            <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((p) => (
                <li key={p.application_number} className="h-full">
                  <PatentCard p={p} />
                </li>
              ))}
            </ul>
          )}

          <div className="no-print">
            <Pagination
              page={page}
              perPage={perPage}
              total={total}
              buildHref={buildHref}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
