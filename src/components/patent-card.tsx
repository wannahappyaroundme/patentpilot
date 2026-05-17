import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { PatentRow } from "@/lib/types";
import { formatNumber, urgencyLabel } from "@/lib/format";
import { TrackedLink } from "@/components/tracked-link";
import { FavoriteButton } from "@/components/favorite-button";

const URGENCY_STYLE: Record<PatentRow["urgency"], string> = {
  RED: "bg-red-50 text-red-700 ring-red-100",
  YELLOW: "bg-amber-50 text-amber-700 ring-amber-100",
  GREEN: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const ORG_STYLE: Record<PatentRow["org_type"], string> = {
  UNIV: "bg-brand-50 text-brand ring-brand-100",
  GRI: "bg-violet-50 text-violet-700 ring-violet-100",
  OTHER: "bg-ink-50 text-ink-700 ring-ink-100",
};

export function PatentCard({ p }: { p: PatentRow }) {
  const orgLabel =
    p.org_type === "UNIV" ? "대학" : p.org_type === "GRI" ? "정출연" : "기타";
  const remaining =
    p.remaining_years != null && p.remaining_years > 0
      ? `잔여 ${p.remaining_years}년`
      : null;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${URGENCY_STYLE[p.urgency]}`}
          >
            {urgencyLabel(p.urgency)}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${ORG_STYLE[p.org_type]}`}
          >
            {orgLabel}
          </span>
          {p.ipc_primary && (
            <span className="rounded-full bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-700">
              {p.ipc_primary}
            </span>
          )}
          {remaining && (
            <span className="text-xs text-ink-500">{remaining}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <FavoriteButton appNo={p.application_number} />
          {p.kipris_link && (
            <TrackedLink
              href={p.kipris_link}
              external
              event="kipris_open"
              meta={{ appNo: p.application_number, source: "card" }}
              ariaLabel="KIPRIS 원문 새 창"
              className="shrink-0 rounded-md p-1 text-ink-300 hover:bg-ink-50 hover:text-brand"
            >
              <ExternalLink size={16} />
            </TrackedLink>
          )}
        </div>
      </div>

      <Link
        href={`/patent/${encodeURIComponent(p.application_number)}`}
        className="mt-3 flex flex-1 flex-col"
      >
        <h3 className="line-clamp-2 min-h-[2.8em] text-base font-semibold text-ink-900 group-hover:text-brand">
          {p.title || p.application_number}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-ink-500">
          {p.university_name || p.applicant}
        </p>
      </Link>

      <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-ink-50 pt-3 text-xs">
        <Stat label="청구항" value={formatNumber(p.claims_count)} />
        <Stat label="피인용" value={formatNumber(p.citation_count)} />
        <Stat label="패밀리" value={formatNumber(p.family_count)} />
        <Stat
          label="이전이력"
          value={
            p.transfer_count > 0
              ? `${formatNumber(p.transfer_count)}건`
              : "없음"
          }
        />
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-ink-300">
          출원 {p.application_date ?? "—"} · 등록 {p.registration_date ?? "—"}
        </span>
        <div className="flex flex-wrap gap-1">
          {p.transfer_events >= 5 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              🤝 권리이동 {p.transfer_events}회
            </span>
          )}
          {p.applicant.includes(";") && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
              🏢 공동출원
            </span>
          )}
          {p.family_count >= 3 && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand">
              🌐 패밀리 {p.family_count}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-300">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums text-ink-900">
        {value}
      </dd>
    </div>
  );
}
