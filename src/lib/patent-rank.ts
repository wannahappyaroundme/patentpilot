import type { PatentRow } from "./types";

/**
 * PatentRank 5축 MVP 스코어링.
 *
 * 학술 근거(축별):
 * - INV (혁신성): Tong & Frame (1994), Lanjouw & Schankerman (2001),
 *   OECD originality 지표 (Trajtenberg-Henderson-Jaffe 1997)
 * - IMP (영향력): Trajtenberg (1990), Harhoff et al. (1999), Hall et al. (2005)
 * - MKT (시장성): Putnam (1996), Harhoff/Scherer/Vopel (2003 Research Policy)
 * - NET (네트워크 중심성): Page/Brin/Motwani/Winograd (1998 PageRank)
 * - COM (사업화 준비도): 발명자 활동·정부 R&D 연계 (NTIS) — Carpenter/Narin/Woolf 1981 변형
 *
 * MVP 한정 사항:
 * - NET 축: 진짜 PageRank 대신 in-degree centrality (피인용수)로 근사
 * - COM 축: 외부 DART/NTIS 미연동 → rnd_department 키워드 + transfer_events로 근사
 * - 5축 가중치(0.25/0.20/0.20/0.20/0.15)는 `5축 가중치 스코어 근거.md` 채택
 */

export interface PatentRankBreakdown {
  inv: number;       // 혁신성 (Innovation)
  imp: number;       // 영향력 (Impact)
  mkt: number;       // 시장성 (Market)
  net: number;       // 네트워크 중심성 (Network)
  com: number;       // 사업화 준비도 (Commercialization)
  overall: number;   // 가중 종합 점수 (0~100)
}

export interface PatentRankDetail extends PatentRankBreakdown {
  invDetail: {
    claimBreadth: number;
    ipcDiversity: number;
  };
  impDetail: {
    citationNorm: number;
    age: number;
  };
  mktDetail: {
    familyNorm: number;
    industryAlignment: number;
  };
  netDetail: {
    inDegreeNorm: number;
  };
  comDetail: {
    govProject: number;       // 정부 R&D 사업 표식
    transferActivity: number; // 이전 이력 활성도
    inventorCount: number;    // 공동 발명자 수
  };
}

// 가중치 (5축 가중치 스코어 근거.md 채택)
export const AXIS_WEIGHTS = {
  inv: 0.25,
  imp: 0.20,
  mkt: 0.20,
  net: 0.20,
  com: 0.15,
} as const;

// 정규화 헬퍼: 로그 스케일 + 캡
function logScale(x: number, cap: number): number {
  if (x <= 0) return 0;
  const v = Math.log10(1 + x) / Math.log10(1 + cap);
  return Math.min(100, Math.max(0, Math.round(v * 100)));
}

function clip(v: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, Math.round(v)));
}

// IPC primary 4자리 prefix → 산업 매핑 (시드 — TAM proxy)
// 한국 R&D 주력 산업: 반도체, 배터리, 디스플레이, 바이오, 자동차, 통신
const HIGH_TAM_IPC_PREFIXES: Record<string, number> = {
  // 반도체 (H01L)
  H01L: 95,
  H01J: 75,
  // 배터리·에너지 (H01M, H02J)
  H01M: 92,
  H02J: 80,
  // 디스플레이 (G02F, G09G)
  G02F: 80,
  G09G: 75,
  // 통신 (H04W, H04L, H04B)
  H04W: 88,
  H04L: 85,
  H04B: 75,
  // 바이오·의약 (A61K, C12N, C07K)
  A61K: 90,
  C12N: 85,
  C07K: 80,
  // 자동차·모빌리티 (B60L, B60W)
  B60L: 78,
  B60W: 75,
  // AI·소프트웨어 (G06N, G06F)
  G06N: 88,
  G06F: 75,
  // 신소재 (C08L)
  C08L: 65,
};

function industryAlignmentScore(ipcPrimary: string): number {
  if (!ipcPrimary) return 30; // 기본값
  const prefix = ipcPrimary.slice(0, 4).toUpperCase();
  if (HIGH_TAM_IPC_PREFIXES[prefix] !== undefined) {
    return HIGH_TAM_IPC_PREFIXES[prefix];
  }
  // 섹션 단위 fallback
  const section = ipcPrimary[0]?.toUpperCase();
  if (section === "H") return 60; // 전기
  if (section === "G") return 55; // 물리·계측
  if (section === "A") return 55; // 생활필수품·의료
  if (section === "C") return 50; // 화학
  if (section === "B") return 45; // 처리·운수
  return 35;
}

function ipcDiversityCount(ipcAll: string | null | undefined): number {
  if (!ipcAll) return 1;
  const subclasses = new Set<string>();
  for (const code of ipcAll.split(/[;,|\s]+/)) {
    const sc = code.slice(0, 4).trim().toUpperCase();
    if (sc) subclasses.add(sc);
  }
  return subclasses.size || 1;
}

function ageYears(applicationDate: string | null): number {
  if (!applicationDate) return 0;
  const appYear = parseInt(applicationDate.slice(0, 4), 10);
  if (isNaN(appYear)) return 0;
  const now = new Date().getFullYear();
  return Math.max(0, now - appYear);
}

function inventorCount(inv: string | null | undefined): number {
  if (!inv) return 0;
  return inv.split(/[,;|]/).map((s) => s.trim()).filter(Boolean).length;
}

const GOV_PROJECT_KEYWORDS = [
  "NTIS",
  "IITP",
  "NRF",
  "산업통상자원부",
  "과학기술정보통신부",
  "한국연구재단",
  "정보통신기획평가원",
  "한국산업기술평가관리원",
  "KIAT",
  "KEIT",
  "범부처",
  "혁신성장",
];

function govProjectScore(rndDepartment: string | null | undefined): number {
  if (!rndDepartment) return 0;
  const lower = rndDepartment;
  for (const kw of GOV_PROJECT_KEYWORDS) {
    if (lower.includes(kw)) return 100;
  }
  // 사업명이 있으면 부분 점수 (정부 과제일 가능성 높음)
  if (rndDepartment.trim().length > 0) return 50;
  return 0;
}

/**
 * 5축 + 종합 PatentRank 점수 계산.
 */
export function patentRank(p: PatentRow): PatentRankDetail {
  // === INV 혁신성 ===
  // ClaimBreadth(0.4): 청구항 수 로그 스케일 (cap 50)
  const claimBreadth = logScale(p.claims_count ?? 0, 50);
  // IPCDiversity(0.3): 서브클래스 다양성 (cap 6)
  const diversityCount = ipcDiversityCount(p.ipc_all);
  const ipcDiversity = logScale(diversityCount, 6);
  // BackwardCitationDiversity: 데이터 없음 → INV는 (0.4 + 0.3) / 0.7 로 재정규화
  const inv = clip(
    (0.4 * claimBreadth + 0.3 * ipcDiversity) / 0.7,
  );

  // === IMP 영향력 ===
  // ForwardCitationCount_Norm(0.5): age 보정 — 1년차 평균 0.5건 인용 기준
  const age = ageYears(p.application_date);
  const expectedCitations = Math.max(1, age * 0.6);
  const citationNorm = logScale((p.citation_count ?? 0) / expectedCitations * 10, 30);
  // Quality, Span: 데이터 없음 → IMP는 ForwardCitation 단일로 근사
  const imp = clip(citationNorm);

  // === MKT 시장성 ===
  // FamilySize_Norm(0.5): 패밀리 수 로그 스케일 (cap 10)
  const familyNorm = logScale(p.family_count ?? 0, 10);
  // IndustryAlignment(0.4): IPC → TAM proxy
  const industryAlignment = industryAlignmentScore(p.ipc_primary);
  // IsSEP(0.1): 데이터 없음 → 0
  const mkt = clip(0.5 * familyNorm + 0.4 * industryAlignment + 0.1 * 0);

  // === NET 네트워크 중심성 ===
  // PageRank 근사: in-degree (피인용 수) 로그 스케일
  // 진짜 PageRank는 v2에서 ETL 단계에 사전 계산 후 컬럼 추가 예정
  const inDegreeNorm = logScale(p.citation_count ?? 0, 50);
  const net = clip(inDegreeNorm);

  // === COM 사업화 준비도 ===
  // HasSpinoff(0.35): 데이터 없음 → 0 (Phase 2 DART 연동 시 활성화)
  // InventorCommercializationIndex(0.25): 공동 발명자 수가 많으면 협업력 가산
  const invCount = inventorCount(p.inventor);
  const collabCentrality = logScale(invCount, 6);
  // HasFollowOnFunding(0.20) + ProjectFundingScale(0.20):
  // NTIS 컬럼이 join되어 있으면 진짜 값 사용, 없으면 rnd_department 키워드로 근사
  let govProject: number;
  if (p.ntis_projects != null && p.ntis_projects > 0) {
    // 진짜 NTIS 매칭 (Phase 2)
    govProject = logScale(p.ntis_projects, 30);
  } else {
    // MVP 근사 — rnd_department 키워드 매칭
    govProject = govProjectScore(p.rnd_department);
  }
  // ProjectFundingScale: NTIS 예산이 있으면 사용 (단위: 억 원)
  const fundingScale =
    p.ntis_funding_billions != null && p.ntis_funding_billions > 0
      ? logScale(p.ntis_funding_billions, 50)
      : 0;
  // TransferEvents: 이전 이력 있으면 사업화 활동 흔적
  const transferActivity = logScale(p.transfer_events ?? 0, 5);
  // NTIS 데이터 있으면 govProject + fundingScale 분리 사용, 없으면 govProject 단일
  const usingRealNtis = p.ntis_projects != null && p.ntis_projects > 0;
  const com = clip(
    0.35 * 0 +
      0.25 * collabCentrality +
      (usingRealNtis ? 0.20 * govProject + 0.20 * fundingScale : 0.20 * govProject) +
      (usingRealNtis ? 0 : 0.20 * transferActivity),
  );

  const overall = clip(
    AXIS_WEIGHTS.inv * inv +
      AXIS_WEIGHTS.imp * imp +
      AXIS_WEIGHTS.mkt * mkt +
      AXIS_WEIGHTS.net * net +
      AXIS_WEIGHTS.com * com,
  );

  return {
    inv,
    imp,
    mkt,
    net,
    com,
    overall,
    invDetail: { claimBreadth, ipcDiversity },
    impDetail: { citationNorm, age },
    mktDetail: { familyNorm, industryAlignment },
    netDetail: { inDegreeNorm },
    comDetail: {
      govProject,
      transferActivity,
      inventorCount: invCount,
    },
  };
}

// 등급 라벨
export function patentRankGrade(overall: number): {
  grade: string;
  color: string;
  desc: string;
} {
  if (overall >= 80) return { grade: "S", color: "#7C3AED", desc: "최상위 — 즉시 매수 후보 컨택 권장" };
  if (overall >= 65) return { grade: "A", color: "#006EFF", desc: "상위 — 산업·시장 적합도 우수" };
  if (overall >= 50) return { grade: "B", color: "#059669", desc: "중상위 — 매물 풀 평균 이상" };
  if (overall >= 35) return { grade: "C", color: "#D97706", desc: "중위 — 부가 정보로 가치 보강 필요" };
  return { grade: "D", color: "#64748B", desc: "하위 — 다른 매물 우선 검토 권장" };
}

/**
 * "왜 이 점수?" — 각 축의 raw 입력값과 계산식을 사람이 읽을 수 있는 형태로 반환.
 * PatentRankSummary의 explainability 토글에서 사용.
 */
export function patentRankExplain(
  p: import("./types").PatentRow,
  detail: PatentRankDetail,
): Array<{
  axis: keyof Omit<PatentRankBreakdown, "overall">;
  inputs: Array<{ label: string; value: string }>;
  formula: string;
}> {
  const subclasses = ipcDiversityCount(p.ipc_all);
  const age = detail.impDetail.age;
  const expectedCitations = Math.max(1, age * 0.6);
  return [
    {
      axis: "inv",
      inputs: [
        { label: "독립청구항 수", value: String(p.claims_count ?? 0) },
        { label: "IPC 서브클래스 다양성", value: `${subclasses}개` },
      ],
      formula:
        "0.4×ClaimBreadth + 0.3×IPCDiversity (BackwardCitationDiversity 미적용 → 0.7로 재정규화)",
    },
    {
      axis: "imp",
      inputs: [
        { label: "피인용 수", value: String(p.citation_count ?? 0) },
        { label: "출원 후 경과 연수", value: `${age}년` },
        {
          label: "연차별 평균 기대 인용",
          value: `${expectedCitations.toFixed(1)}건/년`,
        },
      ],
      formula:
        "ForwardCitationCount_Norm (age 보정) — Quality/Span 미구현으로 단일 신호",
    },
    {
      axis: "mkt",
      inputs: [
        { label: "패밀리 수", value: String(p.family_count ?? 0) },
        {
          label: "주 IPC",
          value: p.ipc_primary || "—",
        },
        {
          label: "산업 적합도(TAM proxy)",
          value: String(detail.mktDetail.industryAlignment),
        },
      ],
      formula: "0.5×FamilySize + 0.4×IndustryAlignment(TAM) + 0.1×IsSEP(0 고정)",
    },
    {
      axis: "net",
      inputs: [
        { label: "in-degree(피인용)", value: String(p.citation_count ?? 0) },
      ],
      formula:
        "in-degree centrality (진짜 PageRank 미적용 — IMP와 같은 변수 공유, 다중공선성)",
    },
    {
      axis: "com",
      inputs: [
        {
          label: "공동 발명자 수",
          value: `${detail.comDetail.inventorCount}명`,
        },
        {
          label: "정부 R&D 사업명",
          value: p.rnd_department ? p.rnd_department.slice(0, 30) : "(없음)",
        },
        {
          label: "이전 이벤트",
          value: `${p.transfer_events ?? 0}회`,
        },
        {
          label: "NTIS 연동",
          value:
            p.ntis_projects != null && p.ntis_projects > 0
              ? `${p.ntis_projects}건 · ${p.ntis_funding_billions ?? 0}억`
              : "(키워드 근사 사용)",
        },
      ],
      formula:
        "0.35×HasSpinoff(0 고정) + 0.25×CollabCentrality + 0.20×GovProject + 0.20×Transfer/Funding",
    },
  ];
}

// 학술 근거 한 줄 (UI 툴팁용)
export const AXIS_META: Record<
  keyof Omit<PatentRankBreakdown, "overall">,
  { name: string; full: string; cite: string }
> = {
  inv: {
    name: "혁신성",
    full: "Innovation",
    cite: "Tong & Frame 1994 · Lanjouw-Schankerman 2001",
  },
  imp: {
    name: "영향력",
    full: "Impact",
    cite: "Trajtenberg 1990 · Hall-Jaffe-Trajtenberg 2005",
  },
  mkt: {
    name: "시장성",
    full: "Market Potential",
    cite: "Putnam 1996 · Harhoff-Scherer-Vopel 2003",
  },
  net: {
    name: "중심성",
    full: "Network Centrality",
    cite: "Page-Brin 1998 PageRank (in-degree 근사)",
  },
  com: {
    name: "사업화",
    full: "Commercialization Readiness",
    cite: "Carpenter-Narin-Woolf 1981 변형 · NTIS 연계",
  },
};
