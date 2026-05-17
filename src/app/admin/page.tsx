import Link from "next/link";
import { fetchAdminDashboard, type AdminDashboard } from "@/lib/admin";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin Dashboard — PatentPilot",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const { data, error } = await fetchAdminDashboard();

  return (
    <div className="py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Admin
          </div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="mt-1 text-sm text-ink-500">
            DAU/MAU · 트래픽 소스 · 디바이스 · 클릭/검색 통합 지표
          </p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand">
            대시보드
          </span>
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

      {data && <DashboardBody data={data} />}
    </div>
  );
}

function DashboardBody({ data }: { data: AdminDashboard }) {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="DAU (24h)" value={data.dau} sub={`PV ${formatNumber(data.pv_24h)}`} tone="brand" />
        <Kpi label="WAU (7d)" value={data.wau} sub={`PV ${formatNumber(data.pv_7d)}`} tone="emerald" />
        <Kpi label="MAU (30d)" value={data.mau} sub={`PV ${formatNumber(data.pv_30d)}`} tone="violet" />
        <Kpi
          label="거래/매물"
          value={data.loi_total + data.list_total}
          sub={`LOI ${data.loi_total} · 등록 ${data.list_total} (대기 ${data.list_pending})`}
          tone="amber"
        />
      </section>

      <section className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-base font-bold">최근 30일 페이지뷰 / 방문자</h2>
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-brand" /> 페이지뷰
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> 순방문자
            </span>
          </div>
        </div>
        <DailyBars rows={data.by_day} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ListPanel
          title="유입 경로 (30일)"
          subtitle="referrer 도메인 — (direct)는 직접 방문"
          rows={data.top_refs.map((r) => ({ k: r.source, n: r.uv, n2: r.pv }))}
          unit1="방문자"
          unit2="PV"
        />
        <ListPanel
          title="인기 페이지 (7일)"
          subtitle="페이지뷰 + 방문자 기준"
          rows={data.top_paths.map((r) => ({ k: r.path, n: r.pv, n2: r.uv }))}
          unit1="PV"
          unit2="방문자"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <PieLikePanel title="디바이스 (7일)" rows={data.devices.map((r) => ({ k: r.device, n: r.uv }))} />
        <PieLikePanel title="브라우저 (7일)" rows={data.browsers.map((r) => ({ k: r.browser, n: r.uv }))} />
        <PieLikePanel title="OS (7일)" rows={data.os.map((r) => ({ k: r.os, n: r.uv }))} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ListPanel
          title="검색어 Top (30일)"
          subtitle="히어로 검색바 + 자동완성 입력"
          rows={data.top_searches.map((r) => ({ k: r.q, n: r.n }))}
          unit1="회"
        />
        <ListPanel
          title="클릭 Top (7일)"
          subtitle="QuickMenu · KIPRIS · LOI CTA 등 라벨 기준"
          rows={data.top_clicks.map((r) => ({ k: r.target, n: r.n }))}
          unit1="회"
        />
      </section>

      {data.utm.length > 0 && (
        <section className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="text-base font-bold">UTM 캠페인 (30일)</h2>
          <p className="mt-1 text-xs text-ink-500">광고/홍보 링크 추적</p>
          <table className="mt-4 w-full text-sm">
            <thead className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="pb-2">source</th>
                <th className="pb-2">medium</th>
                <th className="pb-2">campaign</th>
                <th className="pb-2 text-right">방문자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {data.utm.map((r, idx) => (
                <tr key={idx} className="text-sm">
                  <td className="py-2">{r.source || "—"}</td>
                  <td className="py-2 text-ink-500">{r.medium || "—"}</td>
                  <td className="py-2 text-ink-500">{r.campaign || "—"}</td>
                  <td className="py-2 text-right tabular-nums">{formatNumber(r.uv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="text-base font-bold">매물 풀</h2>
        <p className="mt-2 text-sm text-ink-500">
          현재 적재된 매물: <b className="tabular-nums text-ink-900">{formatNumber(data.patents_total)}</b>건
        </p>
        <p className="mt-2 text-xs text-ink-400">
          Vercel Analytics + Speed Insights도 별도로 작동 중. https://vercel.com/dashboard 에서 Web Vitals 확인 가능.
        </p>
      </section>
    </>
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
  tone: "brand" | "emerald" | "violet" | "amber";
}) {
  const map: Record<typeof tone, string> = {
    brand: "text-brand",
    emerald: "text-emerald-600",
    violet: "text-violet-600",
    amber: "text-amber-600",
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

function DailyBars({ rows }: { rows: Array<{ day: string; pv: number; uv: number }> }) {
  const maxPv = Math.max(1, ...rows.map((r) => r.pv));
  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-300">
        아직 데이터가 충분하지 않아요. 페이지뷰가 쌓이면 여기에 그래프가 나옵니다.
      </p>
    );
  }
  return (
    <div className="flex h-40 items-end gap-0.5">
      {rows.map((r) => {
        const pvH = Math.max(2, (r.pv / maxPv) * 100);
        const uvH = Math.max(2, (r.uv / maxPv) * 100);
        return (
          <div key={r.day} className="group relative flex flex-1 items-end gap-0.5">
            <div
              className="w-1/2 rounded-t bg-brand/80 transition group-hover:bg-brand"
              style={{ height: `${pvH}%` }}
              title={`${r.day} · PV ${r.pv}`}
            />
            <div
              className="w-1/2 rounded-t bg-emerald-400/80 transition group-hover:bg-emerald-500"
              style={{ height: `${uvH}%` }}
              title={`${r.day} · UV ${r.uv}`}
            />
            <div className="absolute -bottom-5 left-0 right-0 truncate text-center text-[9px] text-ink-400">
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
  subtitle,
  rows,
  unit1,
  unit2,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ k: string; n: number; n2?: number }>;
  unit1: string;
  unit2?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="text-base font-bold">{title}</div>
      <div className="mt-1 text-xs text-ink-400">{subtitle}</div>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-300">데이터 없음</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((r, idx) => (
            <li
              key={idx}
              className="grid grid-cols-[1fr_5rem] items-center gap-3 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate text-ink-900">{r.k || "(빈 값)"}</div>
                <div className="mt-1 h-1.5 rounded bg-ink-50">
                  <div
                    className="h-1.5 rounded bg-brand"
                    style={{ width: `${(r.n / max) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right text-xs text-ink-700">
                <span className="tabular-nums font-semibold">{formatNumber(r.n)}</span>
                <span className="text-ink-300"> {unit1}</span>
                {r.n2 !== undefined && unit2 && (
                  <div className="text-[10px] text-ink-400">
                    {formatNumber(r.n2)} {unit2}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PieLikePanel({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ k: string; n: number }>;
}) {
  const total = rows.reduce((s, r) => s + r.n, 0);
  const PALETTE = ["bg-brand", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-slate-400", "bg-orange-500"];
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="text-base font-bold">{title}</div>
      <div className="mt-1 text-xs text-ink-400">방문자 기준</div>
      {rows.length === 0 || total === 0 ? (
        <p className="mt-4 text-sm text-ink-300">데이터 없음</p>
      ) : (
        <>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-ink-50">
            {rows.map((r, idx) => {
              const pct = (r.n / total) * 100;
              return (
                <div
                  key={idx}
                  className={PALETTE[idx % PALETTE.length]}
                  style={{ width: `${pct}%` }}
                  title={`${r.k}: ${r.n}`}
                />
              );
            })}
          </div>
          <ul className="mt-3 space-y-1.5 text-xs">
            {rows.map((r, idx) => {
              const pct = ((r.n / total) * 100).toFixed(1);
              return (
                <li key={r.k} className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${PALETTE[idx % PALETTE.length]}`}
                  />
                  <span className="flex-1 truncate text-ink-700">{r.k}</span>
                  <span className="tabular-nums text-ink-900">{formatNumber(r.n)}</span>
                  <span className="w-10 text-right tabular-nums text-ink-400">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
