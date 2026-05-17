"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  endpoint: string;
  label?: string;
  confirmText?: string;
}

export function AdminDeleteButton({
  endpoint,
  label = "삭제",
  confirmText = "정말 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!window.confirm(confirmText)) return;
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `삭제 실패 (HTTP ${res.status})`);
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 실패");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        {label}
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
