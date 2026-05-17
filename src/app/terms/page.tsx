import Link from "next/link";

export const metadata = {
  title: "이용약관 — PatentPilot",
  description:
    "PatentPilot 서비스 이용약관. 서비스 목적, 이용자 의무, 책임 한계, 분쟁 해결을 안내합니다.",
};

const LAST_UPDATED = "2026-05-17";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Terms of Service
        </p>
        <h1 className="mt-1 text-3xl font-bold">이용약관</h1>
        <p className="mt-2 text-sm text-ink-500">최종 개정일: {LAST_UPDATED}</p>
      </header>

      <Section title="제1조 (목적)">
        <p>
          본 약관은 TreeO(이하 &ldquo;운영자&rdquo;)가 제공하는 PatentPilot
          서비스(이하 &ldquo;서비스&rdquo;)의 이용 조건과 절차, 이용자의 권리·의무 및
          책임 사항을 규정함을 목적으로 합니다.
        </p>
      </Section>

      <Section title="제2조 (용어의 정의)">
        <ul>
          <li><b>서비스</b>: 한국 R&amp;D 특허 매물 발굴·매칭·거래 신청 중개 플랫폼</li>
          <li><b>이용자</b>: 본 약관에 따라 서비스를 이용하는 매수자(기업) 및 매도자(TLO·정출연)</li>
          <li><b>매물</b>: 운영자가 KIPRIS Plus 데이터를 기반으로 큐레이션한 R&amp;D 특허 정보</li>
          <li><b>거래 신청 (LOI)</b>: 매수 의향을 운영자에게 전달하는 비강제 의사 표시</li>
          <li><b>매칭 수수료</b>: 거래 성사 시 양측이 부담하는 운영자 보수</li>
        </ul>
      </Section>

      <Section title="제3조 (약관의 효력 및 변경)">
        <ol>
          <li>본 약관은 이용자가 서비스에 접속하거나 거래 신청을 제출함과 동시에 동의한 것으로 간주합니다.</li>
          <li>운영자는 관계 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 사이트에 7일 이상 사전 공지합니다.</li>
        </ol>
      </Section>

      <Section title="제4조 (서비스의 내용)">
        <ol>
          <li>매물 검색·필터·AI 자연어 검색</li>
          <li>매물 상세 정보 제공 및 KIPRIS 원문 연결</li>
          <li>매수 후보 기업 자동 매칭 (IPC 적합도 · 매출 규모 · 협력 이력)</li>
          <li>거래 신청(LOI) 및 매물 등록 접수</li>
          <li>매칭 중개 및 양측 협상 지원</li>
        </ol>
      </Section>

      <Section title="제5조 (이용자의 의무)">
        <ul>
          <li>이용자는 서비스 제출 시 사실에 근거한 정확한 정보를 제공해야 합니다.</li>
          <li>타인의 개인정보 또는 영업비밀을 도용하거나 권한 없이 활용해서는 안 됩니다.</li>
          <li>서비스를 통해 얻은 매물 정보를 무단으로 대량 추출(스크래핑)하거나 재판매할 수 없습니다.</li>
          <li>서비스의 정상 운영을 방해하는 어떠한 행위도 해서는 안 됩니다.</li>
        </ul>
      </Section>

      <Section title="제6조 (운영자의 의무 및 면책)">
        <ol>
          <li>운영자는 서비스의 안정적 제공을 위해 합리적인 노력을 다합니다.</li>
          <li>
            그러나 운영자는 다음 사항에 대해 책임을 지지 않습니다.
            <ul>
              <li>매물 데이터의 정확성·최신성(원천 데이터는 KIPRIS 등 외부 출처 의존)</li>
              <li>매칭 결과의 거래 성사 보장</li>
              <li>매수자·매도자 간의 직접 협상·계약 결과</li>
              <li>천재지변, 외부 서비스(Supabase·Vercel·OpenAI 등) 장애로 인한 일시적 중단</li>
            </ul>
          </li>
        </ol>
      </Section>

      <Section title="제7조 (지식재산권)">
        <ol>
          <li>매물 원천 데이터의 저작권은 KIPRIS Plus 약관에 따릅니다.</li>
          <li>본 서비스의 디자인·코드·매칭 알고리즘·UI는 운영자의 자산이며, 무단 복제·배포를 금지합니다.</li>
        </ol>
      </Section>

      <Section title="제8조 (매칭 수수료)">
        <p>
          운영자는 거래 성사 시에만 매칭 수수료(거래액의 5~10%, 양측 분배)를 청구합니다.
          구체적 요율과 청구 절차는 별도 협약을 통해 정합니다. 거래 신청(LOI) 접수만으로는
          수수료가 발생하지 않습니다.
        </p>
      </Section>

      <Section title="제9조 (서비스 중단)">
        <p>
          운영자는 시스템 점검, 외부 서비스 장애, 또는 법령에 의한 요구 시 사전 공지 후
          서비스 일부 또는 전부를 중단할 수 있습니다.
        </p>
      </Section>

      <Section title="제10조 (분쟁 해결 및 준거법)">
        <ol>
          <li>본 약관과 관련된 분쟁은 대한민국 법령을 적용합니다.</li>
          <li>분쟁 발생 시 민사소송법상 관할 법원에 따릅니다.</li>
          <li>분쟁 전 사전 협의를 위해 운영자(<a href="mailto:ethos614@gmail.com" className="text-brand hover:underline">ethos614@gmail.com</a>)에게 의사를 전달합니다.</li>
        </ol>
      </Section>

      <Section title="부칙">
        <p>본 약관은 {LAST_UPDATED}부터 시행합니다.</p>
      </Section>

      <footer className="mt-10 border-t border-ink-100 pt-6 text-sm">
        <Link href="/privacy" className="text-brand hover:underline">
          개인정보처리방침 →
        </Link>
        {" · "}
        <Link href="/" className="text-ink-500 hover:text-brand">
          홈으로
        </Link>
      </footer>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 space-y-3 text-sm leading-relaxed text-ink-700">
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}
