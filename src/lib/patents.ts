import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { PatentRow, Urgency, OrgType } from "./types";

let cached: SupabaseClient | null = null;
function client(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cached = createClient(url, anonKey, { auth: { persistSession: false } });
  return cached;
}

export interface SearchParams {
  q?: string;
  urgency?: Urgency | "ALL";
  org?: OrgType | "ALL";
  ipc?: string;
  university?: string;
  page?: number;
  perPage?: number;
  sort?: "urgency" | "recent" | "citations" | "claims" | "transfers";
}

export interface SearchResult {
  rows: PatentRow[];
  total: number;
  page: number;
  perPage: number;
}

const URGENCY_ORDER: Record<Urgency, number> = { RED: 0, YELLOW: 1, GREEN: 2 };

export async function searchPatents(p: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, p.page ?? 1);
  const perPage = Math.min(60, Math.max(10, p.perPage ?? 20));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const sb = client();
  if (!sb) return { rows: [], total: 0, page, perPage };

  let q = sb
    .from("patents")
    .select("*", { count: "exact" })
    .eq("latest_status", "연차료납부");

  if (p.urgency && p.urgency !== "ALL") q = q.eq("urgency", p.urgency);
  if (p.org && p.org !== "ALL") q = q.eq("org_type", p.org);

  if (p.ipc) {
    const prefixes = p.ipc
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (prefixes.length === 1) {
      q = q.ilike("ipc_primary", `${prefixes[0]}%`);
    } else if (prefixes.length > 1) {
      const ors = prefixes.map((p) => `ipc_primary.ilike.${p}%`).join(",");
      q = q.or(ors);
    }
  }

  if (p.university) q = q.ilike("university_name", `%${p.university}%`);

  if (p.q) {
    const term = p.q.replace(/[%,]/g, " ").trim();
    if (term) {
      q = q.or(
        `title.ilike.%${term}%,applicant.ilike.%${term}%,university_name.ilike.%${term}%`,
      );
    }
  }

  switch (p.sort) {
    case "recent":
      q = q.order("application_date", { ascending: false, nullsFirst: false });
      break;
    case "citations":
      q = q.order("citation_count", { ascending: false });
      break;
    case "claims":
      q = q.order("claims_count", { ascending: false });
      break;
    case "transfers":
      q = q.order("transfer_events", { ascending: false });
      break;
    case "urgency":
    default:
      q = q
        .order("urgency", { ascending: true })
        .order("citation_count", { ascending: false });
  }

  q = q.range(from, to);

  const { data, count, error } = await q;
  if (error) {
    console.error("searchPatents error", error);
    return { rows: [], total: 0, page, perPage };
  }

  const rows = (data ?? []) as PatentRow[];
  rows.sort((a, b) => {
    if (p.sort && p.sort !== "urgency") return 0;
    return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
  });

  return { rows, total: count ?? rows.length, page, perPage };
}

export async function getPatentByAppNo(
  appNo: string,
): Promise<PatentRow | null> {
  const sb = client();
  if (!sb) return null;
  const { data, error } = await sb
    .from("patents")
    .select("*")
    .eq("application_number", appNo)
    .maybeSingle();
  if (error || !data) return null;
  return data as PatentRow;
}
