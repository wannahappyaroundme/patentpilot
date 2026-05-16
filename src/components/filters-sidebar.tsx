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
  { value: "recent", label: "최신 출원순" },
  { value: "citations", label: "피인용 많은순" },
  { value: "claims", label: "청구항 많은순" },
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

  useEffect(() => {
    setUrgency(sp.get("urgency") ?? "ALL");
    setOrg(sp.get("org") ?? "ALL");
    setIpc(sp.get("ipc") ?? "");
    setUniversity(sp.get("university") ?? "");
    setSort(sp.get("sort") ?? "urgency");
  }, [sp]);

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
