import Link from "next/link";
import { getSimilarRankPatents } from "@/lib/patents";
import { patentRank, patentRankGrade } from "@/lib/patent-rank";
import type { PatentRow } from "@/lib/types";

/**
 * 비슷한 PatentRank 점수대(±5점)에서 같은 IPC 섹션의 매물 6건.
 * 사전 계산 patent_rank 컬럼이 있는 경우에만 노출.
 */
export async function SimilarRankPatents({ patent }: { patent: PatentRow }) {
  if (patent.patent_rank == null) return null;
  const rows = await getSimilarRankPatents(patent, 6);
  if (rows.length === 0) return null;

  const overall = patent.patent_rank;
  const minScore = Math.max(0, overall - 5);
  const maxScore = Math.min(100, overall + 5);
  const grade = patent.patent_rank_grade ?? patentRankGrade(overall).grade;

  return (
    <section>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">비슷한 PatentRank 매물</h2>
          <p className="mt-1 text-xs text-ink-500">
            종합 {minScore}~{maxScore}점 ({grade}등급 인근) · 같은 기술 섹션 · {rows.length}건
          </p>
        </div>
      </header>
      <ul className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => {
          const o = p.patent_rank ?? patentRank(p).overall;
          const g = p.patent_rank_grade ?? patentRankGrade(o).grade;
          const color = patentRankGrade(o).color;
          return (
            <li key={p.application_number} className="h-full">
              <Link
                href={`/patent/${encodeURIComponent(p.application_number)}`}
                className="relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                <span
                  className="absolute left-0 top-0 h-full w-0.5"
                  style={{ background: color }}
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between text-[10px]">
                  <span className="rounded-full bg-ink-50 px-2 py-0.5 font-medium text-ink-700">
                    {p.ipc_primary}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 font-bold text-white"
                    style={{ background: color }}
                  >
                    {g} {o}
                  </span>
                </div>
                <div className="mt-2 line-clamp-2 text-sm font-semibold text-ink-900">
                  {p.title || p.application_number}
                </div>
                <div className="mt-1 line-clamp-1 text-xs text-ink-500">
                  {p.university_name || p.applicant}
                </div>
                <div className="mt-1.5 text-[10px] text-ink-400">
                  청구항 {p.claims_count} · 피인용 {p.citation_count} · 패밀리 {p.family_count}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
