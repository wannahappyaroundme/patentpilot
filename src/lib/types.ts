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
}
