/**
 * 데이터 신선도 표시용 메타데이터.
 *
 * 2026-06-07 정정: 실제 활성 풀 count(*) = 104,582 (latest_status='연차료납부').
 * 기존 158,777 추정치는 무효. RED/YELLOW/GREEN은 기존 비율(15.5/36.5/48.0%)을 적용한
 * 임시 추정값이며, urgency 분포 SQL 측정 후 정확한 값으로 동기화 예정.
 *
 * 업데이트 절차:
 * 1) ETL이 새 스냅샷을 Supabase에 반영하면 KIPRIS_SYNC_DATE 갱신
 * 2) 활성 풀 변동 시 select count(*) from patents where latest_status='연차료납부'로 재측정
 * 3) urgency 분포: select urgency, count(*) ... group by urgency
 */
export const KIPRIS_SYNC_DATE = "2026-06-07";

export const TOTAL_ACTIVE_PATENTS = 104_582;
// 임시 추정값 (기존 비율 적용) — 정확한 SQL 측정 후 동기화 예정
export const RED_COUNT = 16_253;
export const YELLOW_COUNT = 38_159;
export const GREEN_COUNT = 50_170;

export function formatSyncBadge(): string {
  return `KIPRIS 동기화: ${KIPRIS_SYNC_DATE}`;
}
