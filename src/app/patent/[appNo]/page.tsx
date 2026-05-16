import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft } from "lucide-react";

import { getPatentByAppNo } from "@/lib/patents";
import { PatentMeta } from "@/components/patent-meta";
import { MatchCandidates } from "@/components/match-candidates";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { appNo: string };
}) {
  const p = await getPatentByAppNo(decodeURIComponent(params.appNo));
  if (!p) return { title: "매물 — PatentPilot" };
  return {
    title: `${p.title} — PatentPilot`,
    description: `${p.university_name || p.applicant} · ${p.application_number}`,
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
      <Link
        href="/market"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brand"
      >
        <ArrowLeft size={16} />
        매물 목록으로
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <PatentMeta p={p} />

          <MatchCandidates patent={p} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              원문 확인
            </div>
            {p.kipris_link ? (
              <a
                href={p.kipris_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-between rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
              >
                KIPRIS 공식 원문 보기
                <ExternalLink size={16} />
              </a>
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
            <Link
              href={`/apply?appNo=${encodeURIComponent(p.application_number)}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700"
            >
              이 매물 거래 신청하기
            </Link>
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
