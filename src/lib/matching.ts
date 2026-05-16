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
  ipc_score: number;
  revenue_score: number;
  collab_score: number;
  score: number;
  collab_reason: string;
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

function companyKeywords(c: {
  name: string;
  aliases: string;
}): string[] {
  const out: string[] = [c.name];
  if (c.aliases) {
    for (const tok of c.aliases.split(/[|,]/)) {
      const t = tok.trim();
      if (t) out.push(t);
    }
  }
  return Array.from(new Set(out));
}

function collabScoreFor(
  patent: PatentRow,
  keywords: string[],
): { score: number; reason: string } {
  const haystack = [patent.applicant, patent.rnd_department].join(" ");
  for (const kw of keywords) {
    if (kw.length < 2) continue;
    if (haystack.includes(kw)) {
      return { score: 20, reason: `공동출원/R&D 사업명에 "${kw}" 등장` };
    }
  }
  if (patent.transfer_events >= 3) {
    return { score: 10, reason: `이전 이벤트 ${patent.transfer_events}회 — 권리 이동 활발` };
  }
  if (patent.transfer_events >= 1) {
    return { score: 5, reason: "이전 이벤트 기록 있음" };
  }
  return { score: 0, reason: "" };
}

/**
 * IPC 적합도 60 + R&D 규모 20 + 협력 이력 20.
 * - aliases가 patent.applicant 또는 rnd_department에 포함되면 +20
 * - 그 외 transfer_events ≥ 3 / ≥ 1 에 따라 가산점
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
      "ipc_prefix,weight,note,companies(id,name,industry,description,revenue_band,website,aliases)",
    )
    .or(prefixOrs)
    .limit(150);

  if (error || !data) return [];

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
          aliases: string;
        }
      | Array<{
          id: number;
          name: string;
          industry: string;
          description: string;
          revenue_band: string;
          website: string;
          aliases: string;
        }>
      | null;
  };

  const byCompany = new Map<number, CompanyMatch>();
  for (const row of data as unknown as Joined[]) {
    const c = Array.isArray(row.companies) ? row.companies[0] : row.companies;
    if (!c) continue;

    const ipcScore = Math.round(Number(row.weight) * 60);
    const revenueScore = parseRevenueScore(c.revenue_band);
    const keywords = companyKeywords(c);
    const { score: collabScore, reason: collabReason } = collabScoreFor(
      patent,
      keywords,
    );
    const total = ipcScore + revenueScore + collabScore;

    const existing = byCompany.get(c.id);
    if (!existing || existing.score < total) {
      byCompany.set(c.id, {
        company_id: c.id,
        name: c.name,
        industry: c.industry,
        description: c.description,
        revenue_band: c.revenue_band,
        website: c.website,
        matched_ipc: row.ipc_prefix,
        ipc_weight: Number(row.weight),
        ipc_score: ipcScore,
        revenue_score: revenueScore,
        collab_score: collabScore,
        score: total,
        collab_reason: collabReason,
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
