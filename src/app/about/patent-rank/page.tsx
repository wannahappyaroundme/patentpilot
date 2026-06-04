import Link from "next/link";
import { AXIS_WEIGHTS, AXIS_META } from "@/lib/patent-rank";
import { KIPRIS_SYNC_DATE } from "@/lib/data-version";

export const metadata = {
  title: "PatentRank 방법론 — 5축 학술 모델",
  description:
    "PatentPilot의 매물 가치평가 모델 PatentRank의 5축 가중치 구성, 학술 근거, MVP 한정 사항, 경쟁사 비교를 한 페이지로 정리합니다.",
};

const AXES_DESC: Record<
  keyof typeof AXIS_WEIGHTS,
  { spec_vars: string[]; mvp_vars: string[]; status: "복원" | "근사" | "미반영" }
> = {
  inv: {
    spec_vars: ["ClaimBreadth", "IPCDiversity", "BackwardCitationDiversity"],
    mvp_vars: ["claims_count (log)", "ipc_all subclass count"],
    status: "근사",
  },
  imp: {
    spec_vars: ["ForwardCitationCount_Norm", "ForwardCitationQuality", "CitationSpan"],
    mvp_vars: ["citation_count (age 보정)"],
    status: "근사",
  },
  mkt: {
    spec_vars: ["FamilySize_Norm", "IndustryAlignment (TAM·CAGR·HiringDemand)", "IsSEP"],
    mvp_vars: ["family_count (log)", "IPC → TAM 시드 매핑 17개"],
    status: "근사",
  },
  net: {
    spec_vars: ["PageRank", "Betweenness", "CrossDomainBridgeScore", "TemporalPersistence"],
    mvp_vars: ["in-degree centrality (citation_count 재사용)"],
    status: "근사",
  },
  com: {
    spec_vars: [
      "HasSpinoff",
      "InventorCommercializationIndex (4 변수)",
      "HasFollowOnFunding",
      "ProjectFundingScale",
    ],
    mvp_vars: ["inventor count", "rnd_department 키워드", "transfer_events"],
    status: "근사",
  },
};

export default function PatentRankAboutPage() {
  const axes = Object.keys(AXIS_WEIGHTS) as Array<keyof typeof AXIS_WEIGHTS>;

  return (
    <article className="mx-auto max-w-4xl py-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Methodology
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          PatentRank 5축 학술 모델
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          PatentPilot은 잠자는 한국 R&amp;D 특허에 0~100 점수와 S/A/B/C/D 등급을
          부여해 매수 후보 기업이 가치 있는 매물을 빠르게 식별할 수 있게 합니다.
          본 페이지는 모델의 5축 구성, 학술 근거, 그리고 MVP 단계의 한정 사항을
          모두 공개합니다.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          KIPRIS 동기화: {KIPRIS_SYNC_DATE} · 모델 v1 (MVP)
        </div>
      </header>

      <Section title="1. 5축 구성과 가중치">
        <p>
          PatentRank는 학술 문헌의 특허가치 평가 5축을 한국 R&amp;D 특허 맥락에
          맞춰 가중평균합니다. 가중치 비율은 프로젝트 내부 합의안이며,
          학술적으로 도출된 단일 정답이 아닙니다 (자세한 한계는 §4 참조).
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2.5">축</th>
                <th className="px-4 py-2.5">전체 가중치</th>
                <th className="px-4 py-2.5">학술 근거 (개별 지표)</th>
                <th className="px-4 py-2.5">MVP 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {axes.map((a) => {
                const meta = AXIS_META[a];
                const w = AXIS_WEIGHTS[a];
                const d = AXES_DESC[a];
                return (
                  <tr key={a}>
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-ink-900">{meta.name}</div>
                      <div className="text-[11px] text-ink-500">{meta.full}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono font-semibold text-brand">
                        {w.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-[11px] leading-relaxed text-ink-700">
                      {meta.cite}
                    </td>
                    <td className="px-4 py-3 align-top text-[11px] text-ink-500">
                      spec 변수: {d.spec_vars.length}개
                      <br />
                      구현: {d.mvp_vars.length}개 ({d.status})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="2. 학술 근거 (개별 지표 정당화)">
        <p>
          아래 6편은 각 축의 <em>개별 지표</em>(예: ClaimBreadth, ForwardCitation,
          FamilySize, PageRank 등)의 사용을 정당화하는 학술 근거입니다. 가중치{" "}
          <strong>비율</strong>(0.25/0.20/0.20/0.20/0.15)의 직접 근거는 아니며, 그
          부분은 §4의 한계로 명시합니다.
        </p>
        <ul className="mt-4 space-y-2 rounded-xl border border-ink-100 bg-white p-5 text-sm leading-relaxed">
          <li>
            <strong>Tong &amp; Frame (1994)</strong> — 청구항 가중 특허수가 단순
            특허수보다 R&amp;D 지출과 더 강하게 상관. INV 축 ClaimBreadth.
          </li>
          <li>
            <strong>Lanjouw &amp; Schankerman (2001)</strong> — 청구항 수와 소송
            확률의 유의한 양의 상관. INV 축 ClaimBreadth.
          </li>
          <li>
            <strong>Trajtenberg (1990) · Hall-Jaffe-Trajtenberg (2005)</strong> —
            ForwardCitation = 가치 지표. IMP 축의 핵심 학술 근거.
          </li>
          <li>
            <strong>Harhoff, Scherer &amp; Vopel (2003 Research Policy)</strong> —
            FamilySize &gt; ForwardCitation as a value indicator. MKT 축
            FamilySize.
          </li>
          <li>
            <strong>Page, Brin, Motwani &amp; Winograd (1998)</strong> — PageRank
            (damping 0.85). NET 축의 spec 변수 (현재 in-degree로 근사 중).
          </li>
          <li>
            <strong>Carpenter, Narin &amp; Woolf (1981)</strong> — 인용 다양성과
            영향력의 관계. INV의 BackwardCitationDiversity (현재 미반영).
          </li>
        </ul>
      </Section>

      <Section title="3. 등급 컷오프">
        <p>현재 컷오프는 매물 풀 분포에 대한 사전 통계 검토 없이 설정된
          잠정 값입니다 (D-25 안에 분포 검토 후 재조정 예정).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {[
            { g: "S", min: 80, color: "#7C3AED", desc: "즉시 컨택" },
            { g: "A", min: 65, color: "#006EFF", desc: "산업 적합도 우수" },
            { g: "B", min: 50, color: "#059669", desc: "평균 이상" },
            { g: "C", min: 35, color: "#D97706", desc: "보강 필요" },
            { g: "D", min: 0, color: "#64748B", desc: "정보 부족" },
          ].map((t) => (
            <div
              key={t.g}
              className="rounded-xl border border-ink-100 bg-white p-3 text-center"
            >
              <div
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm font-black text-white"
                style={{ background: t.color }}
              >
                {t.g}
              </div>
              <div className="mt-2 text-xs font-semibold text-ink-900">
                ≥ {t.min}점
              </div>
              <div className="text-[10px] text-ink-500">{t.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="4. MVP 단계의 솔직한 한계">
        <p>모델 v1은 다음 4가지 한계를 가지며, v2 로드맵에서 순차 해소합니다.</p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
          <li>
            <strong>IMP·NET 다중공선성:</strong> 두 축이 모두 `citation_count`
            변수를 공유합니다. 라벨은 5축이지만 통계적으로 약 3~4축에
            해당합니다. v2에서 NET을 진짜 PageRank·Betweenness·CrossDomainBridge
            로 분리합니다.
          </li>
          <li>
            <strong>가중치 비율의 출처:</strong> 0.25/0.20/0.20/0.20/0.15는
            프로젝트 내부 트레이드오프 합의이며, AHP·Delphi 검증 전입니다. v2에서
            TLO 10명 + VC 5명 + 변리사 5명 패널 + sensitivity analysis로
            재검증합니다.
          </li>
          <li>
            <strong>COM 축 핵심 변수 미반영:</strong> 최대 가중 변수
            HasSpinoff(0.35)이 0으로 고정되어 있습니다 (외부 DART/더브이씨
            미연동). v2에서 NTIS R&amp;D 과제 매칭 → DART 임원/창업자 매칭 순으로
            채웁니다.
          </li>
          <li>
            <strong>MKT TAM 시드의 일반화 한계:</strong> 산업 적합도가 IPC prefix
            17개 키워드 매핑 기반입니다. v2에서 KOSIS TAM + KSIC-IPC 연계표 +
            청구항 임베딩 보정으로 대체합니다.
          </li>
        </ol>
      </Section>

      <Section title="5. 경쟁사 비교">
        <p>한국·글로벌 IP 정보서비스와 PatentPilot PatentRank의 차이를 한 줄로
          정리합니다.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-3 py-2.5">서비스</th>
                <th className="px-3 py-2.5">가치 점수</th>
                <th className="px-3 py-2.5">학술 근거 공개</th>
                <th className="px-3 py-2.5">한국 R&amp;D 특화</th>
                <th className="px-3 py-2.5">가격</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50 text-xs">
              <CompetitorRow
                name="WIPS"
                score="ON-K Score (자체)"
                cite="공개 ❌"
                korea="중간"
                price="연 수백만~"
              />
              <CompetitorRow
                name="위즈도메인"
                score="WisDomain Score"
                cite="공개 ❌"
                korea="중간"
                price="연 수백만~"
              />
              <CompetitorRow
                name="PatSnap"
                score="Patent Asset Index"
                cite="LexisNexis 인수 후 부분 공개"
                korea="약함 (영문 위주)"
                price="연 수천만~"
              />
              <CompetitorRow
                name="Innography"
                score="PatentStrength®"
                cite="개략 설명만"
                korea="약함"
                price="연 수천만~"
              />
              <CompetitorRow
                name="PatentPilot"
                score="PatentRank 5축 (v1)"
                cite="6편 논문 인용 + MVP 한계 명시 ✅"
                korea="대학·정출연 158k 전수 ✅"
                price="검색·열람 무료 · 컨택 수수료 거래 성사 시"
                highlight
              />
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          ※ 경쟁사 정량 변별력 입증은 Phase 2 PoC(VC 3곳)에서 수행 예정.
        </p>
      </Section>

      <Section title="6. v2 로드맵 (대회 후)">
        <ul className="grid gap-3 sm:grid-cols-2">
          <RoadmapCard
            title="가중치 AHP 검증"
            body="TLO 10 · VC 5 · 변리사 5 패널 + sensitivity ±0.05 + K-fold 백테스트"
            days="30일"
          />
          <RoadmapCard
            title="IMP·NET 다중공선성 해소"
            body="KIPRIS 인용 전수 다운로드 → PageRank·Betweenness·CrossDomainBridge 분리"
            days="14일 + 월 운영비 10~25만원"
          />
          <RoadmapCard
            title="NTIS R&D 과제 매칭"
            body="법인 단위 FundedProjects + ProjectFundingScale → COM 0.40 활성화"
            days="9일 (D-25 안 시도)"
          />
          <RoadmapCard
            title="DART HasSpinoff 매칭"
            body="DART 임원 + 더브이씨 + 보도자료 fuzzy 매칭, confidence band 노출"
            days="10일"
          />
        </ul>
      </Section>

      <footer className="mt-12 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-6 text-sm">
        <Link href="/market" className="text-brand hover:underline">
          매물 찾으러 가기 →
        </Link>
        <span className="text-ink-300">·</span>
        <Link href="/about" className="text-ink-500 hover:text-brand">
          서비스 소개
        </Link>
        <span className="text-ink-300">·</span>
        <a
          href="mailto:ethos614@gmail.com?subject=PatentRank%20%EB%B0%A9%EB%B2%95%EB%A1%A0%20%EB%AC%B8%EC%9D%98"
          className="text-ink-500 hover:text-brand"
        >
          방법론 피드백 / 협업 문의
        </a>
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
    <section className="mb-12 space-y-3 text-sm leading-relaxed text-ink-700">
      <h2 className="text-xl font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

function CompetitorRow({
  name,
  score,
  cite,
  korea,
  price,
  highlight,
}: {
  name: string;
  score: string;
  cite: string;
  korea: string;
  price: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-brand-50/30" : ""}>
      <td className="px-3 py-2.5 font-semibold text-ink-900">{name}</td>
      <td className="px-3 py-2.5 text-ink-700">{score}</td>
      <td className="px-3 py-2.5 text-ink-700">{cite}</td>
      <td className="px-3 py-2.5 text-ink-700">{korea}</td>
      <td className="px-3 py-2.5 text-ink-700">{price}</td>
    </tr>
  );
}

function RoadmapCard({ title, body, days }: { title: string; body: string; days: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4">
      <div className="text-sm font-bold text-ink-900">{title}</div>
      <div className="mt-1.5 text-xs text-ink-500">{body}</div>
      <div className="mt-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand">
        {days}
      </div>
    </div>
  );
}
