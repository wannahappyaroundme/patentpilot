import { FiltersSidebar } from "@/components/filters-sidebar";
import { PatentCard } from "@/components/patent-card";
import { Pagination } from "@/components/pagination";
import { PrintButton } from "@/components/print-button";
import { PrintHeader } from "@/components/print-header";
import { searchPatents } from "@/lib/patents";
import { formatNumber } from "@/lib/format";
import type { Urgency, OrgType } from "@/lib/types";

export const metadata = {
  title: "매물 찾기 — PatentPilot",
};

export const revalidate = 60;

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
    v === "urgency"
  )
    return v;
  return "urgency" as const;
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const sp = (k: string) =>
    typeof searchParams[k] === "string" ? (searchParams[k] as string) : undefined;

  const page = Number(sp("page")) || 1;
  const result = await searchPatents({
    q: sp("q"),
    urgency: asUrgency(sp("urgency")),
    org: asOrg(sp("org")),
    ipc: sp("ipc"),
    university: sp("university"),
    sort: asSort(sp("sort")),
    page,
    perPage: 20,
  });

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
        subtitle={`총 ${formatNumber(result.total)}건 · 필터: urgency=${sp("urgency") ?? "ALL"} org=${sp("org") ?? "ALL"} ipc=${sp("ipc") ?? "ALL"} q=${sp("q") ?? "-"}`}
      />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">매물 찾기</h1>
          <p className="mt-1 text-sm text-ink-500">
            연차료 납부 중인 활성 매물 풀에서 검색 · 총{" "}
            <span className="font-semibold tabular-nums text-ink-900">
              {formatNumber(result.total)}
            </span>
            건
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
          {result.rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
              <div className="text-base font-semibold">검색 결과가 없습니다</div>
              <p className="mt-2 text-sm text-ink-500">
                필터를 완화하거나 검색어를 다시 입력해보세요.
              </p>
            </div>
          ) : (
            <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.rows.map((p) => (
                <li key={p.application_number} className="h-full">
                  <PatentCard p={p} />
                </li>
              ))}
            </ul>
          )}

          <div className="no-print">
            <Pagination
              page={result.page}
              perPage={result.perPage}
              total={result.total}
              buildHref={buildHref}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
