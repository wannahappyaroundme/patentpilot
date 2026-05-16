"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, X, BookmarkX } from "lucide-react";
import { readFavorites, subscribeFavorites, toggleFavorite } from "@/lib/favorites";
import { formatNumber, urgencyLabel } from "@/lib/format";
import { track } from "@/lib/analytics";
import type { PatentRow } from "@/lib/types";

const URGENCY_CHIP: Record<PatentRow["urgency"], string> = {
  RED: "bg-red-50 text-red-700 ring-red-100",
  YELLOW: "bg-amber-50 text-amber-700 ring-amber-100",
  GREEN: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const ORG_CHIP: Record<PatentRow["org_type"], string> = {
  UNIV: "bg-brand-50 text-brand ring-brand-100",
  GRI: "bg-violet-50 text-violet-700 ring-violet-100",
  OTHER: "bg-ink-50 text-ink-700 ring-ink-100",
};

export function CompareView() {
  const [ids, setIds] = useState<string[]>([]);
  const [rows, setRows] = useState<PatentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIds(readFavorites());
    return subscribeFavorites(setIds);
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/patents?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [ids]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center text-sm text-ink-500">
        불러오는 중...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
        <BookmarkX size={36} className="mx-auto text-ink-300" />
        <h2 className="mt-3 text-base font-semibold">담은 매물이 없어요</h2>
        <p className="mt-2 text-sm text-ink-500">
          매물 카드/상세에서 <b>북마크 아이콘</b>을 눌러 비교할 매물을 담아주세요.
          <br />
          최대 20건까지 한 번에 비교할 수 있어요.
        </p>
        <Link
          href="/market"
          className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          매물 찾으러 가기
        </Link>
      </div>
    );
  }

  function removeOne(appNo: string) {
    toggleFavorite(appNo);
    track("click", { target: "compare_remove", appNo });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th className="sticky left-0 z-10 bg-ink-50/60 px-4 py-3">항목</th>
            {rows.map((p) => (
              <th key={p.application_number} className="min-w-[14rem] px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-x-1">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${URGENCY_CHIP[p.urgency]}`}
                    >
                      {urgencyLabel(p.urgency)}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${ORG_CHIP[p.org_type]}`}
                    >
                      {p.org_type === "GRI" ? "정출연" : p.org_type === "UNIV" ? "대학" : "기타"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOne(p.application_number)}
                    aria-label="비교에서 제거"
                    className="rounded p-0.5 text-ink-300 hover:bg-ink-50 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-50">
          <ComparisonRow
            label="제목"
            rows={rows}
            cell={(p) => (
              <Link
                href={`/patent/${encodeURIComponent(p.application_number)}`}
                className="line-clamp-3 font-semibold text-ink-900 hover:text-brand"
              >
                {p.title || p.application_number}
              </Link>
            )}
          />
          <ComparisonRow
            label="권리자"
            rows={rows}
            cell={(p) => (
              <span className="text-ink-700">{p.university_name || p.applicant}</span>
            )}
          />
          <ComparisonRow
            label="주 IPC"
            rows={rows}
            cell={(p) => (
              <span className="rounded-full bg-ink-50 px-2 py-0.5 text-xs">{p.ipc_primary || "—"}</span>
            )}
          />
          <ComparisonRow label="출원일" rows={rows} cell={(p) => p.application_date ?? "—"} />
          <ComparisonRow label="등록일" rows={rows} cell={(p) => p.registration_date ?? "—"} />
          <ComparisonRow
            label="권리 잔여"
            rows={rows}
            cell={(p) => (p.remaining_years != null ? `${p.remaining_years}년` : "—")}
          />
          <ComparisonRow
            label="청구항"
            rows={rows}
            cell={(p) => formatNumber(p.claims_count)}
            highlightMax
          />
          <ComparisonRow
            label="피인용"
            rows={rows}
            cell={(p) => formatNumber(p.citation_count)}
            highlightMax
          />
          <ComparisonRow
            label="패밀리"
            rows={rows}
            cell={(p) => formatNumber(p.family_count)}
            highlightMax
          />
          <ComparisonRow
            label="권리 이동"
            rows={rows}
            cell={(p) => `${p.transfer_events}회`}
          />
          <ComparisonRow
            label="공동출원"
            rows={rows}
            cell={(p) => (p.applicant.includes(";") ? "🏢 공동" : "—")}
          />
          <ComparisonRow
            label="R&D 사업"
            rows={rows}
            cell={(p) => p.rnd_department || "—"}
          />
          <ComparisonRow
            label="KIPRIS"
            rows={rows}
            cell={(p) =>
              p.kipris_link ? (
                <a
                  href={p.kipris_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand hover:underline"
                  onClick={() =>
                    track("kipris_open", { appNo: p.application_number, source: "compare" })
                  }
                >
                  원문 보기 <ExternalLink size={12} />
                </a>
              ) : (
                "—"
              )
            }
          />
          <ComparisonRow
            label="거래 신청"
            rows={rows}
            cell={(p) => (
              <Link
                href={`/apply?appNo=${encodeURIComponent(p.application_number)}`}
                className="inline-block rounded-md bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-700"
              >
                LOI 작성
              </Link>
            )}
          />
        </tbody>
      </table>
    </div>
  );
}

function ComparisonRow({
  label,
  rows,
  cell,
  highlightMax,
}: {
  label: string;
  rows: PatentRow[];
  cell: (p: PatentRow) => React.ReactNode;
  highlightMax?: boolean;
}) {
  let maxVal = -Infinity;
  if (highlightMax) {
    const numeric = rows.map((p) => {
      const v = cell(p);
      const n = typeof v === "string" ? Number(v.replace(/[^0-9.-]/g, "")) : NaN;
      return Number.isFinite(n) ? n : -Infinity;
    });
    maxVal = Math.max(...numeric);
  }
  return (
    <tr className="align-top">
      <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-medium text-ink-500">
        {label}
      </th>
      {rows.map((p) => {
        let isMax = false;
        if (highlightMax) {
          const v = cell(p);
          const n = typeof v === "string" ? Number(v.replace(/[^0-9.-]/g, "")) : NaN;
          isMax = Number.isFinite(n) && n === maxVal && maxVal > 0;
        }
        return (
          <td
            key={p.application_number}
            className={`px-4 py-3 text-sm ${isMax ? "bg-brand-50/40 font-semibold text-brand" : "text-ink-900"}`}
          >
            {cell(p)}
          </td>
        );
      })}
    </tr>
  );
}
