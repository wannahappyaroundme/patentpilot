import type { NextRequest } from "next/server";

/**
 * In-memory sliding-window rate limiter.
 * - Vercel serverless 환경에서는 인스턴스 cold start마다 초기화됨 → 무료 티어 보호용으로 충분.
 * - 본격 운영 시 Upstash Redis나 Supabase로 이전 권장.
 */

type Bucket = { ts: number[] };
const store = new Map<string, Bucket>();

// 메모리 누수 방지: 1000개 키 초과 시 가장 오래된 키 1/3 정리
function gc() {
  if (store.size < 1000) return;
  const toDrop = Math.floor(store.size / 3);
  let i = 0;
  for (const k of store.keys()) {
    if (i++ >= toDrop) break;
    store.delete(k);
  }
}

export function getClientIp(req: NextRequest): string {
  // Vercel: x-forwarded-for, x-real-ip
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "anon";
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  resetSec: number;
}

/**
 * `limit`회 / `windowSec`초 슬라이딩 윈도우.
 * 예: `rateLimit(req, "loi", 5, 3600)` → IP당 1시간에 5회.
 */
export function rateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowSec: number,
): RateLimitResult {
  gc();
  const ip = getClientIp(req);
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const cutoff = now - windowMs;

  const bucket = store.get(key) ?? { ts: [] };
  // 윈도우 밖 타임스탬프 제거
  const ts = bucket.ts.filter((t) => t > cutoff);
  const ok = ts.length < limit;
  if (ok) ts.push(now);
  store.set(key, { ts });

  const oldest = ts[0] ?? now;
  const resetSec = Math.max(0, Math.ceil((oldest + windowMs - now) / 1000));
  return {
    ok,
    remaining: Math.max(0, limit - ts.length),
    limit,
    resetSec,
  };
}

/**
 * 429 응답에 표준 헤더 부착.
 */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "Retry-After": String(r.resetSec),
  };
}
