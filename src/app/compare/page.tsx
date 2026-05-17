import { CompareView } from "@/components/compare-view";
import { PrintButton } from "@/components/print-button";

export const metadata = {
  title: "매물 비교 — PatentPilot",
};

export default function ComparePage() {
  return (
    <div className="py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">매물 비교</h1>
          <p className="mt-1 text-sm text-ink-500">
            담은 매물을 한 화면에서 가로로 비교합니다. 청구항·피인용·패밀리는 최대값이 강조됩니다.
          </p>
        </div>
        <PrintButton label="PDF로 저장" />
      </header>
      <CompareView />
    </div>
  );
}
