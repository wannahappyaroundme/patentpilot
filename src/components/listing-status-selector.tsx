"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "pending", label: "대기 (Pending)", style: "bg-amber-50 text-amber-700" },
  { value: "reviewing", label: "검토중 (Reviewing)", style: "bg-brand-50 text-brand" },
  { value: "listed", label: "등록완료 (Listed)", style: "bg-emerald-50 text-emerald-700" },
  { value: "rejected", label: "거절 (Rejected)", style: "bg-red-50 text-red-700" },
];

interface Props {
  id: number;
  initial: string;
}

export function ListingStatusSelector({ id, initial }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = value;
    setValue(next);
    setError(null);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setValue(prev); // rollback
      setError(err instanceof Error ? err.message : "변경 실패");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand ${current?.style ?? ""}`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
