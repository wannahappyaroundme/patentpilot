-- 쓰기 경로 일원화 (실배포 보안 강화 A안)
--
-- 배경: applications/listings/events에 `with check (true)` anon INSERT 정책이 있어
-- 브라우저에 노출되는 anon 키로 API를 우회한 직접 쓰기(스팸)가 가능했다.
-- API 라우트(loi/list/events)는 이미 service_role 클라이언트로 insert하므로
-- (service_role은 RLS 우회) 이 정책들은 제거해도 정상 경로에 영향이 없다.
--
-- 적용 후: 쓰기는 반드시 API의 레이트리밋·입력 검증을 통과해야만 DB에 도달.

drop policy if exists applications_insert on public.applications;
drop policy if exists listings_insert on public.listings;
drop policy if exists events_insert on public.events;

-- 검증: 아래 쿼리 결과에 위 3개 정책이 없어야 함
-- select tablename, policyname, cmd from pg_policies
--  where schemaname = 'public'
--    and tablename in ('applications', 'listings', 'events');
