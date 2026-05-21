import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft } from "lucide-react";

import { getPatentByAppNo } from "@/lib/patents";
import { PatentMeta } from "@/components/patent-meta";
import { MatchCandidates } from "@/components/match-candidates";
import { RelatedPatents } from "@/components/related-patents";
import { TrackedLink } from "@/components/tracked-link";
import { FavoriteButton } from "@/components/favorite-button";
import { PrintButton } from "@/components/print-button";
import { PrintHeader } from "@/components/print-header";
import { PatentRankSummary } from "@/components/patent-rank-summary";
import { ProposalLauncher } from "@/components/proposal-launcher";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { appNo: string };
}) {
  const p = await getPatentByAppNo(decodeURIComponent(params.appNo));
  if (!p) return { title: "매물 — PatentPilot" };
  const desc = `${p.university_name || p.applicant} · ${p.ipc_primary || ""} · 청구항 ${p.claims_count ?? 0}개 · 피인용 ${p.citation_count ?? 0}`;
  return {
    title: `${p.title} — PatentPilot`,
    description: desc,
    openGraph: {
      title: p.title,
      description: desc,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: desc,
    },
  };
}

export default async function PatentDetailPage({
  params,
}: {
  params: { appNo: string };
}) {
  const appNo = decodeURIComponent(params.appNo);
  const p = await getPatentByAppNo(appNo);
  if (!p) notFound();

  return (
    <div className="py-8">
      <PrintHeader
        title="PatentPilot — 매물 정보"
        subtitle={`${p.title} · ${p.application_number}`}
      />
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/market"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brand"
        >
          <ArrowLeft size={16} />
          매물 목록으로
        </Link>
        <PrintButton label="매물 PDF로 저장" target="patent_print" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <PatentMeta p={p} />

          <PatentRankSummary patent={p} />

          <MatchCandidates patent={p} />

          <RelatedPatents patent={p} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start no-print">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              원문 확인
            </div>
            {p.kipris_link ? (
              <TrackedLink
                href={p.kipris_link}
                external
                event="kipris_open"
                meta={{ appNo: p.application_number, source: "detail" }}
                className="mt-3 flex items-center justify-between rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
              >
                KIPRIS 공식 원문 보기
                <ExternalLink size={16} />
              </TrackedLink>
            ) : (
              <p className="mt-3 text-sm text-ink-500">원문 링크가 없습니다.</p>
            )}
            <p className="mt-3 text-xs text-ink-300">
              출원번호 {p.application_number} · 새 창으로 열립니다.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand">
              거래 신청
            </div>
            <p className="mt-2 text-sm text-ink-700">
              매수 의사가 있다면 거래 신청을 보내세요. 매도 기관 컨택과 가격 협상을 PatentPilot이 중개합니다.
            </p>
            <TrackedLink
              href={`/apply?appNo=${encodeURIComponent(p.application_number)}`}
              meta={{ target: "apply_cta", appNo: p.application_number }}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700"
            >
              이 매물 거래 신청하기
            </TrackedLink>
            <ProposalLauncher patent={p} />
            <FavoriteButton
              appNo={p.application_number}
              variant="labeled"
              size={14}
              className="mt-2 w-full justify-center"
            />
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              매물 시그널
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✅</span>
                <span>활성 매물 — 현재 연차료 납부 중</span>
              </li>
              {p.transfer_count === 0 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✅</span>
                  <span>아직 이전 이력 없음 — 협상 여지 큼</span>
                </li>
              )}
              {p.family_count > 0 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">🌐</span>
                  <span>해외 패밀리 {p.family_count}건 — 글로벌 권리 확장</span>
                </li>
              )}
              {p.citation_count >= 5 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">📈</span>
                  <span>피인용 {p.citation_count}건 — 후속 기술 영향력 검증</span>
                </li>
              )}
              {p.rnd_department && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">🏛️</span>
                  <span>{p.rnd_department} 사업 결과물</span>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
