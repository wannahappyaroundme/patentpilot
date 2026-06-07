-- PatentRank 5축 가중 종합 점수 + 등급 컬럼 추가
-- 사전 계산 ETL: scripts/precompute-patent-rank.mjs 실행 후 채워짐
-- 효과: 풀 200건 한정 제거 → 전체 활성 풀 104,582건에서 DB-side 정렬·필터·통계 가능

alter table public.patents
  add column if not exists patent_rank      smallint,
  add column if not exists patent_rank_grade text;

-- 정렬용 인덱스 — DESC + NULLS LAST 패턴
create index if not exists idx_patents_patent_rank
  on public.patents (patent_rank desc nulls last)
  where latest_status = '연차료납부';

-- 등급 필터용 인덱스
create index if not exists idx_patents_patent_rank_grade
  on public.patents (patent_rank_grade)
  where latest_status = '연차료납부';

-- 통계 RPC — 전수 분포 집계 (샘플 2000 → 104,582 활성 풀)
create or replace function public.patent_rank_distribution()
returns table (
  total_active     bigint,
  mean_overall     numeric,
  median_overall   smallint,
  p25_overall      smallint,
  p75_overall      smallint,
  grade            text,
  grade_count      bigint
)
language sql
stable
as $$
  with pool as (
    select patent_rank, patent_rank_grade
    from public.patents
    where latest_status = '연차료납부' and patent_rank is not null
  ),
  agg as (
    select
      count(*) as total_active,
      round(avg(patent_rank), 1) as mean_overall,
      percentile_cont(0.5)  within group (order by patent_rank)::smallint as median_overall,
      percentile_cont(0.25) within group (order by patent_rank)::smallint as p25_overall,
      percentile_cont(0.75) within group (order by patent_rank)::smallint as p75_overall
    from pool
  ),
  grades as (
    select patent_rank_grade as grade, count(*) as grade_count
    from pool
    group by patent_rank_grade
  )
  select
    a.total_active, a.mean_overall, a.median_overall, a.p25_overall, a.p75_overall,
    g.grade, g.grade_count
  from agg a cross join grades g;
$$;

-- 종합 점수 히스토그램 (5점 단위)
create or replace function public.patent_rank_histogram()
returns table (bin smallint, count bigint)
language sql
stable
as $$
  select
    ((patent_rank / 5) * 5)::smallint as bin,
    count(*) as count
  from public.patents
  where latest_status = '연차료납부' and patent_rank is not null
  group by bin
  order by bin;
$$;

-- 기관별 평균 PatentRank Top
create or replace function public.patent_rank_top_orgs(min_count int default 20, top_n int default 15)
returns table (org_name text, avg_overall smallint, patent_count bigint)
language sql
stable
as $$
  select
    coalesce(nullif(university_name, ''), applicant) as org_name,
    round(avg(patent_rank))::smallint as avg_overall,
    count(*) as patent_count
  from public.patents
  where latest_status = '연차료납부' and patent_rank is not null
  group by coalesce(nullif(university_name, ''), applicant)
  having count(*) >= min_count
  order by avg_overall desc
  limit top_n;
$$;
