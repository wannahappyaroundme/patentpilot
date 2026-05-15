import Link from "next/link";

export const metadata = {
  title: "매물 찾기 — PatentPilot",
};

export default function MarketPage() {
  return (
    <div className="space-y-6 py-12">
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
        <h1 className="text-2xl font-bold">매물 검색 페이지</h1>
        <p className="mt-3 text-sm text-ink-500">
          158,777건의 매물 풀에서 IPC · 기관 · 긴급도로 필터링.
          <br />
          W2 (5/23~5/29)에 작업 예정 — Supabase 적재 완료 후 실시간 검색·필터·정렬·페이지네이션이 들어옵니다.
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
