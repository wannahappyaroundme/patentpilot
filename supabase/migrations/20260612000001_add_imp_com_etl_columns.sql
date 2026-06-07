-- IMP·COM 보강 ETL 컬럼 추가
--
-- CitationSpan (IMP 0.20 일부): forward citation들의 IPC 다양성 (Shannon entropy)
-- PriorPatentCount (COM 0.25 일부): 발명자별 5년-윈도우 누적 prior 특허 평균
--
-- 사전 조건: ETL 두 스크립트 실행으로 CSV 생성 후 load_imp_com.py 적재
--   python -m patentpilot_etl.citation_span
--   python -m patentpilot_etl.prior_patent_count
--   python -m patentpilot_etl.load_imp_com
--
-- 적용 후 patent-rank.ts imp/com 계산이 새 컬럼을 자동 사용 (graceful fallback)

alter table public.patents
  add column if not exists citation_span_norm     smallint,
  add column if not exists citation_span_n        smallint,
  add column if not exists citation_span_conf     text,
  add column if not exists prior_patent_count     smallint,
  add column if not exists prior_patent_count_max smallint,
  add column if not exists prior_patent_conf      text;

-- 활성 풀 partial 인덱스 (정렬/필터용)
create index if not exists idx_patents_citation_span
  on public.patents (citation_span_norm)
  where latest_status = '연차료납부';

create index if not exists idx_patents_prior_patent
  on public.patents (prior_patent_count)
  where latest_status = '연차료납부';

-- 검증 쿼리 (참고용 — 적재 후 실행 권장):
--
--   select count(*) total,
--          count(citation_span_norm) span_filled,
--          count(prior_patent_count) prior_filled
--   from patents where latest_status = '연차료납부';
--
--   select citation_span_conf, count(*)
--   from patents where latest_status = '연차료납부' and citation_span_conf is not null
--   group by citation_span_conf;
