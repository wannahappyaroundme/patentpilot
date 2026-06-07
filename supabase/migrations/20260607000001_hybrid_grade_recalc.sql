-- 하이브리드 PatentRank 등급 컷오프 적용
--
-- 원본 컷오프(80/65/50/35) 적용 결과 B등급이 67.7%로 편향됨.
-- 사용자 결정: S≥80, A≥65는 절대 기준 유지, B/C/D는 점수 65 미만 풀의 분위수로 재분할.
-- 분위 분할: B 상위 40% / C 중위 40% / D 하위 20% (D 편향 시연 사고 방지)
--
-- 실행 후 출력되는 분위수 값을 src/lib/patent-rank.ts patentRankGrade()에 동기화해야 함.

-- 1) 분위수 측정 (B/C/D 영역만)
do $$
declare
  v_p_cd numeric;  -- C/D 경계
  v_p_bc numeric;  -- B/C 경계
  v_total bigint;
begin
  select count(*) into v_total
  from public.patents
  where latest_status = '연차료납부' and patent_rank is not null and patent_rank < 65;

  select
    percentile_cont(0.20) within group (order by patent_rank),
    percentile_cont(0.60) within group (order by patent_rank)
  into v_p_cd, v_p_bc
  from public.patents
  where latest_status = '연차료납부' and patent_rank is not null and patent_rank < 65;

  raise notice '=== B/C/D 영역 분위수 ===';
  raise notice 'B/C/D 영역 총 매물: %', v_total;
  raise notice 'C/D 경계 (하위 20%% 분위수): %', v_p_cd;
  raise notice 'B/C 경계 (하위 60%% 분위수): %', v_p_bc;
  raise notice '신규 컷오프: S≥80 · A≥65 · B≥% · C≥% · D<%', round(v_p_bc), round(v_p_cd), round(v_p_cd);
end $$;

-- 2) 분위수 기반 grade UPDATE (단일 트랜잭션)
with cutoffs as (
  select
    -- C/D 경계: 하위 20% 분위수 (D 약 20%)
    percentile_cont(0.20) within group (order by patent_rank)::int as p_cd,
    -- B/C 경계: 하위 60% 분위수 (C 약 40%, B 약 40%)
    percentile_cont(0.60) within group (order by patent_rank)::int as p_bc
  from public.patents
  where latest_status = '연차료납부' and patent_rank is not null and patent_rank < 65
)
update public.patents p
set patent_rank_grade = case
    when p.patent_rank >= 80 then 'S'
    when p.patent_rank >= 65 then 'A'
    when p.patent_rank >= (select p_bc from cutoffs) then 'B'
    when p.patent_rank >= (select p_cd from cutoffs) then 'C'
    else 'D'
  end
where p.latest_status = '연차료납부' and p.patent_rank is not null;

-- 3) 신규 등급 분포 출력
select
  patent_rank_grade,
  count(*) as cnt,
  round((count(*)::numeric / sum(count(*)) over () * 100), 1) as pct
from public.patents
where latest_status = '연차료납부' and patent_rank is not null
group by patent_rank_grade
order by patent_rank_grade;
