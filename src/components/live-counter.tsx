import { fetchMarketStats } from "@/lib/stats";
import { formatNumber } from "@/lib/format";

export async function LiveCounter() {
  const s = await fetchMarketStats();
  const items = [
    { label: "전체 매물", value: s.total, color: "text-ink-900" },
    { label: "🔴 긴급", value: s.red, color: "text-red-600" },
    { label: "🟡 임박", value: s.yellow, color: "text-amber-600" },
    { label: "🟢 일반", value: s.green, color: "text-emerald-600" },
    { label: "대학 매물", value: s.univ, color: "text-brand" },
    { label: "정출연 매물", value: s.gri, color: "text-violet-600" },
  ];
  return (
    <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex h-full flex-col justify-between rounded-xl border border-ink-100 bg-white p-4"
        >
          <div className="text-xs text-ink-500">{it.label}</div>
          <div className={`mt-1 text-2xl font-bold tabular-nums ${it.color}`}>
            {formatNumber(it.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
