"use client";
import { Printer } from "lucide-react";
import { track } from "@/lib/analytics";

interface Props {
  label?: string;
  target?: string;
  className?: string;
}

export function PrintButton({ label = "PDF로 저장", target = "compare_print", className }: Props) {
  function onClick() {
    track("click", { target });
    window.print();
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`no-print inline-flex items-center gap-2 rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50 ${className ?? ""}`}
    >
      <Printer size={14} />
      {label}
    </button>
  );
}
