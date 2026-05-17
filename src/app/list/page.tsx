import { ListingForm } from "@/components/listing-form";

export const metadata = {
  title: "매물 등록 — PatentPilot",
};

export default function ListPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <div className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            매도자 매물 등록 (TLO · 정출연)
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            잠자는 매물, PatentPilot에 등록하세요
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            등록된 매물은 운영팀 검토 후 매수 후보 기업과 자동 매칭됩니다.
            <br />
            거래 성사 시에만 매칭 수수료가 발생합니다.
          </p>
        </header>

        <ListingForm />

        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 text-sm text-ink-700">
          <div className="font-semibold text-brand">💡 어떤 매물이 좋은가요?</div>
          <ul className="mt-2 space-y-1 text-xs">
            <li>· 등록 결정 + 연차료 납부중 + 거래 이력 없음</li>
            <li>· 권리 잔여 기간이 길거나 해외 패밀리 보유</li>
            <li>· 청구항·피인용 지표가 풍부한 매물</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
