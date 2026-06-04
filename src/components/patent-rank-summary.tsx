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

      <footer className="mt-4 space-y-2 rounded-md bg-ink-50/60 p-3 text-[11px] leading-relaxed text-ink-500">
        <p>
          <strong className="text-ink-700">⚠ MVP 한정:</strong> IMP·NET 두 축은
          현재 동일한 citation_count 변수를 공유합니다(다중공선성). v2에서 NET을
          진짜 PageRank로 분리, COM은 NTIS·DART 연동 예정. 가중치
          0.25/0.20/0.20/0.20/0.15는 학술 근거 6편이 아닌 내부 트레이드오프
          서술이며 AHP·sensitivity 검증 전입니다.{" "}
          <a
            href="/about/patent-rank"
            className="text-brand hover:underline"
          >
            방법론 페이지 →
          </a>
        </p>
        <p>
          <strong className="text-ink-700">매도자 안내:</strong> 본 점수는 공개
          KIPRIS 시그널 기반이며, 매도 기관이{" "}
          <a href="/list" className="text-brand hover:underline">
            매물 등록
          </a>{" "}
          시 비공개 옵션을 선택하거나{" "}
          <a
            href="mailto:ethos614@gmail.com?subject=PatentRank%20%EB%B9%84%EA%B3%B5%EA%B0%9C%20%EC%9A%94%EC%B2%AD"
            className="text-brand hover:underline"
          >
            ethos614@gmail.com
          </a>
          으로 비공개 요청을 보낼 수 있습니다.
        </p>
      </footer>
    </section>
  );
}
