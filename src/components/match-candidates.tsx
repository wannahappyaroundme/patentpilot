import { matchCompanies } from "@/lib/matching";
import type { PatentRow } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";

export async function MatchCandidates({ patent }: { patent: PatentRow }) {
  const candidates = await matchCompanies(patent, 5);

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold">매수 후보 기업 Top {candidates.length || 5}</h2>
          <p className="mt-1 text-xs text-ink-500">
            IPC 적합도 (60%) · R&D 규모 (20%) · 협력 이력 (20% — Phase 2) 가중치
          </p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          이 IPC에 매핑된 매수 후보 기업이 아직 시드에 없습니다. 시드를 보강하거나 거래 신청으로 직접 컨택을 요청해보세요.
        </div>
      ) : (
        <ol className="space-y-3">
          {candidates.map((c, idx) => (
            <li
              key={c.company_id}
              className="flex items-center gap-4 rounded-xl border border-ink-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-base font-semibold text-ink-900">
                    {c.name}
                  </div>
                  <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-medium text-ink-700">
                    {c.industry}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                  {c.description} · 매출 {c.revenue_band}
                </p>
                <p className="mt-1 text-xs text-ink-300">
                  매칭 근거: IPC <b>{c.matched_ipc}</b> 가중치 {c.ipc_weight.toFixed(1)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-ink-300">매칭 점수</div>
                  <div className="text-xl font-bold tabular-nums text-brand">{c.score}</div>
                </div>
                {c.website && (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-ink-300 hover:bg-ink-50 hover:text-brand"
                    aria-label={`${c.name} 웹사이트`}
                  >
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
