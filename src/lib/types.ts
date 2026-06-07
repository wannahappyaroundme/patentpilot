export type Urgency = "RED" | "YELLOW" | "GREEN";
export type OrgType = "UNIV" | "GRI" | "OTHER";

export interface MarketStats {
  total: number;
  red: number;
  yellow: number;
  green: number;
  univ: number;
  gri: number;
  top_universities: Array<{ university_name: string; n: number }>;
}

export interface PatentRow {
  application_number: string;
  title: string;
  applicant: string;
  university_name: string;
  org_type: OrgType;
  application_date: string | null;
  registration_date: string | null;
  expiration_date: string | null;
  ipc_primary: string;
  ipc_all: string;
  claims_count: number;
  family_count: number;
  citation_count: number;
  transfer_count: number;
  transfer_events: number;
  legal_status: string;
  rnd_department: string;
  inventor: string;
  kipris_link: string;
  urgency: Urgency;
  remaining_years: number | null;
  // NTIS R&D 과제 매칭 결과 (org_ntis_summary join — Phase 2에 활성화)
  ntis_projects?: number | null;
  ntis_funding_billions?: number | null;
  // PatentRank 사전 계산 컬럼 (scripts/precompute-patent-rank.ts로 적재)
  patent_rank?: number | null;
  patent_rank_grade?: string | null;
  // CitationSpan ETL (etl/patentpilot_etl/citation_span.py) — IMP 축 보강
  citation_span_norm?: number | null;
  citation_span_n?: number | null;
  citation_span_conf?: "HIGH" | "MED" | "LOW" | null;
  // PriorPatentCount ETL (etl/patentpilot_etl/prior_patent_count.py) — COM 축 보강
  prior_patent_count?: number | null;
  prior_patent_count_max?: number | null;
  prior_patent_conf?: "HIGH" | "MED" | "LOW" | null;
}
