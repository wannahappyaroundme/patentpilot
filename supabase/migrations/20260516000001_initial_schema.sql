-- PatentPilot 초기 스키마 (W1)
-- 매물(patents) + 매수 후보 기업(companies) + IPC 매핑(ipc_company) + LOI(applications)

create extension if not exists pg_trgm;

-- =============================================================
-- 1) patents — 매물 풀 약 10.5만 행 (활성 104,582 실측)
-- =============================================================
create table if not exists public.patents (
  application_number     text primary key,
  title                  text not null default '',
  applicant              text not null default '',
  university_name        text not null default '',
  org_type               text not null check (org_type in ('UNIV','GRI','OTHER')),
  application_date       date,
  registration_date      date,
  expiration_date        date,
  ipc_primary            text not null default '',
  ipc_all                text not null default '',
  claims_count           integer not null default 0,
  family_count           integer not null default 0,
  citation_count         integer not null default 0,
  transfer_count         integer not null default 0,
  transfer_events        integer not null default 0,
  legal_status           text not null default '',
  final_disposal         text not null default '',
  latest_status          text,
  latest_status_date     date,
  rnd_department         text not null default '',
  kipris_link            text not null default '',
  urgency                text not null check (urgency in ('RED','YELLOW','GREEN')),
  remaining_years        integer,
  created_at             timestamptz not null default now()
);

create index if not exists patents_urgency_idx on public.patents (urgency);
create index if not exists patents_org_type_idx on public.patents (org_type);
create index if not exists patents_ipc_primary_idx on public.patents (ipc_primary);
create index if not exists patents_university_name_idx on public.patents (university_name);
create index if not exists patents_latest_status_idx on public.patents (latest_status);
create index if not exists patents_title_trgm_idx on public.patents using gin (title gin_trgm_ops);
create index if not exists patents_applicant_trgm_idx on public.patents using gin (applicant gin_trgm_ops);

-- =============================================================
-- 2) companies — 매수 후보 기업 시드 30~50
-- =============================================================
create table if not exists public.companies (
  id                     bigserial primary key,
  name                   text not null unique,
  industry               text not null default '',
  description            text not null default '',
  revenue_band           text not null default '',
  website                text not null default '',
  created_at             timestamptz not null default now()
);

-- =============================================================
-- 3) ipc_company — IPC 코드 ↔ 기업 매핑 가중치
-- =============================================================
create table if not exists public.ipc_company (
  id                     bigserial primary key,
  ipc_prefix             text not null,
  company_id             bigint not null references public.companies(id) on delete cascade,
  weight                 numeric(4,3) not null default 1.0,
  note                   text not null default '',
  unique (ipc_prefix, company_id)
);

create index if not exists ipc_company_prefix_idx on public.ipc_company (ipc_prefix);

-- =============================================================
-- 4) applications — 거래 신청(LOI) lead
-- =============================================================
create table if not exists public.applications (
  id                     bigserial primary key,
  patent_application_number text references public.patents(application_number),
  company_name           text not null,
  contact_name           text not null,
  contact_email          text not null,
  contact_phone          text not null default '',
  proposed_amount        text not null default '',
  message                text not null default '',
  created_at             timestamptz not null default now()
);

create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- =============================================================
-- 5) 통계 RPC — 랜딩 라이브 카운터용
-- =============================================================
create or replace function public.market_stats()
returns json
language sql
stable
as $$
  select json_build_object(
    'total', (select count(*) from public.patents),
    'red',   (select count(*) from public.patents where urgency = 'RED'),
    'yellow',(select count(*) from public.patents where urgency = 'YELLOW'),
    'green', (select count(*) from public.patents where urgency = 'GREEN'),
    'univ',  (select count(*) from public.patents where org_type = 'UNIV'),
    'gri',   (select count(*) from public.patents where org_type = 'GRI'),
    'top_universities', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select university_name, count(*) as n
        from public.patents
        where university_name <> ''
        group by university_name
        order by n desc
        limit 10
      ) t
    )
  );
$$;

-- =============================================================
-- 6) RLS — 읽기 공개, 쓰기는 service_role만
-- =============================================================
alter table public.patents enable row level security;
alter table public.companies enable row level security;
alter table public.ipc_company enable row level security;
alter table public.applications enable row level security;

drop policy if exists patents_read on public.patents;
create policy patents_read on public.patents for select using (true);

drop policy if exists companies_read on public.companies;
create policy companies_read on public.companies for select using (true);

drop policy if exists ipc_company_read on public.ipc_company;
create policy ipc_company_read on public.ipc_company for select using (true);

drop policy if exists applications_insert on public.applications;
create policy applications_insert on public.applications for insert with check (true);
