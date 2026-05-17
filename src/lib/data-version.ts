/**
 * 데이터 신선도 표시용 메타데이터.
 *
 * 업데이트 절차:
 * 1) ETL 파이프라인이 새 KIPRIS 스냅샷을 Supabase에 반영하면
 * 2) 이 파일의 `KIPRIS_SYNC_DATE` 값을 ISO 날짜로 갱신 후 커밋
 *
 * (자동화는 v2에서 — 현재는 수동 1줄 업데이트)
 */
export const KIPRIS_SYNC_DATE = "2026-05-17";

export const TOTAL_ACTIVE_PATENTS = 158_777;
export const RED_COUNT = 24_677;
export const YELLOW_COUNT = 57_933;
export const GREEN_COUNT = 76_167;

export function formatSyncBadge(): string {
  return `KIPRIS 동기화: ${KIPRIS_SYNC_DATE}`;
}
