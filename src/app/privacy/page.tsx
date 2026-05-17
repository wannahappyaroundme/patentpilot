import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 — PatentPilot",
  description:
    "PatentPilot이 수집하는 개인정보 항목, 이용 목적, 보유 기간, 제3자 제공, 이용자 권리를 안내합니다.",
};

const LAST_UPDATED = "2026-05-17";

export default function PrivacyPage() {
  return (
    <article className="prose-pp mx-auto max-w-3xl py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Privacy Policy
        </p>
        <h1 className="mt-1 text-3xl font-bold">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-ink-500">
          최종 개정일: {LAST_UPDATED}
        </p>
      </header>

      <Section title="1. 개요">
        <p>
          TreeO(이하 &ldquo;운영자&rdquo;)는 PatentPilot(이하 &ldquo;서비스&rdquo;)을
          제공하면서 이용자의 개인정보 보호를 중요하게 여기며,「개인정보 보호법」 및
          관련 법령을 준수합니다. 본 처리방침은 운영자가 처리하는 개인정보의 항목과 처리
          목적을 알리기 위해 작성되었습니다.
        </p>
      </Section>

      <Section title="2. 수집하는 개인정보 항목 및 목적">
        <p>운영자는 다음의 경우에 한해 최소한의 개인정보를 수집합니다.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">구분</th>
              <th className="py-2 text-left">수집 항목</th>
              <th className="py-2 text-left">수집·이용 목적</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            <tr>
              <td className="py-2 font-medium">거래 신청 (LOI)</td>
              <td className="py-2">회사명, 담당자명, 이메일, 연락처(선택), 제안 금액(선택), 메시지(선택), 관심 매물 출원번호(선택)</td>
              <td className="py-2">매수 의향 접수 · 매도 기관 컨택 중개 · 매칭 진행 안내</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">매물 등록 (Listing)</td>
              <td className="py-2">기관명, 담당자명, 이메일, 연락처(선택), 매물 메타(제목·IPC·출원번호·의향가)</td>
              <td className="py-2">매도 매물 등록 검토 · 매수 후보 기업 매칭</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">서비스 이용 분석</td>
              <td className="py-2">익명 세션 ID(localStorage), 페이지뷰, 클릭, 검색어, User-Agent에서 추출한 디바이스/브라우저/OS, referrer 도메인</td>
              <td className="py-2">서비스 품질 개선 · 비정상 사용 탐지 (개인 식별 X)</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">이메일 문의</td>
              <td className="py-2">발신 이메일 본문에 포함된 정보</td>
              <td className="py-2">문의 응답 · 협력 검토</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-ink-500">
          서비스 이용 중 자동 수집되는 정보(접속 IP, 쿠키)는 Vercel Analytics · Vercel
          Speed Insights · Supabase 로그에 의해 익명 통계 목적으로만 처리됩니다.
        </p>
      </Section>

      <Section title="3. 개인정보의 보유 및 이용 기간">
        <ul>
          <li>거래 신청(LOI) 및 매물 등록 정보: 거래 협의 종료 또는 신청자의 삭제 요청 시까지, 최대 5년 보관 후 파기</li>
          <li>익명 이벤트 트래킹 데이터: 12개월 후 자동 익명화 또는 삭제</li>
          <li>이메일 문의 내역: 회신 완료 후 1년 보관</li>
          <li>관계 법령(전자상거래법, 통신비밀보호법 등)이 보존을 요구하는 경우 해당 기간 동안 보관</li>
        </ul>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>
          운영자는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의
          경우는 예외로 합니다.
        </p>
        <ul>
          <li>매칭 중개 과정에서 매도 기관(TLO·정출연) 또는 매수 기업과의 거래 협의에 필요한 최소 정보(회사명, 담당자명, 연락처)를 사전 동의를 받은 후 전달</li>
          <li>법령에 의해 수사기관이 적법한 절차에 따라 요청한 경우</li>
        </ul>
      </Section>

      <Section title="5. 개인정보 처리의 위탁">
        <p>운영자는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다.</p>
        <ul>
          <li><b>Supabase Inc.</b> (PostgreSQL 데이터베이스 호스팅, 서울 리전)</li>
          <li><b>Vercel Inc.</b> (웹 배포·CDN·Analytics·Speed Insights)</li>
          <li><b>OpenAI L.L.C.</b> (AI 코파일럿 채팅 — 사용자 질의를 LLM에 전송하나 개인정보 자체는 전송하지 않음)</li>
        </ul>
        <p className="text-sm text-ink-500">위탁업체는 개인정보 보호 관련 법령을 준수하며, 위탁 목적 외 사용을 금지합니다.</p>
      </Section>

      <Section title="6. 이용자의 권리와 행사 방법">
        <p>이용자는 다음의 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>개인정보 열람·정정·삭제 요청</li>
          <li>처리 정지 및 동의 철회</li>
          <li>피해 구제 신청 (개인정보보호위원회 118)</li>
        </ul>
        <p>
          위 권리 행사는 운영자의 이메일{" "}
          <a href="mailto:ethos614@gmail.com" className="text-brand hover:underline">
            ethos614@gmail.com
          </a>{" "}
          으로 요청해 주시기 바라며, 운영자는 영업일 기준 7일 이내 조치합니다.
        </p>
      </Section>

      <Section title="7. 개인정보의 안전성 확보 조치">
        <ul>
          <li>전송 구간 HTTPS(TLS) 암호화</li>
          <li>관리자 페이지(/admin) Basic Auth 보호</li>
          <li>Supabase Row Level Security를 통한 데이터 접근 제어</li>
          <li>최소 권한 원칙에 따른 운영자 접근 통제</li>
        </ul>
      </Section>

      <Section title="8. 개인정보 보호책임자">
        <p>
          개인정보 처리에 관한 책임은 운영자가 부담하며, 문의는 다음으로 부탁드립니다.
        </p>
        <ul>
          <li>
            책임자 이메일:{" "}
            <a href="mailto:ethos614@gmail.com" className="text-brand hover:underline">
              ethos614@gmail.com
            </a>
          </li>
          <li>서비스 명: PatentPilot (운영팀 TreeO)</li>
        </ul>
      </Section>

      <Section title="9. 개정">
        <p>
          본 처리방침은 관련 법령 또는 서비스 변경에 따라 개정될 수 있으며, 변경 사항은
          시행 7일 전에 본 페이지를 통해 공지합니다.
        </p>
      </Section>

      <footer className="mt-10 border-t border-ink-100 pt-6 text-sm">
        <Link href="/terms" className="text-brand hover:underline">
          이용약관 →
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
