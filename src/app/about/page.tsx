import Link from "next/link";

export const metadata = {
  title: "서비스 소개 — PatentPilot",
};

export default function AboutPage() {
  return (
    <div className="space-y-12 py-12">
      <section className="max-w-3xl">
        <div className="inline-block rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand">
          2026 지식재산 데이터 활용 창업 경진대회 출품작
        </div>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          PatentPilot은 잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿입니다.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">
          대학·정출연이 보유한 R&D 특허 37만 건 중, 출원 15~20년차에 도달해 연차료 부담이 큰 매물 약 16만 건을
          데이터로 직접 식별합니다. 매도 동기가 강한 매물을 기술이 필요한 기업과 매칭하고, 거래 성사 시 매칭
          수수료로 수익화합니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card num="01" title="유지비 시그널" body="등록 결정 + 연차료 납부중 + 거래 이력 0건. 매도 동기가 가장 강한 시점의 매물을 자동 큐레이션." />
        <Card num="02" title="2-사이드 매칭" body="대학·정출연 TLO ↔ 기업 R&D 팀. IPC·기업 R&D 규모·협력 이력 3축 가중치로 매수 후보 Top 5 추천." />
        <Card num="03" title="KIPRIS 직접 연결" body="모든 매물의 원문은 KIPRIS 공식 페이지로 새 창 연결. 청구항·서지 정보 가공 없음." />
      </section>

      <section className="rounded-2xl border border-ink-100 bg-ink-50/50 p-8">
        <h2 className="text-xl font-bold">데이터</h2>
        <ul className="mt-4 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
          <li>· KIPRIS Plus API로 확보한 대학·정출연 특허 <b>370,666건</b></li>
          <li>· 출원 2006~2022년 매물 풀 <b>158,777건</b></li>
          <li>· 🔴 긴급(06~11년) 24,677건 · 🟡 임박(12~17년) 57,933건 · 🟢 일반 76,167건</li>
          <li>· 대학 105,562건 · 정출연 53,039건</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-8">
        <h2 className="text-xl font-bold">문의 · 업무 협약 · 데이터 문의</h2>
        <p className="mt-3 text-sm text-ink-700">
          서비스 협업, 매물 데이터 제휴, TLO/정출연 파트너십, 매수 기업 확장, 투자/엑셀러레이팅, 미디어 인터뷰 등 모든 문의는 아래 이메일로 보내주세요.
        </p>
        <a
          href="mailto:ethos614@gmail.com?subject=PatentPilot%20%EB%AC%B8%EC%9D%98"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          📧 ethos614@gmail.com 으로 문의하기
        </a>
        <p className="mt-3 text-xs text-ink-500">영업일 기준 2일 이내 회신드립니다.</p>
      </section>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          매물 찾으러 가기
        </Link>
      </div>
    </div>
  );
}

function Card({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="text-xs font-bold tracking-widest text-brand">{num}</div>
      <div className="mt-2 text-base font-semibold">{title}</div>
      <p className="mt-2 text-sm text-ink-500">{body}</p>
    </div>
  );
}
