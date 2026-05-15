import { fetchMarketStats } from "@/lib/stats";
import { formatNumber } from "@/lib/format";

export async function TopOrgs() {
  const s = await fetchMarketStats();
  const top = s.top_universities ?? [];
  const max = top[0]?.n ?? 1;

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold">매물 보유 Top 10 기관</h2>
          <p className="mt-1 text-xs text-ink-500">대학 산학협력단 + 정부출연연구기관 기준</p>
        </div>
        <span className="text-xs text-ink-300">최근 ETL 적재 기준</span>
      </div>
      <ul className="space-y-3">
        {top.map((row, idx) => {
          const pct = (row.n / max) * 100;
          return (
            <li key={row.university_name} className="grid grid-cols-[2rem_14rem_1fr_5rem] items-center gap-3 text-sm">
              <span className="text-ink-300 tabular-nums">{idx + 1}</span>
              <span className="truncate font-medium text-ink-900">{row.university_name}</span>
              <div className="h-2 rounded-full bg-ink-50">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-right tabular-nums text-ink-700">{formatNumber(row.n)}건</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
