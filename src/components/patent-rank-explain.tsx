"use client";
import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import type { PatentRow } from "@/lib/types";
import { patentRank, patentRankExplain, AXIS_META } from "@/lib/patent-rank";

interface Props {
  patent: PatentRow;
}

/**
 * "왜 이 점수?" 토글. PatentRankSummary 하단에 들어가 각 축의 raw 입력값과
 * 계산식을 펼쳐 보여줌. 블랙박스 신뢰도 우려 정면 해소.
 */
export function PatentRankExplain({ patent }: Props) {
  const [open, setOpen] = useState(false);
  const detail = patentRank(patent);
  const explanations = patentRankExplain(patent, detail);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand hover:text-brand"
      >
        <HelpCircle size={12} />
        왜 이 점수인가요?
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-[11px] leading-relaxed text-ink-500">
            각 축의 입력값과 계산식입니다. v2에서 일부 변수는 외부 데이터(NTIS·DART
            등) 또는 진짜 PageRank로 교체될 예정입니다.
          </p>
          {explanations.map((e) => {
            const meta = AXIS_META[e.axis];
            const score = detail[e.axis];
            return (
              <div
                key={e.axis}
                className="rounded-md border border-ink-50 bg-ink-50/40 p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-ink-900">
                      {meta.name}
                    </span>
                    <span className="ml-1 text-[10px] text-ink-400">
                      {meta.full}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-brand">
                    {score} / 100
                  </span>
                </div>
                <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  {e.inputs.map((i, idx) => (
                    <div key={idx} className="flex items-baseline gap-2">
                      <dt className="text-ink-500">{i.label}:</dt>
                      <dd className="font-semibold text-ink-900">{i.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[10px] leading-relaxed text-ink-500">
                  <strong className="text-ink-700">계산식:</strong> {e.formula}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
