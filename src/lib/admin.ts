import { createServiceClient } from "./supabase";

export interface AdminSummary {
  pv_24h: number;
  pv_7d: number;
  click_24h: number;
  click_7d: number;
  search_7d: number;
  loi_total: number;
  loi_24h: number;
  loi_7d: number;
  list_total: number;
  list_24h: number;
  list_7d: number;
  list_pending: number;
  patents_total: number;
  top_pages: Array<{ path: string; n: number }>;
  top_clicks: Array<{ target: string; n: number }>;
  top_searches: Array<{ q: string; n: number }>;
  pv_daily: Array<{ day: string; n: number }>;
}

export interface AdminDashboard {
  pv_24h: number;
  pv_7d: number;
  pv_30d: number;
  dau: number;
  wau: number;
  mau: number;
  loi_total: number;
  loi_24h: number;
  loi_7d: number;
  list_total: number;
  list_24h: number;
  list_7d: number;
  list_pending: number;
  patents_total: number;
  by_day: Array<{ day: string; pv: number; uv: number }>;
  top_paths: Array<{ path: string; pv: number; uv: number }>;
  top_refs: Array<{ source: string; uv: number; pv: number }>;
  devices: Array<{ device: string; uv: number }>;
  browsers: Array<{ browser: string; uv: number }>;
  os: Array<{ os: string; uv: number }>;
  utm: Array<{ source: string; medium: string; campaign: string; uv: number }>;
  top_searches: Array<{ q: string; n: number }>;
  top_clicks: Array<{ target: string; n: number }>;
}

export async function fetchAdminDashboard(): Promise<{
  data: AdminDashboard | null;
  error?: string;
}> {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb.rpc("admin_dashboard");
    if (error) return { data: null, error: error.message };
    return { data: data as AdminDashboard };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "service client init error",
    };
  }
}

export async function fetchAdminSummary(): Promise<{
  data: AdminSummary | null;
  error?: string;
}> {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb.rpc("admin_summary");
    if (error) return { data: null, error: error.message };
    return { data: data as AdminSummary };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "service client init error",
    };
  }
}
