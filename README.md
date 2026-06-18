<div align="center">

# PatentPilot

### 잠자는 한국 R&D 특허를 깨우는 AI 매칭 코파일럿

대학·정출연이 보유한 **활성 R&D 특허 104,582건** 중, 연차료 부담으로 **매도 동기가 가장 강한 매물**을 자동 발굴해 매수 기업과 매칭합니다.
검색·열람은 무료, 거래가 성사될 때만 매칭 수수료를 받는 **양면 마켓플레이스**입니다.

**🌐 Live** · **[patentpilot-livid.vercel.app](https://patentpilot-livid.vercel.app)**
🤖 AI 검색 → [/chat](https://patentpilot-livid.vercel.app/chat) &nbsp;·&nbsp; 🛒 매물 → [/market](https://patentpilot-livid.vercel.app/market) &nbsp;·&nbsp; 📊 방법론 → [/about/patent-rank](https://patentpilot-livid.vercel.app/about/patent-rank)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/) [![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com/) [![Upstash](https://img.shields.io/badge/Upstash-Redis-00E9A3?logo=upstash)](https://upstash.com/) [![Sentry](https://img.shields.io/badge/Sentry-error%20tracking-362D59?logo=sentry)](https://sentry.io/) [![Vercel](https://img.shields.io/badge/Vercel-Production-black?logo=vercel)](https://vercel.com/) [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5-412991?logo=openai)](https://platform.openai.com/)

</div>

---

## 목차

1. [한 줄 가치 제안](#-한-줄-가치-제안)
2. [문제 — 연차료 절벽과 시장의 빈자리](#-문제--연차료-절벽과-시장의-빈자리)
3. [솔루션 — 양면 마켓플레이스](#-솔루션--양면-마켓플레이스)
4. [타깃 사용자](#-타깃-사용자)
5. [핵심 기능](#-핵심-기능)
6. [데이터](#-데이터)
7. [PatentRank — 5축 가치 점수 (핵심 IP)](#-patentrank--5축-가치-점수-핵심-ip)
8. [긴급도 모델 (RED/YELLOW/GREEN)](#-긴급도-모델-redyellowgreen)
9. [매수 후보 매칭 알고리즘](#-매수-후보-매칭-알고리즘)
10. [AI 코파일럿](#-ai-코파일럿)
11. [보안 & 운영 (production hardening)](#-보안--운영-production-hardening)
12. [Tech Stack](#-tech-stack)
13. [아키텍처 & 데이터 흐름](#-아키텍처--데이터-흐름)
14. [디렉토리 구조](#-디렉토리-구조)
15. [로컬 개발](#-로컬-개발)
16. [로드맵](#-로드맵)
17. [정직하게 공개하는 한계](#-정직하게-공개하는-한계)
18. [비즈니스 모델](#-비즈니스-모델)
19. [대회 · 팀 · 라이선스](#-대회--팀--라이선스)

---

## 🎯 한 줄 가치 제안

> **"한국 대학·정출연이 가진 잠자는 특허 104,582건 중, 유지비 부담으로 매도 동기가 가장 강한 매물을 발굴해 매수 기업과 거래 매칭하는 AI 코파일럿."**

- 📌 **매도측** (산학협력단 TLO · 정출연 기술이전팀): 보유 매물 등록 → 매수 후보 자동 발굴
- 📌 **매수측** (기업 R&D 팀장): 자연어로 검색 → 매물 + 기업 매칭 점수 확인 → LOI(거래의향서) 신청
- 💰 **수익 모델**: 검색·열람 무료, **거래 성사 시에만 매칭 수수료**

---

## 🔥 문제 — 연차료 절벽과 시장의 빈자리

### 공공 R&D는 세계 최고 수준인데, 그 결과물은 잠자고 있다
- 한국 정부 R&D 투자는 GDP 대비 세계 최상위권.
- 그러나 **정출연·대학 특허의 사업화율은 한 자릿수**로 추정 — 공공자금으로 만든 자산이 활용되지 못하고 있다.
- KIPRIS는 *검색*은 가능하지만 **관계 기반 탐색·매칭·가치평가는 불가능**하다.

### "지금"이어야 하는 이유 — 연차료 절벽 ⛰️
특허는 등록 후 매년 **연차료**를 내야 권리가 유지되고, 출원 8~14년차에 연차료가 급등한다. 이 구간에서 기관은 "유지 vs 포기"를 결정하며, **매도 동기가 가장 강한 매물 풀**이 형성된다.

| 긴급도 | 정의 | 실측 건수 | 비중 |
|---|---|---:|---:|
| 🔴 긴급 | 출원 15~20년차 (만료 임박) | 19,723 | 18.9% |
| 🟡 임박 | 출원 8~14년차 (**연차료 절벽**) | **52,554** | **50.2%** (최대) |
| 🟢 일반 | 출원 4~7년차 | 32,305 | 30.9% |

→ **활성 매물 풀의 절반(50.2%)이 매도 압력 임계점**에 있다. 이것이 PatentPilot의 핵심 타이밍 논거다.

### 시장의 빈자리
| | WIPSON / PatSnap | KIPRIS | **PatentPilot** |
|---|---|---|---|
| 데이터 | 글로벌 전반, 한국 R&D 얕음 | 한국 전반 | **한국 정출연·대학 특화, 깊음** |
| 인터페이스 | 검색 중심 | 검색 중심 | **자연어 + 가치 시각화** |
| 매칭 | 키워드 | 없음 | **가치 점수 + 매수 기업 자동 추천** |
| 가격 | 연 수천만~수억 정액 | 무료(검색) | **거래 성사 시에만 수수료** |
| 한국어 처리 | 약함 | 보통 | **한글 자연어 검색 최적화** |

> 지난 11년간 지식재산 데이터 활용 대회 수상작 중 **정출연·대학 특화 = 0건** — 선점 가능한 빈자리.

---

## 💡 솔루션 — 양면 마켓플레이스

```
매도측(TLO·정출연)              PatentPilot 엔진                  매수측(기업 R&D)
   매물 등록  ──────▶   PatentRank 5축 가치 점수            ◀──────  자연어 검색
   /list                + 매수 후보 Top 5 + 추천 이유                  /chat · /market
                                    │
                                    ▼
                        LOI 거래 신청 /apply  ──▶  거래 성사 시 매칭 수수료
```

**사용자 여정**: ① 말로 검색 → ② 매물 발견(목록·필터) → ③ 가치 한눈에(S~D 등급 + 5축) → ④ 매수 후보 자동(Top 5 + 이유) → ⑤ 거래의향서(LOI) 발송

**각 측이 얻는 가치**
- **매수자**: IPC·검색식을 몰라도 말로 검색 → 가치·이유가 붙은 매물 → 살 기업까지 추천 → 바로 LOI.
- **매도자**: "누가 살까?"에 대한 답(매수 후보 Top 5 + 이유)과, 점수 근거를 그대로 가져다 설명할 수 있는 자료.

---

## 👤 타깃 사용자

대회 메인 타깃은 **페르소나 1·2** (매수 기업 + 매도 TLO). 3·4·5는 동일 데이터·엔진에서 파생되는 확장이다.

| # | 페르소나 | 핵심 페인 |
|---|---|---|
| 1 | 기업 R&D 팀장 (중견 배터리사) | 외부 기술을 도입하고 싶지만 한국 R&D 특허를 찾을 도구가 없다 |
| 2 | 산학협력단 TLO 매니저 (수도권 대학) | 보유 특허 수백 건인데 누구한테 팔지 모른다 |
| 3 | 대학교수·발명자 (거점국립대) | 특허 등록 후 무엇을 해야 할지 모른다 |
| 4 | 딥테크 VC 심사역 | 스타트업 특허 가치 검증이 느리고 비싸다 |
| 5 | 정책연구자 (국책연구원) | 정부 R&D가 사업화로 이어졌는지 측정하기 어렵다 |

---

## ✨ 핵심 기능

| 기능 | 라우트 | 설명 |
|---|---|---|
| **랜딩** | `/` | 라이브 카운터 · 빠른 메뉴 · 배너 슬라이더 · 매물 테마 · 실시간 거래 신청 미리보기 |
| **매물 검색** | `/market` | 104,582건 풀에서 IPC/기관/긴급도/잔여년/등급/공동출원 필터 + 5종 정렬 + 자동완성 + PDF 출력 |
| **매물 상세** | `/patent/[appNo]` | 메타·청구항·인용·패밀리·발명자 + KIPRIS 원문 + **매수 후보 기업 Top 5** + 5축 레이더 + 관련 매물 추천 |
| **AI 코파일럿** | `/chat` | **GPT-5 + 메모리 6턴** · 자연어 → IPC/기관/긴급도 자동 추출 + 0건 시 자동 완화 검색 + 룰베이스 폴백 |
| **매물 비교** | `/compare` | 최대 20건 가로 비교표 · **드래그앤드롭 순서 변경** · 5축 비교 · PDF 인쇄 |
| **거래 신청 (매수)** | `/apply` | LOI 폼 · 클라이언트+서버 유효성 검사 · 금액 자동 콤마 |
| **매물 등록 (매도)** | `/list` | TLO/정출연용 등록 폼 · 어드민 검토 후 매칭 시작 |
| **방법론 공개** | `/about/patent-rank` | 5축 표 + 학술 근거 + 한계 + 경쟁 비교 (투명성 전략) |
| **Admin** | `/admin` | DAU/WAU/MAU · 14일 PV/UV 차트 · 유입 경로 · 디바이스/브라우저 · 검색어/클릭 Top · 거래신청/매물등록 관리 (Basic Auth 보호) |

---

## 📊 데이터

- **매물 풀 104,582건** — KIPRIS Plus 유료 API 원천 풀(대학·정출연 특허 370,666건)에서 **연차료 납부 중(`latest_status = '연차료납부'`)인 살아있는 매물만** 정제.
  - 대학 산학협력단 **69,777건 (66.7%)** + 정부출연연구기관(GRI) **34,704건 (33.2%)** + 기타 101건
- **발명자 정보 100%** — 104,582건 전부 발명자명 포함 (사람·기관 네트워크 분석의 기반)
- **매수 후보 기업 시드 83개사** — 삼성전자·LG·SK·현대·포스코·셀트리온·KT·NAVER 등
- **IPC ↔ 기업 매핑 199건** — 가중치 기반 매칭 매트릭스
- **모든 매물에서 KIPRIS 원문 직접 연결** (`doi.org/10.8080/...`)
- **등급 분포** (104,582건 실측): S 5건(0.0%) · A 7,767건(7.4%) · B 42,748건(40.9%) · C 35,136건(33.6%) · D 18,926건(18.1%)

> 데이터 스냅샷 상수(`TOTAL_ACTIVE_PATENTS`, 긴급도 분포, 등급 컷오프)는 `src/lib/data-version.ts`·`src/lib/patent-rank.ts`에 캐시되며, ETL 재적재 시 함께 갱신해야 한다 (각 파일에 재측정 SQL 주석 포함).

---

## 🧠 PatentRank — 5축 가치 점수 (핵심 IP)

국내 등록 특허 한 건을 받아 **5개 축을 0~100으로 정규화·가중합**한 뒤 등급을 부여한다. "이 특허가 얼마나 가치 있는가 / 매물로서 매력적인가"를 예측하는 신호다.

> **설계 vs 구현**: 아래 표의 *이상 공식*은 학술 근거에 기반한 풀스펙이고, 실제 MVP 코드(`src/lib/patent-rank.ts`)는 데이터가 확보된 부분만 구현한 **근사**다. `/about/patent-rank`에서 이 격차를 자발적으로 공개한다.

### 축 가중치와 근거

| 축 | 가중 | 측정 대상 | 학술 근거 | MVP 근사 (이상 대비 미구현) |
|---|---:|---|---|---|
| **INV** 혁신성 | **0.25** | 청구항 범위 + 기술 다양성 (출원 즉시 확정되는 안정 신호) | Tong & Frame 1994, Lanjouw-Schankerman 2001, THJ 1997 originality, OECD 2013 | ClaimBreadth(log) + IPCDiversity(고유 서브클래스 수 log). **BackwardCitationDiversity 미구현** → 분모 0.7 재정규화 |
| **IMP** 영향력 | **0.20** | 피인용 (다른 특허가 얼마나 인용했나) | Trajtenberg 1990, Harhoff 1999, HJT 2005, Hegde-Sampat 2009 | 연차(age) 보정 피인용수 + CitationSpan(엔트로피, N≥5). **심사관/출원인 가중·ForwardCitationQuality(PageRank) 미구현** |
| **MKT** 시장성 | **0.20** | 패밀리 규모 + 산업 시장성 | Putnam 1996, Harhoff-Scherer-Vopel 2003, Schmookler 1966 | FamilySize(log) + TAM(IPC prefix 하드코딩 매핑). **CAGR·채용수요·SEP 미구현** |
| **NET** 중심성 | **0.20** | 인용 그래프에서의 위상 | PageRank (Page-Brin-Motwani-Winograd 1998) | **in-degree(피인용수)를 PageRank proxy로 근사**. Betweenness·BridgeScore·TemporalPersistence 미구현 (IMP와 공선성은 알려진 한계, v2에서 진짜 PageRank 예정) |
| **COM** 사업화 | **0.15** | 사업화 가능성 (이진 변수 다수) | Carpenter-Narin-Woolf 1981 변형 + NTIS 연계 | 발명자 prior-patent + 공동발명자 + NTIS 과제(있으면 실값, 없으면 `rnd_department` 키워드/transfer_events 근사). **HasSpinoff·StartupLinkage 미구현** |

`overall = clip( 0.25·INV + 0.20·IMP + 0.20·MKT + 0.20·NET + 0.15·COM , 0, 100 )`

### 등급 (S/A/B/C/D)

| 등급 | 컷오프 | 도출 | 의미 |
|---|---|---|---|
| **S** | ≥80 | 학술 절대 기준 | 극상위 (실측 max=83, 사실상 이상치 5건) |
| **A** | ≥65 | 학술 절대 기준 | 우수 |
| **B** | ≥56 | 매물 풀 분위수 | 양호 |
| **C** | ≥48 | 매물 풀 분위수 | 보통 |
| **D** | <48 | 매물 풀 분위수 | 낮음 |

- **S/A는 절대 기준, B/C/D는 분위수 기반**인 하이브리드.
- B/C 컷오프는 마이그레이션 `20260607000001_hybrid_grade_recalc.sql`이 `percentile_cont`로 계산해 출력한 값을 `GRADE_CUTOFFS`에 **수동 동기화**한다 (자동 도출 아님 — 점수 분포가 바뀌면 재실행 → 갱신).

### 데이터 보강 (Enrichment)
각 ETL 단계는 특정 축에 신호를 추가하며, **NULL이면 graceful fallback**으로 휴리스틱 경로로 무음 강등된다 (precompute 전에 해당 ETL을 안 돌리면 점수가 조용히 열화).

| Enrichment | 추가 신호 | 대상 축 | 학술 기반 |
|---|---|---|---|
| `citation_span` | 인용자 IPC 분포 Shannon 엔트로피 (generality) | IMP | OECD 2013 |
| `prior_patent_count` | 발명자 5년 윈도우 누적 특허 (동명이인 black-list) | COM | Carpenter-Narin-Woolf 1981 |
| `ntis_enrich` | 정부 R&D 과제 수·예산 (실값) | COM | NTIS 연계 |

---

## 🚦 긴급도 모델 (RED/YELLOW/GREEN)

PatentRank와 **독립된** 별개 분류로, 출원연도로 연차료 부담 시점을 근사한다 (`etl/patentpilot_etl/urgency.py`, `config.py`, `CURRENT_YEAR=2026`).

| 태그 | 라벨 | 출원연도 | 연차 |
|---|---|---|---|
| **RED** | 긴급 | 2006–2011 | 15–20년차 |
| **YELLOW** | 임박 | 2012–2017 | 8–14년차 (연차료 절벽) |
| **GREEN** | 일반 | 2018–2022 | 4–7년차 |

- 이 3개 범위 밖의 특허는 active pool에서 **제외**된다.
- **잔여 권리연수** = `max(0, 만료연도 − 2026)`, 만료일 누락 시 `max(0, 출원연도 + 20 − 2026)` (한국 특허 존속기간 20년).

---

## 🎯 매수 후보 매칭 알고리즘

매수 후보 점수 = **IPC 적합도 60 + 기업 R&D 규모 20 + 협력 이력 20** (`src/lib/matching.ts`)

- **IPC 적합도**: 매물의 주 IPC prefix → 큐레이션된 기업×IPC 가중치 매트릭스(`ipc_company`)
- **매출 규모**: 대기업/중견 분류 (DART 기준 밴드)
- **협력 이력**: 공동출원자(`applicant`)·`rnd_department`에 매수 후보 기업명 또는 alias 포함 시 가산, 없으면 `transfer_events` 카운트로 폴백
- 모든 결과에 매칭 점수 + 사람이 읽을 수 있는 **사유 문자열** ("이전 이벤트 12회 — 권리 이동 활발" 등)

---

## 🤖 AI 코파일럿

`/chat`에서 자연어로 매물 검색:

```
ETRI 긴급 매물 보여줘   → 🔴 + 정출연 + ETRI
그럼 디스플레이는?       → ↑ ETRI 컨텍스트 유지 + IPC G09G 교체
배터리 KAIST 곧 만료될  → 🔴 + 대학 + KAIST + 배터리(H01M, B60L)
```

- **모델 폴백 체인**: `OPENAI_CHAT_MODEL` → `gpt-5.4-nano` → `gpt-5.4-mini` → `gpt-4.1-mini` (env 미설정 시 `gpt-5.4-nano → gpt-5.4-mini → gpt-5.5 → gpt-4.1-mini`). GPT-5 계열은 `max_completion_tokens` + `reasoning_effort`, 구형은 `max_tokens` + `temperature`.
- **메모리**: 클라이언트가 최대 10턴을 보내고, 그중 직전 **6턴(`HISTORY_LIMIT`)** 을 LLM에 전달 → 후속 질문 컨텍스트 이해.
- **자동 완화 검색**: 결과 0건이면 기관 → IPC → 기관유형 순으로 필터를 풀어 재시도하고, 무엇을 완화했는지 보고.
- **룰베이스 폴백**: OpenAI 키가 없거나 API 장애 시 `parseQuery()`로 자동 전환 (응답의 `source` 필드가 `"llm"`/`"rule"` 표시).
- **대화 기록 영구 저장**: 브라우저 localStorage에 자동 저장, 재방문 시 복원.

---

## 🔒 보안 & 운영 (production hardening)

실사용자 배포를 위해 적용한 보안·운영 장치 (`docs/superpowers/specs/2026-06-12-production-hardening-design.md`):

| 영역 | 구현 |
|---|---|
| **레이트리밋** | Upstash Redis 기반 (서버리스 인스턴스 간 공유), env 미설정 시 인메모리 폴백. 라우트별 IP 한도: chat 10/분+30/일, proposal 3/일, loi·list 5/시간, events 300/시간, search 60/분 (`src/lib/rate-limit.ts`) |
| **DB 쓰기 잠금** | `applications`/`listings`/`events`의 anon INSERT 정책 제거 — 모든 쓰기는 service-role API 라우트가 레이트리밋·검증을 통과한 뒤에만 수행 (`20260612000002_drop_anon_insert_policies.sql`) |
| **입력 검증** | 모든 쓰기 라우트에 zod 스키마 (길이 상한·이메일·전화 형식, 한국어 에러 메시지) (`src/lib/validation.ts`) |
| **프롬프트 인젝션 방어** | 제안서 초안 생성 시 사용자 입력을 `<<<DATA … DATA>>>` 블록으로 격리 + 시스템 프롬프트에 "데이터로만 취급" 지침 |
| **인증** | `/admin/*` HTTP Basic Auth, **상수 시간 비교**(`safeEqual`, Edge 런타임 대응) (`src/middleware.ts`) |
| **보안 헤더** | HSTS · X-Frame-Options: DENY · X-Content-Type-Options · Referrer-Policy · Permissions-Policy (`next.config.mjs`) |
| **에러 추적** | Sentry (`@sentry/nextjs`), DSN 미설정 시 no-op. API는 raw `error.message`를 클라이언트에 노출하지 않음 |

---

## 🛠 Tech Stack

**Frontend / Edge** — Next.js 14 (App Router) · React 18 · TypeScript strict · Tailwind CSS · Pretendard · Vercel Edge · Vercel Analytics + Speed Insights
**Backend / Data** — Supabase PostgreSQL (RLS, pg_trgm 한글 부분일치) · Upstash Redis (레이트리밋) · 서버사이드 `admin_dashboard()` RPC
**AI** — OpenAI Chat Completions (GPT-5 family) · `response_format: json_object` + `reasoning_effort: low`
**ETL** — Python 3.12 · pandas · psycopg2 · KIPRIS Plus CSV(~2.5GB) → 매물 풀 추출 → Supabase COPY
**관측/보안** — Sentry · 보안 헤더 · zod 검증
**SEO** — 자동 `robots.txt` + `sitemap.xml` · JSON-LD WebSite + SearchAction · 동적 OG 이미지 · Google/Naver Search Console 등록

---

## 🏗 아키텍처 & 데이터 흐름

```
KIPRIS Plus CSVs (Data/, ~2.5GB)
  → Python ETL (extract → merge_status → merge_transfers → load_*
                → citation_span + prior_patent_count → load_imp_com → ntis_enrich)
  → Supabase Postgres (patents, companies, ipc_company, applications, listings, events)
  → scripts/precompute-patent-rank.ts  (patents.patent_rank + patent_rank_grade 적재)
  → Next.js (anon client = RLS read / service-role = server write)
  → Vercel (main push 시 자동 운영 배포)
```

- **Supabase 클라이언트 분리**: anon(읽기, RLS) / service-role(서버 쓰기). anon 키는 브라우저 노출용이라 쓰기 권한 없음.
- **PatentRank 이중 계산**: 런타임(`patentRank()`, ≤200행 풀 정렬)과 오프라인(`precompute-rank`, 전체 풀 → DB 컬럼). 스코어 로직 변경 시 `npm run precompute-rank` 재실행 필요.

---

## 📁 디렉토리 구조

```
patentpilot/
├── src/
│   ├── app/
│   │   ├── market/ patent/[appNo]/ chat/ apply/ list/ compare/ themes/ about/   # 공개 화면
│   │   ├── admin/                  # Basic Auth 대시보드 (applications/ listings/)
│   │   ├── api/                    # search·suggest·patents·chat·loi·list·events·stats·proposal/draft·admin
│   │   ├── opengraph-image.tsx · robots.ts · sitemap.ts · global-error.tsx
│   │   └── (각 주요 라우트) loading.tsx · error.tsx
│   ├── components/                 # 30+ UI 컴포넌트
│   ├── lib/                        # patent-rank · matching · patents · supabase · rate-limit · validation · data-version …
│   ├── middleware.ts               # /admin/* Basic Auth (상수 시간 비교)
│   └── instrumentation.ts          # Sentry 등록
├── sentry.{client,server,edge}.config.ts
├── supabase/migrations/            # 타임스탬프 SQL (스키마 · RLS · 등급 재계산 · enrichment 컬럼 · 쓰기잠금)
├── etl/patentpilot_etl/            # classify · urgency · extract · merge_* · load_* · citation_span · prior_patent_count · load_imp_com · ntis_enrich
├── e2e/smoke.spec.ts               # Playwright 스모크 (chromium + mobile-safari)
└── docs/superpowers/{specs,plans}/ # 설계 문서 · 구현 계획
```

---

## 🚀 로컬 개발

```bash
git clone https://github.com/wannahappyaroundme/patentpilot
cd patentpilot
npm install
cp .env.example .env.local          # 아래 키 채우기
npm run dev                          # http://localhost:3000
npm run build                        # 프로덕션 빌드
npm run test:e2e                     # Playwright 스모크
```

### Python ETL (선택 — 본인 KIPRIS 데이터 적재 시)
```bash
cd etl && python3.12 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
pytest                                        # 20 cases
python -m patentpilot_etl.extract            # CSV → 매물 풀
python -m patentpilot_etl.merge_status       # 연차료 상태 join
python -m patentpilot_etl.merge_transfers    # 권리이동 카운트
python -m patentpilot_etl.load_supabase      # Supabase COPY
python -m patentpilot_etl.load_companies     # 시드 + IPC 매핑
python -m patentpilot_etl.load_inventors     # 발명자 채우기
# PatentRank 보강 (precompute 전에 실행):
python -m patentpilot_etl.citation_span
python -m patentpilot_etl.prior_patent_count
python -m patentpilot_etl.load_imp_com
python -m patentpilot_etl.ntis_enrich        # NTIS_API_KEY 필요
```

### 환경변수 (`.env.example` 템플릿 참고)
```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # 읽기 전용 anon 키
SUPABASE_SERVICE_ROLE_KEY=         # 서버 전용 — 절대 브라우저 노출 금지
SUPABASE_DB_URL=                   # ETL 직접 연결
OPENAI_API_KEY=                    # (선택) AI 채팅
NTIS_API_KEY=                      # (선택) COM 축 R&D 매칭
ADMIN_USER= / ADMIN_PASSWORD=      # /admin Basic Auth
UPSTASH_REDIS_REST_URL= / UPSTASH_REDIS_REST_TOKEN=   # 레이트리밋 (미설정 시 인메모리 폴백)
NEXT_PUBLIC_SENTRY_DSN=            # (선택) 에러 추적
```
> ⚠️ **`.env.local`은 절대 커밋하지 마세요.** `.gitignore`에 포함돼 있으며, 공개 저장소에 단 한 번이라도 올라가면 키를 즉시 재발급해야 합니다.

---

## 🗺 로드맵

**제품 개발 단계**
- ✅ **Phase 0 (기획)** — 페르소나·시장·수익모델·UX·방향
- ✅ **Phase 1 (빌드)** — 8화면 + 관리자 + 배포 + 기본 인증
- ✅ **Production hardening** — 레이트리밋·입력검증·RLS 쓰기잠금·보안헤더·Sentry (2026-06)
- 🔜 **Phase 2 (최적화)** — 사용성 인터뷰(가격 검증), NTIS 실연동, 속도 개선
- 🔜 **Phase 3 (폴리싱)** — 법무 자문·배상책임보험, PatentRank 정교화(코호트 백분위·진짜 PageRank)

**장기 비전 — TreeO**
> PatentsView가 미국 특허에서 한 일을 한국 R&D 특허에서 한다 — 학계가 인용하는 **오픈 데이터 인프라**.
- Foundation(무료): TreeO Graph(그래프 DB) · TreeO Score(5축) · TreeO API · TreeO Ontology
- Product: K-R&D Patent Match(현재 MVP) · K-R&D Insight(TLO 대시보드) · K-R&D Trend(VC 레이더) · K-R&D Whitespace(R&D 기획)

---

## ⚖️ 정직하게 공개하는 한계

신뢰 전략으로 한계를 자발적으로 공개한다 (`/about/patent-rank`).
- **LOI 실거래 0건** — 아직 실제 거래 사례는 없음 (검증 단계).
- **PatentRank는 MVP 근사** — 코호트 백분위 정규화, 진짜 PageRank, 산업 CAGR/채용수요, DART 스핀오프 연동 등은 미구현이며 일부 지표는 외부 데이터 연동 전 근사치다.
- **가격 모델은 잠정 가설** — Phase 2 사용성 인터뷰로 검증 예정.

---

## 💰 비즈니스 모델

- **검색·열람은 무료**, 거래가 성사될 때만 **매칭 수수료**를 받는 성공보수형 단일 수익원으로 시작.
- 검증 후 TLO 대시보드·VC 리포트·감정평가 참고 리포트·API로 단계적 확장 (모두 잠정 가설, 사례 축적 후 결정).

> 상세 가격표·재무 추정은 내부 사업계획서에 있으며 공개 README에는 포함하지 않는다.

---

## 🏆 대회 · 팀 · 라이선스

- **2026 지식재산 데이터 활용 창업 경진대회** (KIPRIS Plus 주최) 출품작
- **팀 TreeO** — 기획·개발 통합
- **데이터 출처**: KIPRIS Plus 유료 API (대학·정출연 특허 370,666건 원천 → 활성 매물 104,582건 정제)
- **라이선스**: 본 레포 코드는 **MIT**. 데이터 자체는 **KIPRIS Plus 약관** 적용 (재배포 라이선스 별도).

---

<div align="center">

**[🌐 사이트 방문](https://patentpilot-livid.vercel.app)** · **[💬 AI 검색해보기](https://patentpilot-livid.vercel.app/chat)** · **[🛒 매물 둘러보기](https://patentpilot-livid.vercel.app/market)**

</div>
