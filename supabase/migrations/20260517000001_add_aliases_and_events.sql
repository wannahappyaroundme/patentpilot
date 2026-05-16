-- W2.5 마이그레이션
--   1) companies.aliases  : 기업명 한글/영문 변형 (협력 이력 매칭용)
--   2) events             : 페이지뷰·클릭 등 인터랙션 트래킹

-- =============================================================
-- 1) companies.aliases
-- =============================================================
alter table public.companies
  add column if not exists aliases text not null default '';

-- =============================================================
-- 2) events — 익명 인터랙션 트래킹
-- =============================================================
create table if not exists public.events (
  id                bigserial primary key,
  event_name        text not null,                 -- 'page_view', 'click', 'search', 'loi_submit' 등
  path              text not null default '',      -- 페이지 경로
  ref               text not null default '',      -- referrer
  meta              jsonb not null default '{}'::jsonb,
  session_id        text not null default '',      -- 클라이언트가 생성한 익명 세션 ID
  user_agent        text not null default '',
  created_at        timestamptz not null default now()
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_event_name_idx on public.events (event_name);
create index if not exists events_path_idx on public.events (path);

-- RLS: 익명 insert 허용, select는 service_role만
alter table public.events enable row level security;

drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert with check (true);

-- =============================================================
-- 3) Admin 통계 RPC들
-- =============================================================

-- 24h/7d 페이지뷰 + 클릭 + 신청 집계
create or replace function public.admin_summary()
returns json
language sql
stable
as $$
  with t as (
    select
      count(*) filter (where event_name = 'page_view' and created_at >= now() - interval '24 hours') as pv_24h,
      count(*) filter (where event_name = 'page_view' and created_at >= now() - interval '7 days')  as pv_7d,
      count(*) filter (where event_name = 'click'     and created_at >= now() - interval '24 hours') as click_24h,
      count(*) filter (where event_name = 'click'     and created_at >= now() - interval '7 days')   as click_7d,
      count(*) filter (where event_name = 'search'    and created_at >= now() - interval '7 days')   as search_7d
    from public.events
  ),
  a as (
    select
      count(*)                                                                         as loi_total,
      count(*) filter (where created_at >= now() - interval '24 hours')                 as loi_24h,
      count(*) filter (where created_at >= now() - interval '7 days')                   as loi_7d
    from public.applications
  ),
  p as (
    select count(*) as patents_total from public.patents
  ),
  top_pages as (
    select coalesce(json_agg(row_to_json(t)), '[]'::json) as rows from (
      select path, count(*) as n
      from public.events
      where event_name = 'page_view' and created_at >= now() - interval '7 days' and path <> ''
      group by path
      order by n desc
      limit 10
    ) t
  ),
  top_clicks as (
    select coalesce(json_agg(row_to_json(t)), '[]'::json) as rows from (
      select coalesce(meta->>'target', meta->>'label', '?') as target, count(*) as n
      from public.events
      where event_name = 'click' and created_at >= now() - interval '7 days'
      group by target
      order by n desc
      limit 10
    ) t
  ),
  top_searches as (
    select coalesce(json_agg(row_to_json(t)), '[]'::json) as rows from (
      select coalesce(meta->>'q', '') as q, count(*) as n
      from public.events
      where event_name = 'search' and created_at >= now() - interval '30 days' and coalesce(meta->>'q','') <> ''
      group by q
      order by n desc
      limit 10
    ) t
  ),
  pv_daily as (
    select coalesce(json_agg(row_to_json(t) order by t.day), '[]'::json) as rows from (
      select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, count(*) as n
      from public.events
      where event_name = 'page_view' and created_at >= now() - interval '14 days'
      group by day
      order by day
    ) t
  )
  select json_build_object(
    'pv_24h', (select pv_24h from t),
    'pv_7d', (select pv_7d from t),
    'click_24h', (select click_24h from t),
    'click_7d', (select click_7d from t),
    'search_7d', (select search_7d from t),
    'loi_total', (select loi_total from a),
    'loi_24h', (select loi_24h from a),
    'loi_7d', (select loi_7d from a),
    'patents_total', (select patents_total from p),
    'top_pages', (select rows from top_pages),
    'top_clicks', (select rows from top_clicks),
    'top_searches', (select rows from top_searches),
    'pv_daily', (select rows from pv_daily)
  );
$$;
