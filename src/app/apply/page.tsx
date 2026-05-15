import Link from "next/link";

export const metadata = {
  title: "거래 신청 · 매물 등록 — PatentPilot",
};

export default function ApplyPage() {
  return (
    <div className="space-y-6 py-12">
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
        <h1 className="text-2xl font-bold">거래 신청 · 매물 등록</h1>
        <p className="mt-3 text-sm text-ink-500">
          매수 기업의 LOI (거래의향서) 폼과 매도 기관의 매물 등록 폼.
          <br />
          W2 (5/23~5/29)에 Supabase applications 테이블과 연동된 폼이 들어옵니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
