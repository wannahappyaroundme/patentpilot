import type { PatentRow } from "@/lib/types";
import { formatNumber, urgencyLabel } from "@/lib/format";

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

export function PatentMeta({ p }: { p: PatentRow }) {
  const orgLabel =
    p.org_type === "UNIV" ? "대학" : p.org_type === "GRI" ? "정출연" : "기타";

  const facts: Array<[string, string]> = [
    ["출원번호", p.application_number],
    ["출원일", p.application_date ?? "—"],
    ["등록일", p.registration_date ?? "—"],
    ["만료일", p.expiration_date ?? "—"],
    ["권리 잔여", p.remaining_years != null ? `${p.remaining_years}년` : "—"],
    ["최신 상태", p.legal_status || "—"],
    ["주 IPC", p.ipc_primary || "—"],
    ["출원인", p.applicant || "—"],
    ["권리자(기관)", p.university_name || "—"],
    ["R&D 사업명", p.rnd_department || "—"],
  ];

  const stats = [
    { label: "청구항", value: formatNumber(p.claims_count) },
    { label: "피인용", value: formatNumber(p.citation_count) },
    { label: "패밀리", value: formatNumber(p.family_count) },
    {
      label: "이전 이력",
      value: p.transfer_count > 0 ? `${formatNumber(p.transfer_count)}건` : "없음",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${URGENCY_STYLE[p.urgency]}`}
        >
          {urgencyLabel(p.urgency)} 매물
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${ORG_STYLE[p.org_type]}`}
        >
          {orgLabel}
        </span>
        {p.ipc_primary && (
          <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
            {p.ipc_primary}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold leading-snug text-ink-900 sm:text-3xl">
        {p.title || p.application_number}
      </h1>

      <p className="text-sm text-ink-500">
        {p.university_name || p.applicant}
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="rounded-xl border border-ink-100 bg-white p-3">
            <div className="text-xs text-ink-500">{s.label}</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-ink-900">{s.value}</div>
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 rounded-2xl border border-ink-100 bg-white p-5 text-sm sm:grid-cols-2">
        {facts.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 border-b border-ink-50 py-2 last:border-b-0">
            <dt className="text-ink-500">{k}</dt>
            <dd className="text-right text-ink-900">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
