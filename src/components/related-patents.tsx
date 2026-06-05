import Link from "next/link";
import { getRelatedPatents } from "@/lib/patents";
import type { PatentRow } from "@/lib/types";
import { urgencyLabel } from "@/lib/format";
import { patentRank, patentRankGrade } from "@/lib/patent-rank";

export async function RelatedPatents({ patent }: { patent: PatentRow }) {
  const { sameOrg, sameIpc } = await getRelatedPatents(patent, 6);
  if (sameOrg.length === 0 && sameIpc.length === 0) return null;

  return (
    <section className="space-y-8">
      {sameOrg.length > 0 && (
        <RelatedList
          title={`${patent.university_name || patent.applicant}의 다른 매물`}
          subtitle={`같은 권리자가 보유한 활성 매물 ${sameOrg.length}건`}
          rows={sameOrg}
        />
      )}
      {sameIpc.length > 0 && (
        <RelatedList
          title={`같은 분야 매물 (IPC ${patent.ipc_primary.slice(0, 4)})`}
          subtitle="유사 기술분야의 활성 매물"
          rows={sameIpc}
        />
      )}
    </section>
  );
}

function RelatedList({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: PatentRow[];
}) {
  return (
    <div>
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-xs text-ink-500">{subtitle}</p>
        </div>
      </header>
      <ul className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => {
          const overall = p.patent_rank ?? patentRank(p).overall;
          const grade = p.patent_rank_grade ?? patentRankGrade(overall).grade;
          const gradeColor = patentRankGrade(overall).color;
          const isLow = overall < 35;
          return (
            <li key={p.application_number} className="h-full">
              <Link
                href={`/patent/${encodeURIComponent(p.application_number)}`}
                className="relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                <span
                  className="absolute left-0 top-0 h-full w-0.5"
                  style={{
                    background: isLow ? "#CBD5E1" : gradeColor,
                    opacity: isLow ? 0.4 : 1,
                  }}
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-semibold ${
                        p.urgency === "RED"
                          ? "bg-red-50 text-red-700"
                          : p.urgency === "YELLOW"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {urgencyLabel(p.urgency)}
                    </span>
                    {p.ipc_primary && (
                      <span className="text-ink-300">{p.ipc_primary}</span>
                    )}
                  </div>
                  {isLow ? (
                    <span className="rounded bg-ink-100 px-1.5 py-0.5 font-bold text-ink-500">
                      N/A
                    </span>
                  ) : (
                    <span
                      className="rounded px-1.5 py-0.5 font-bold text-white"
                      style={{ background: gradeColor }}
                    >
                      {grade} {overall}
                    </span>
                  )}
                </div>
                <div className="mt-2 line-clamp-2 text-sm font-semibold text-ink-900">
                  {p.title || p.application_number}
                </div>
                <div className="mt-1 text-xs text-ink-500">
                  청구항 {p.claims_count} · 피인용 {p.citation_count} · 패밀리 {p.family_count}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
