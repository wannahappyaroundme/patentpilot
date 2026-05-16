# PatentPilot W2 Marketplace Implementation Plan

**Goal:** 매물 리스트 검색·필터·페이지네이션 + 매물 상세 + 매수 후보 매칭 Top 5 + LOI 거래신청 폼까지 라이브 작동.

**Spec:** `docs/superpowers/specs/2026-05-16-patentpilot-design.md` §5(매칭) + §6(화면 2/3/5)

## File Structure

```
src/
├── app/
│   ├── market/page.tsx                 # 검색 + 필터 + 카드 리스트
│   ├── patent/[appNo]/page.tsx         # 매물 상세
│   ├── apply/page.tsx                  # LOI 폼 (Server Action)
│   └── api/
│       ├── search/route.ts             # GET 매물 검색
│       └── loi/route.ts                # POST 거래 신청
├── components/
│   ├── filters-sidebar.tsx             # 좌측 필터
│   ├── patent-card.tsx                 # 매물 카드
│   ├── patent-meta.tsx                 # 매물 상세 메타 그리드
│   ├── match-candidates.tsx            # 매수 후보 Top 5
│   ├── pagination.tsx
│   └── loi-form.tsx                    # 거래 신청 폼 (client)
└── lib/
    ├── patents.ts                      # Supabase 검색·상세 쿼리
    └── matching.ts                     # 룰베이스 매칭 (IPC prefix → 기업)
```

## Phases

### Phase A — 검색 인프라
- A1 `lib/patents.ts` — `searchPatents({q, urgency, org, ipc, page, sort})`
- A2 `/api/search/route.ts` — URL 쿼리 → searchPatents
- A3 `components/patent-card.tsx`
- A4 `components/filters-sidebar.tsx` + `pagination.tsx`
- A5 `/market/page.tsx` — searchParams로 SSR

### Phase B — 매물 상세
- B1 `lib/patents.ts` — `getPatentByAppNo(appNo)`
- B2 `components/patent-meta.tsx`
- B3 `/patent/[appNo]/page.tsx` — KIPRIS 새창 + 통계

### Phase C — 매칭
- C1 `lib/matching.ts` — IPC prefix 추출 + 기업 매핑 lookup + 점수 계산
- C2 `components/match-candidates.tsx` — 매물 상세에 통합
- C3 (선택) `/api/match/[appNo]/route.ts`

### Phase D — LOI 거래 신청
- D1 `components/loi-form.tsx` — client form, useFormState
- D2 `/api/loi/route.ts` — POST → Supabase insert
- D3 `/apply/page.tsx` — 폼 + 성공 후 토스트

## Verification
- 각 Phase 끝마다 build + 로컬 dev + curl 응답 확인 후 commit + push
- 마지막에 Vercel production 자동 배포 확인
