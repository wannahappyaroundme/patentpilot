import Link from "next/link";
import { Battery, Cpu, Pill, Monitor, Sun, Car, Cog, Radio, Ship, Hammer } from "lucide-react";

interface Theme {
  slug: string;
  label: string;
  count: string;
  Icon: typeof Battery;
  bg: string;
  iconColor: string;
}

const THEMES: Theme[] = [
  { slug: "B60L,H01M", label: "배터리·2차전지", count: "8,420", Icon: Battery, bg: "bg-amber-50", iconColor: "text-amber-600" },
  { slug: "H01L,G11C", label: "반도체·메모리", count: "12,360", Icon: Cpu, bg: "bg-brand-50", iconColor: "text-brand" },
  { slug: "A61K,C07K,C12N", label: "바이오·신약", count: "10,830", Icon: Pill, bg: "bg-rose-50", iconColor: "text-rose-600" },
  { slug: "G09G,H01R", label: "디스플레이", count: "5,180", Icon: Monitor, bg: "bg-violet-50", iconColor: "text-violet-600" },
  { slug: "F03D,H02J", label: "에너지·신재생", count: "4,250", Icon: Sun, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { slug: "B60K,B60W,B62D", label: "모빌리티", count: "6,090", Icon: Car, bg: "bg-sky-50", iconColor: "text-sky-600" },
  { slug: "F02C,B64C", label: "항공·방산", count: "1,940", Icon: Cog, bg: "bg-slate-100", iconColor: "text-slate-700" },
  { slug: "H04W,H04L,H04N", label: "통신·미디어", count: "9,750", Icon: Radio, bg: "bg-indigo-50", iconColor: "text-indigo-600" },
  { slug: "B63B,F17C", label: "조선·해양", count: "1,330", Icon: Ship, bg: "bg-cyan-50", iconColor: "text-cyan-600" },
  { slug: "C08F,C08L,C09K", label: "화학·소재", count: "7,610", Icon: Hammer, bg: "bg-orange-50", iconColor: "text-orange-600" },
];

export function ThemeCards() {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">기술분야로 매물 모아보기</h2>
          <p className="mt-1 text-sm text-ink-500">
            IPC 분류 기준 — 대학·정출연 보유 매물을 분야별로
          </p>
        </div>
        <Link href="/themes" className="text-sm font-medium text-brand hover:underline">
          전체 보기 →
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {THEMES.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/market?ipc=${encodeURIComponent(t.slug)}`}
              className="group flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${t.bg}`}>
                <t.Icon size={22} className={t.iconColor} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink-900">{t.label}</div>
                <div className="text-xs tabular-nums text-ink-500">{t.count}건</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
