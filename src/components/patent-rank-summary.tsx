import type { PatentRow } from "@/lib/types";
import {
  AXIS_META,
  AXIS_WEIGHTS,
  patentRank,
  patentRankGrade,
} from "@/lib/patent-rank";
import { PatentRankRadar } from "./patent-rank-radar";

interface Props {
  patent: PatentRow;
}

export function PatentRankSummary({ patent }: Props) {
  const scores = patentRank(patent);
  const grade = patentRankGrade(scores.overall);

  const axes: Array<keyof typeof AXIS_WEIGHTS> = [
    "inv",
    "imp",
    "mkt",
    "net",
    "com",
  ];

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-ink-900">
            PatentRank
            <span className="ml-2 text-xs font-normal text-ink-400">
              5축 가중 종합 점수
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">
            INV·IMP·MKT·NET·COM — 학술 근거 기반 자체 매물 평가 모델
          </p>
        </div>
      </header>

      <div className="grid items-center gap-6 sm:grid-cols-[280px_1fr]">
        {/* 레이더 */}
        <div className="flex justify-center">
          <PatentRankRadar scores={scores} />
        </div>

        {/* 종합 점수 + 축별 breakdown */}
        <div className="space-y-4">
          <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
            <div className="flex items-baseline gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-black text-white"
                style={{ background: grade.color }}
              >
                {grade.grade}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-black"
                    style={{ color: grade.color }}
                  >
                    {scores.overall}
                  </span>
                  <span className="text-sm text-ink-400">/ 100</span>
                </div>
                <div className="text-xs text-ink-500">{grade.desc}</div>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {axes.map((a) => {
              const meta = AXIS_META[a];
              const value = scores[a];
              const weight = AXIS_WEIGHTS[a];
              return (
                <li key={a}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-ink-700">
                      {meta.name}
                      <span className="ml-1 font-normal text-ink-400">
                        (×{weight.toFixed(2)})
                      </span>
                    </span>
                    <span className="font-mono font-semibold text-brand">
                      {value}
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100"
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <div className="mt-0.5 text-[10px] text-ink-400">
                    {meta.cite}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <footer className="mt-4 rounded-md bg-ink-50/60 p-3 text-[11px] leading-relaxed text-ink-500">
        <strong className="text-ink-700">MVP 한정:</strong> NET 축은 in-degree
        centrality로 PageRank를 근사하며, COM 축은 NTIS 키워드 + 이전 이력으로
        외부 DART/NTIS 데이터를 근사합니다. 가중치(0.25/0.20/0.20/0.20/0.15)는
        프로젝트 내부 문서{" "}
        <code className="rounded bg-white px-1 py-0.5 text-[10px] text-ink-700">
          5축 가중치 스코어 근거.md
        </code>{" "}
        에 정리되어 있습니다.
      </footer>
    </section>
  );
}
