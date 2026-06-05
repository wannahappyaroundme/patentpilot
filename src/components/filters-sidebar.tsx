"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const URGENCY_OPTS = [
  { value: "ALL", label: "전체" },
  { value: "RED", label: "🔴 긴급" },
  { value: "YELLOW", label: "🟡 임박" },
  { value: "GREEN", label: "🟢 일반" },
];

const ORG_OPTS = [
  { value: "ALL", label: "전체" },
  { value: "UNIV", label: "대학" },
  { value: "GRI", label: "정출연" },
];

const SORT_OPTS = [
  { value: "urgency", label: "긴급도순" },
  { value: "patent_rank", label: "PatentRank 높은순 ⭐" },
  { value: "recent", label: "최신 출원순" },
  { value: "citations", label: "피인용 많은순" },
  { value: "claims", label: "청구항 많은순" },
  { value: "transfers", label: "권리 이동 활발순" },
];

const GRADE_OPTS = [
  { value: "S", label: "S", color: "#7C3AED" },
  { value: "A", label: "A", color: "#006EFF" },
  { value: "B", label: "B", color: "#059669" },
  { value: "C", label: "C", color: "#D97706" },
  { value: "D", label: "D", color: "#64748B" },
];

const IPC_PRESETS = [
  { value: "", label: "전체 IPC" },
  { value: "B60L,H01M", label: "배터리·2차전지" },
  { value: "H01L,G11C", label: "반도체·메모리" },
  { value: "A61K,C07K,C12N", label: "바이오·신약" },
  { value: "G09G", label: "디스플레이" },
  { value: "F03D,H02J", label: "에너지·신재생" },
  { value: "B60K,B60W,B62D", label: "모빌리티" },
  { value: "H04W,H04L,H04N", label: "통신·미디어" },
];

export function FiltersSidebar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [urgency, setUrgency] = useState(sp.get("urgency") ?? "ALL");
  const [org, setOrg] = useState(sp.get("org") ?? "ALL");
  const [ipc, setIpc] = useState(sp.get("ipc") ?? "");
  const [university, setUniversity] = useState(sp.get("university") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "urgency");
  const [grades, setGrades] = useState<string[]>(
    (sp.get("grade") ?? "").split(",").filter(Boolean),
  );

  useEffect(() => {
    setUrgency(sp.get("urgency") ?? "ALL");
    setOrg(sp.get("org") ?? "ALL");
    setIpc(sp.get("ipc") ?? "");
    setUniversity(sp.get("university") ?? "");
    setSort(sp.get("sort") ?? "urgency");
    setGrades((sp.get("grade") ?? "").split(",").filter(Boolean));
  }, [sp]);

  function toggleGrade(g: string) {
    const next = grades.includes(g)
      ? grades.filter((x) => x !== g)
      : [...grades, g];
    apply({ grade: next.join(",") });
  }

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === "ALL") params.delete(k);
      else params.set(k, v);
    });
    params.delete("page");
    router.push(`/market?${params.toString()}`);
  }

  function reset() {
    router.push("/market");
  }

  return (
    <aside className="space-y-6 rounded-2xl border border-ink-100 bg-white p-5">
      <Section title="긴급도">
        <Pills
          value={urgency}
          options={URGENCY_OPTS}
          onChange={(v) => apply({ urgency: v })}
        />
      </Section>

      <Section title="기관 유형">
        <Pills
          value={org}
          options={ORG_OPTS}
          onChange={(v) => apply({ org: v })}
        />
      </Section>

      <Section title="기술분야 (IPC)">
        <select
          value={ipc}
          onChange={(e) => apply({ ipc: e.target.value })}
          className="w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          {IPC_PRESETS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Section>

      <Section title="기관명">
        <input
          type="text"
          value={university}
          placeholder="예: KAIST, ETRI, 연세대학교"
          onChange={(e) => setUniversity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply({ university });
          }}
          onBlur={() => {
            if ((sp.get("university") ?? "") !== university) apply({ university });
          }}
          className="w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none"
        />
      </Section>

      <Section title="PatentRank 등급">
        <div className="flex flex-wrap gap-1.5">
          {GRADE_OPTS.map((g) => {
            const active = grades.includes(g.value);
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => toggleGrade(g.value)}
                aria-pressed={active}
                className="rounded-md px-2.5 py-1 text-xs font-bold transition"
                style={
                  active
                    ? { background: g.color, color: "white" }
                    : {
                        background: "#F1F5F9",
                        color: "#475569",
                        border: `1px solid ${g.color}40`,
                      }
                }
              >
                {g.label}
              </button>
            );
          })}
        </div>
        {grades.length > 0 && (
          <button
            type="button"
            onClick={() => apply({ grade: "" })}
            className="mt-2 text-[10px] text-ink-500 hover:text-brand"
          >
            등급 필터 해제
          </button>
        )}
      </Section>

      <Section title="정렬">
        <select
          value={sort}
          onChange={(e) => apply({ sort: e.target.value })}
          className="w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          {SORT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {(sort === "patent_rank" || grades.length > 0) && (
          <p className="mt-1.5 text-[10px] leading-relaxed text-ink-500">
            ⚠ PatentRank 정렬·필터는 현재 풀 200건 기준 (v2에서 전수 정렬 예정)
          </p>
        )}
      </Section>

      <button
        type="button"
        onClick={reset}
        className="w-full rounded-md border border-ink-100 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
      >
        필터 초기화
      </button>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {title}
      </div>
      {children}
    </div>
  );
}

function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              active
                ? "bg-brand text-white"
                : "bg-ink-50 text-ink-700 hover:bg-ink-100"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
