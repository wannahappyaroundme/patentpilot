import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PatentRow } from "./types";

let cached: SupabaseClient | null = null;
function client(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cached = createClient(url, anonKey, { auth: { persistSession: false } });
  return cached;
}

export interface CompanyMatch {
  company_id: number;
  name: string;
  industry: string;
  description: string;
  revenue_band: string;
  website: string;
  matched_ipc: string;
  ipc_weight: number;
  score: number;
}

function ipcPrefixes(ipcRaw: string): string[] {
  if (!ipcRaw) return [];
  return Array.from(
    new Set(
      ipcRaw
        .split(/[;,|]/)
        .map((s) => s.trim().split(/\s+/)[0] ?? "")
        .filter(Boolean)
        .map((s) => s.toUpperCase()),
    ),
  );
}

/**
 * IPC 적합도 60% + R&D 규모 20% + 협력 이력 20% 룰베이스 매칭.
 * 현재 협력 이력 데이터는 외부 보강 전이라 IPC + 규모로 점수 계산.
 */
export async function matchCompanies(
  patent: PatentRow,
  limit = 5,
): Promise<CompanyMatch[]> {
  const sb = client();
  if (!sb) return [];
  const prefixes = ipcPrefixes(`${patent.ipc_primary};${patent.ipc_all ?? ""}`);
  if (prefixes.length === 0) return [];

  const prefixOrs = prefixes
    .map((p) => `ipc_prefix.eq.${p}`)
    .concat(prefixes.map((p) => `ipc_prefix.ilike.${p.slice(0, 4)}%`))
    .join(",");

  const { data, error } = await sb
    .from("ipc_company")
    .select(
      "ipc_prefix,weight,note,companies(id,name,industry,description,revenue_band,website)",
    )
    .or(prefixOrs)
    .limit(80);

  if (error || !data) return [];

  const byCompany = new Map<number, CompanyMatch>();
  type Joined = {
    ipc_prefix: string;
    weight: number | string;
    note: string;
    companies:
      | {
          id: number;
          name: string;
          industry: string;
          description: string;
          revenue_band: string;
          website: string;
        }
      | Array<{
          id: number;
          name: string;
          industry: string;
          description: string;
          revenue_band: string;
          website: string;
        }>
      | null;
  };
  for (const row of data as unknown as Joined[]) {
    const c = Array.isArray(row.companies) ? row.companies[0] : row.companies;
    if (!c) continue;
    const ipcScore = Number(row.weight) * 60; // 0~60
    const revenueScore = parseRevenueScore(c.revenue_band); // 0~20
    const collabScore = 0; // 데이터 보강 전: 향후 transfers/rndDepartment join 시 가산
    const score = Math.round(ipcScore + revenueScore + collabScore);
    const existing = byCompany.get(c.id);
    if (!existing || existing.score < score) {
      byCompany.set(c.id, {
        company_id: c.id,
        name: c.name,
        industry: c.industry,
        description: c.description,
        revenue_band: c.revenue_band,
        website: c.website,
        matched_ipc: row.ipc_prefix,
        ipc_weight: Number(row.weight),
        score,
      });
    }
  }
  return Array.from(byCompany.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function parseRevenueScore(band: string): number {
  if (!band) return 0;
  const m = band.match(/(\d+)/);
  if (!m || !m[1]) return 0;
  const n = parseInt(m[1], 10);
  if (band.includes("조")) {
    if (n >= 100) return 20;
    if (n >= 50) return 18;
    if (n >= 20) return 16;
    if (n >= 10) return 14;
    if (n >= 5) return 12;
    if (n >= 3) return 10;
    if (n >= 2) return 8;
    if (n >= 1) return 6;
  }
  if (band.includes("천억")) return 4;
  return 2;
}
