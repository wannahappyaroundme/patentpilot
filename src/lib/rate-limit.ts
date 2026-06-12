import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * 레이트리미터 — Upstash Redis 기반 (인스턴스 간 공유).
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN 미설정 시
 * 인메모리 슬라이딩 윈도우로 폴백 (로컬 dev·CI용 — Vercel 운영에선 반드시 Upstash).
 */

export function getClientIp(req: NextRequest): string {
  // Vercel이 x-forwarded-for를 신뢰 가능한 값으로 덮어씀
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

// ---------- Upstash ----------

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();
let warnedFallback = false;

function getLimiter(scope: string, limit: number, windowSec: number): Ratelimit {
  const key = `${scope}:${limit}:${windowSec}`;
  let rl = limiters.get(key);
  if (!rl) {
    redis ??= Redis.fromEnv();
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `pp:rl:${scope}`,
    });
    limiters.set(key, rl);
  }
  return rl;
}

/**
 * `limit`회 / `windowSec`초 슬라이딩 윈도우.
 * 예: `await rateLimit(req, "loi", 5, 3600)` → IP당 1시간에 5회.
 */
export async function rateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (!hasUpstash) {
    if (!warnedFallback) {
      console.warn(
        "[rate-limit] Upstash env 미설정 — 인메모리 폴백 동작 중 (운영 환경에선 UPSTASH_REDIS_REST_URL/TOKEN 필수)",
      );
      warnedFallback = true;
    }
    return memoryRateLimit(req, scope, limit, windowSec);
  }
  try {
    const ip = getClientIp(req);
    const r = await getLimiter(scope, limit, windowSec).limit(ip);
    return {
      ok: r.success,
      remaining: r.remaining,
      limit: r.limit,
      resetSec: Math.max(0, Math.ceil((r.reset - Date.now()) / 1000)),
    };
  } catch (e) {
    // Upstash 장애가 서비스 장애로 번지지 않게 폴백 (외부 API 예외 격리 원칙)
    console.error("[rate-limit] Upstash 오류 — 인메모리 폴백", e);
    return memoryRateLimit(req, scope, limit, windowSec);
  }
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

// ---------- 인메모리 폴백 (기존 구현) ----------

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

function memoryRateLimit(
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
