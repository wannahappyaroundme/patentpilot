import { LoiForm } from "@/components/loi-form";

export const metadata = {
  title: "거래 신청 — PatentPilot",
};

export default function ApplyPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const appNo =
    typeof searchParams.appNo === "string" ? searchParams.appNo : undefined;

  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <div className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand">
            매수 거래 신청 (LOI)
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">매물 거래 의향서 보내기</h1>
          <p className="mt-2 text-sm text-ink-500">
            매물 한 건에 대해 매수 의향을 알려주시면 PatentPilot이 매도 기관과
            컨택·협상을 중개합니다. 거래 성사 시에만 매칭 수수료가 발생합니다.
          </p>
        </header>

        <LoiForm defaultAppNo={appNo} />
      </div>
    </div>
  );
}
