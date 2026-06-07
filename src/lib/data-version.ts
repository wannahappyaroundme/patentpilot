/**
 * 데이터 신선도 표시용 메타데이터.
 *
 * 2026-06-07 실측 동기화: 활성 풀 count(*) = 104,582 (latest_status='연차료납부').
 * urgency 분포도 SQL group by 측정값으로 동기화 — RED 19,723 (18.9%) /
 * YELLOW 52,554 (50.2%) / GREEN 32,305 (30.9%). YELLOW가 최대 구간으로
 * 매도 동기가 임계점에 가까운 매물이 풀의 절반.
 *
 * 업데이트 절차:
 * 1) ETL이 새 스냅샷을 Supabase에 반영하면 KIPRIS_SYNC_DATE 갱신
 * 2) 활성 풀 변동 시 select count(*) from patents where latest_status='연차료납부'로 재측정
 * 3) urgency 분포: select urgency, count(*) ... group by urgency
 */
export const KIPRIS_SYNC_DATE = "2026-06-07";

export const TOTAL_ACTIVE_PATENTS = 104_582;
// 실측 동기화값 (SQL group by urgency 결과)
export const RED_COUNT = 19_723;
export const YELLOW_COUNT = 52_554;
export const GREEN_COUNT = 32_305;

export function formatSyncBadge(): string {
  return `KIPRIS 동기화: ${KIPRIS_SYNC_DATE}`;
}
