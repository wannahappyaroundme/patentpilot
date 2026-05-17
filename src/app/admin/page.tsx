import Link from "next/link";
import { fetchAdminSummary } from "@/lib/admin";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin — PatentPilot",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const { data, error } = await fetchAdminSummary();

  return (
    <div className="py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Admin
          </div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="mt-1 text-sm text-ink-500">
            페이지뷰 · 클릭 · 검색 · 거래 신청 통합 지표
          </p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand">대시보드</span>
          <Link
            href="/admin/applications"
            className="rounded-full px-3 py-1 text-ink-700 hover:bg-ink-50"
          >
            거래 신청
          </Link>
          <Link
            href="/admin/listings"
            className="rounded-full px-3 py-1 text-ink-700 hover:bg-ink-50"
          >
            매물 등록
          </Link>
        </nav>
      </header>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi label="페이지뷰 (24h)" value={data.pv_24h} sub={`7일 ${formatNumber(data.pv_7d)}`} tone="brand" />
            <Kpi label="클릭 (24h)" value={data.click_24h} sub={`7일 ${formatNumber(data.click_7d)}`} tone="emerald" />
            <Kpi label="검색 (7일)" value={data.search_7d} sub="히어로/필터 검색" tone="violet" />
            <Kpi label="거래 신청" value={data.loi_total} sub={`24h ${data.loi_24h} · 7일 ${data.loi_7d}`} tone="amber" />
            <Kpi label="매물 등록" value={data.list_total} sub={`대기 ${data.list_pending} · 7일 ${data.list_7d}`} tone="rose" />
          </section>

          <section className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-base font-bold">최근 14일 페이지뷰 추이</h2>
              <span className="text-xs text-ink-300">일별 합계</span>
            </div>
            <DailyBar rows={data.pv_daily} />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <ListPanel
              title="인기 페이지 (7일)"
              rows={data.top_pages.map((r) => ({ k: r.path, n: r.n }))}
              hint="페이지뷰 기준"
            />
            <ListPanel
              title="클릭 Top (7일)"
              rows={data.top_clicks.map((r) => ({ k: r.target, n: r.n }))}
              hint="target/label 라벨 기준"
            />
            <ListPanel
              title="검색어 Top (30일)"
              rows={data.top_searches.map((r) => ({ k: r.q, n: r.n }))}
              hint="히어로 검색바 입력"
            />
          </section>

          <section className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="text-base font-bold">매물 풀</h2>
            <p className="mt-2 text-sm text-ink-500">
              현재 적재된 매물: <b className="tabular-nums text-ink-900">{formatNumber(data.patents_total)}</b>건
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub: string;
  tone: "brand" | "emerald" | "violet" | "amber" | "rose";
}) {
  const map: Record<typeof tone, string> = {
    brand: "text-brand",
    emerald: "text-emerald-600",
    violet: "text-violet-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="text-xs text-ink-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold tabular-nums ${map[tone]}`}>
        {formatNumber(value)}
      </div>
      <div className="mt-1 text-xs text-ink-400">{sub}</div>
    </div>
  );
}

function DailyBar({ rows }: { rows: Array<{ day: string; n: number }> }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-300">
        아직 데이터가 충분하지 않습니다. 페이지뷰가 쌓이면 여기에 그래프가 나옵니다.
      </p>
    );
  }
  return (
    <div className="flex h-32 items-end gap-1">
      {rows.map((r) => {
        const h = Math.max(3, (r.n / max) * 100);
        return (
          <div key={r.day} className="group relative flex-1">
            <div
              className="rounded-t bg-brand/80 transition hover:bg-brand"
              style={{ height: `${h}%` }}
              title={`${r.day} · ${r.n}`}
            />
            <div className="mt-1 truncate text-center text-[10px] text-ink-400">
              {r.day.slice(5)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListPanel({
  title,
  rows,
  hint,
}: {
  title: string;
  rows: Array<{ k: string; n: number }>;
  hint: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="mb-1 text-base font-bold">{title}</div>
      <div className="mb-4 text-xs text-ink-400">{hint}</div>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-300">데이터 없음</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, idx) => (
            <li key={idx} className="grid grid-cols-[1fr_3rem] items-center gap-3 text-sm">
              <div className="min-w-0">
                <div className="truncate text-ink-900">{r.k || "(빈 값)"}</div>
                <div className="mt-1 h-1.5 rounded bg-ink-50">
                  <div
                    className="h-1.5 rounded bg-brand"
                    style={{ width: `${(r.n / max) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-right tabular-nums text-ink-700">{formatNumber(r.n)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
