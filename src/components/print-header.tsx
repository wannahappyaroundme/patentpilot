import { Logo } from "./logo";

interface Props {
  title: string;
  subtitle?: string;
}

/**
 * 인쇄(PDF) 시에만 최상단에 노출되는 헤더.
 * @media print 환경에서 display:block로 보이고, 화면에서는 display:none.
 */
export function PrintHeader({ title, subtitle }: Props) {
  const now = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="print-only mb-4 items-center justify-between border-b-2 border-brand pb-3">
      <div className="flex items-center gap-3">
        <Logo variant="full" height={22} />
        <div className="border-l border-ink-200 pl-3">
          <div className="text-[11px] font-bold text-ink-900">{title}</div>
          {subtitle && (
            <div className="text-[9px] text-ink-500">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="text-right text-[9px] text-ink-500">
        <div>출력일: {now}</div>
        <div>patentpilot.vercel.app</div>
      </div>
    </div>
  );
}
