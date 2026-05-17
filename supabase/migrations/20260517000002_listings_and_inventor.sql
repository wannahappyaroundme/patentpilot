-- W2.6 마이그레이션
--   1) patents.inventor      : 발명자 텍스트 (별도 ETL로 채움)
--   2) listings              : 매도자(TLO·정출연) 매물 등록 신청
--   3) admin_summary v2      : listings 카운트 추가

-- =============================================================
-- 1) patents.inventor
-- =============================================================
alter table public.patents
  add column if not exists inventor text not null default '';

create index if not exists patents_inventor_trgm_idx
  on public.patents using gin (inventor gin_trgm_ops);

-- =============================================================
-- 2) listings — 매도자 매물 등록 lead
-- =============================================================
create table if not exists public.listings (
  id                          bigserial primary key,
  -- 출원번호(이미 DB에 있는 매물 식별) 또는 비어있으면 신규 매물 자유 등록
  patent_application_number   text,
  -- 매물 정보
  title                       text not null,
  applicant                   text not null default '',
  ipc_primary                 text not null default '',
  proposed_price              text not null default '',
  -- 담당자
  org_name                    text not null,
  contact_name                text not null,
  contact_email               text not null,
  contact_phone               text not null default '',
  -- 추가
  message                     text not null default '',
  status                      text not null default 'pending'
                                check (status in ('pending','reviewing','listed','rejected')),
  created_at                  timestamptz not null default now()
);

create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_status_idx on public.listings (status);

alter table public.listings enable row level security;

drop policy if exists listings_insert on public.listings;
create policy listings_insert on public.listings for insert with check (true);

-- =============================================================
-- 3) admin_summary v2 (listings 포함)
-- =============================================================
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
  l as (
    select
      count(*)                                                                         as list_total,
      count(*) filter (where created_at >= now() - interval '24 hours')                 as list_24h,
      count(*) filter (where created_at >= now() - interval '7 days')                   as list_7d,
      count(*) filter (where status = 'pending')                                        as list_pending
    from public.listings
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
    'list_total', (select list_total from l),
    'list_24h', (select list_24h from l),
    'list_7d', (select list_7d from l),
    'list_pending', (select list_pending from l),
    'patents_total', (select patents_total from p),
    'top_pages', (select rows from top_pages),
    'top_clicks', (select rows from top_clicks),
    'top_searches', (select rows from top_searches),
    'pv_daily', (select rows from pv_daily)
  );
$$;
