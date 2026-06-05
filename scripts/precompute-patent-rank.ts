/**
 * PatentRank 사전 계산 ETL.
 *
 * 모든 활성 매물의 patent_rank·patent_rank_grade를 계산하고 DB에 적재한다.
 * 사전 작업: supabase/migrations/20260605000001_add_patent_rank_columns.sql 적용.
 *
 * 사용:
 *   # 1. 환경변수 (.env.local) 확인
 *   #    NEXT_PUBLIC_SUPABASE_URL=...
 *   #    SUPABASE_SERVICE_ROLE_KEY=...  (service role, anon 아님)
 *   # 2. 실행
 *   npm run precompute-rank
 *
 * 예상 소요: 158,000건 ÷ 1,000건/batch ÷ 4 동시성 = 약 5~8분.
 * 효과: 매물 카드/시장 페이지/통계 페이지 모두 "풀 200건 한정" 제거 → 전수 정렬·필터·통계.
 */

// Node 20에서 supabase-js realtime이 native WebSocket을 찾지 못해 실패하므로
// 'ws' 패키지로 globalThis.WebSocket 폴리필. Node 22+ 에서는 무해 (이미 존재).
import WS from "ws";
if (typeof (globalThis as { WebSocket?: unknown }).WebSocket === "undefined") {
  (globalThis as { WebSocket: unknown }).WebSocket = WS;
}

import { createClient } from "@supabase/supabase-js";
import { patentRank, patentRankGrade } from "../src/lib/patent-rank";
import type { PatentRow } from "../src/lib/types";

const BATCH_SIZE = 1000;
const UPDATE_CONCURRENCY = 4;

function loadEnv(): { url: string; key: string } {
  // Next.js와 동일하게 .env.local 우선
  // dotenv 의존성 없이 process.env만 사용 — 호출 측에서 export 필요
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  if (!url || !key) {
    console.error(
      "[error] 환경변수 누락: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
    );
    console.error("        .env.local 확인 후 다음과 같이 실행:");
    console.error("        npm run precompute-rank");
    process.exit(2);
  }
  return { url, key };
}

interface UpdateRow {
  application_number: string;
  patent_rank: number;
  patent_rank_grade: string;
}

async function fetchBatch(
  sb: ReturnType<typeof createClient>,
  offset: number,
): Promise<PatentRow[]> {
  const { data, error } = await sb
    .from("patents")
    .select("*")
    .eq("latest_status", "연차료납부")
    .order("application_number", { ascending: true })
    .range(offset, offset + BATCH_SIZE - 1);
  if (error) {
    throw new Error(`fetch offset=${offset}: ${error.message}`);
  }
  return (data ?? []) as PatentRow[];
}

async function fetchTotalCount(
  sb: ReturnType<typeof createClient>,
): Promise<number> {
  const { count, error } = await sb
    .from("patents")
    .select("application_number", { count: "exact", head: true })
    .eq("latest_status", "연차료납부");
  if (error) throw new Error(`count: ${error.message}`);
  return count ?? 0;
}

async function applyUpdates(
  sb: ReturnType<typeof createClient>,
  rows: UpdateRow[],
): Promise<void> {
  // Supabase는 개별 UPDATE를 지원, bulk UPDATE는 PostgREST가 안 받음.
  // → 동시 UPDATE를 N개씩 처리. 또는 upsert (INSERT ON CONFLICT)로 묶기.
  // upsert를 쓰면 전체 row를 다시 보내야 하므로 비싸짐.
  // → 각 row를 개별 update + 동시성 제한으로 처리.
  const chunks: UpdateRow[][] = [];
  for (let i = 0; i < rows.length; i += UPDATE_CONCURRENCY) {
    chunks.push(rows.slice(i, i + UPDATE_CONCURRENCY));
  }
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map((r) =>
        sb
          .from("patents")
          .update({
            patent_rank: r.patent_rank,
            patent_rank_grade: r.patent_rank_grade,
          })
          .eq("application_number", r.application_number),
      ),
    );
  }
}

async function main() {
  const { url, key } = loadEnv();
  const sb = createClient(url, key, {
    auth: { persistSession: false },
  });

  console.log("[info] 활성 매물 총 개수 조회 중...");
  const total = await fetchTotalCount(sb);
  console.log(`[info] 총 ${total.toLocaleString()}건 (연차료납부 상태)`);

  if (total === 0) {
    console.log("[done] 적재할 매물이 없습니다.");
    return;
  }

  const t0 = Date.now();
  let processed = 0;
  let updated = 0;

  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    const rows = await fetchBatch(sb, offset);
    if (rows.length === 0) break;

    const updates: UpdateRow[] = rows.map((p) => {
      const r = patentRank(p);
      const g = patentRankGrade(r.overall);
      return {
        application_number: p.application_number,
        patent_rank: r.overall,
        patent_rank_grade: g.grade,
      };
    });

    await applyUpdates(sb, updates);
    processed += rows.length;
    updated += updates.length;

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const pct = ((processed / total) * 100).toFixed(1);
    const eta = (
      ((Date.now() - t0) / processed) * (total - processed) / 1000
    ).toFixed(0);
    console.log(
      `  [${pct}%] offset=${offset.toLocaleString()} · ${processed.toLocaleString()}/${total.toLocaleString()} · ${elapsed}s 경과 · ETA ${eta}s`,
    );
  }

  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("");
  console.log(
    `[done] ${updated.toLocaleString()}건 업데이트 완료 · 총 ${totalSec}s 소요`,
  );
  console.log("");
  console.log("다음 단계:");
  console.log("  1) Supabase SQL editor에서 분포 확인:");
  console.log("       select patent_rank_grade, count(*) from patents");
  console.log("       where latest_status = '연차료납부' group by 1 order by 1;");
  console.log("  2) 사이트에서 /stats/patent-rank 페이지 확인 (캐시 30분)");
  console.log("  3) /market 에서 'PatentRank 높은순' 정렬 + 등급 칩 사용 — 풀 한정 라벨 사라짐");
}

main().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
