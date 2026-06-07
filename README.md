<div align="center">

# PatentPilot

### 잠자는 한국 R&D 특허를 깨우는 AI 매칭 코파일럿

대학·정출연이 보유한 R&D 특허 104,582건 중 **곧 유지비를 포기할 매물**을 자동 발굴해 매수 기업과 매칭합니다.

**🌐 Live**: **[patentpilot-livid.vercel.app](https://patentpilot-livid.vercel.app)** &nbsp;·&nbsp; 🤖 AI 검색 → [/chat](https://patentpilot-livid.vercel.app/chat) &nbsp;·&nbsp; 🛒 매물 → [/market](https://patentpilot-livid.vercel.app/market)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/) [![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com/) [![Vercel](https://img.shields.io/badge/Vercel-Production-black?logo=vercel)](https://vercel.com/) [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5-412991?logo=openai)](https://platform.openai.com/)

</div>

---

## 🎯 한 줄 가치 제안

> **"한국 대학·정출연이 가진 잠자는 특허 104,582건 중, 유지비 부담으로 매도 동기가 가장 강한 매물을 발굴해 매수 기업과 거래 매칭하는 AI 코파일럿"**

- 📌 매도측: 산학협력단(TLO) · 정출연 기술이전팀 — 보유 매물 등록 → 매수 후보 자동 발굴
- 📌 매수측: 기업 R&D 팀장 — 자연어로 검색 → 매물 + 기업 매칭 점수 확인 → LOI(거래의향서) 신청
- 💰 BM: **거래 성사 시에만 매칭 수수료** (5~10%)

---

## ✨ 핵심 기능

| 기능 | 라우트 | 설명 |
|---|---|---|
| **랜딩** | `/` | 라이브 카운터 · 빠른 메뉴 · 배너 슬라이더 · 매물 테마 · 실시간 거래 신청 미리보기 |
| **매물 검색** | `/market` | 104,582건 풀에서 IPC/기관/긴급도/잔여년/공동출원 필터 + 5종 정렬 + 자동완성 + PDF 출력 |
| **매물 상세** | `/patent/[appNo]` | 메타·청구항·인용·패밀리·발명자 + KIPRIS 원문 + **매수 후보 기업 Top 5** + 관련 매물 추천 |
| **AI 코파일럿** | `/chat` | **GPT-5.4-nano + 메모리 8턴** · 자연어 → IPC/기관/긴급도 자동 추출 + 0건 시 자동 완화 검색 + 룰베이스 폴백 |
| **매물 비교** | `/compare` | 최대 20건 가로 비교표 · **드래그앤드롭 순서 변경** · PDF 인쇄 |
| **거래 신청 (매수)** | `/apply` | LOI 폼 · 클라이언트 유효성 검사 · 금액 자동 1,000 콤마 |
| **매물 등록 (매도)** | `/list` | TLO/정출연용 등록 폼 · 어드민 검토 후 매칭 시작 |
| **Admin** | `/admin` | DAU/WAU/MAU · 14일 PV/UV 차트 · 유입 경로 · 디바이스/브라우저 · 검색어/클릭 Top · 거래신청/매물등록 관리(상태·삭제) |

## 📊 데이터

- **매물 풀**: 104,582건 (KIPRIS Plus 유료 API 기반)
  - 대학 산학협력단 약 69,518건 + 정부출연연구기관(GRI) 약 34,925건 (비율 추정)
  - 긴급(🔴 15~20년차) ~16,253 · 임박(🟡 8~14년) ~38,159 · 일반(🟢 4~7년) ~50,170 (추정)
- **매수 후보 기업 시드**: 83개사 (삼성전자·LG·SK·현대·포스코·셀트리온·KT·NAVER 등)
- **IPC ↔ 기업 매핑**: 199건 (가중치 기반 매칭)
- **발명자 정보**: 100% (104,582건 모두 발명자명 포함)
- **모든 매물에서 KIPRIS 원문 직접 연결** (doi.org/10.8080/...)

## 🧠 매칭 알고리즘

매수 후보 점수 = `IPC 적합도 60% + 기업 R&D 규모 20% + 협력 이력 20%`

- IPC: 매물의 주 IPC prefix → 사전 큐레이션된 기업×IPC 가중치 매트릭스
- 매출 규모: 대기업/중견 분류 (DART 기준)
- 협력 이력: 공동출원자(`patApplicant`)에 매수 후보 기업명 또는 alias 포함 시 가산
- 모든 결과에 매칭 점수와 사유("이전 이벤트 12회 — 권리 이동 활발" 등) 노출

## 🤖 AI 코파일럿

`/chat` 페이지에서 자연어로 매물 검색:

```
ETRI 긴급 매물 보여줘 → 🔴 + 정출연 + ETRI 1,201건
디스플레이는?         → ↑ ETRI 컨텍스트 유지 + IPC G09G 교체
배터리 KAIST 곧 만료될 → 🔴 + 대학 + KAIST + 배터리(H01M,B60L)
```

- **모델 폴백 체인**: `OPENAI_CHAT_MODEL` → `gpt-5.4-nano` → `gpt-5.4-mini` → `gpt-5.5` → `gpt-4.1-mini`
- **메모리**: 직전 8턴 대화를 LLM에 함께 전달 → 후속 질문 컨텍스트 이해
- **자동 완화 검색**: 결과 0건이면 기관 → IPC → 기관유형 순으로 풀어서 재시도
- **룰베이스 폴백**: OpenAI 키 없거나 API 장애 시 자동 전환
- **대화 기록 영구 저장**: 브라우저 localStorage에 자동 저장, 다음 방문 시 복원

## 🛠 Tech Stack

**Frontend / Edge**
- [Next.js 14](https://nextjs.org/) (App Router) · React 18 · TypeScript strict
- [Tailwind CSS](https://tailwindcss.com/) · Pretendard 폰트
- [Vercel](https://vercel.com/) Edge Network · Hobby plan
- [Vercel Analytics](https://vercel.com/docs/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights)

**Backend / Data**
- [Supabase](https://supabase.com/) PostgreSQL (Free tier, Seoul 리전)
- Row-level Security · pg_trgm 한글 부분일치 검색
- Server-side `admin_dashboard()` RPC (DAU/MAU 등 종합 KPI)

**AI**
- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) (GPT-5 family)
- `response_format: json_object` + `reasoning_effort: low`

**ETL**
- Python 3.12 · pandas · psycopg2
- KIPRIS Plus CSV(728MB + 1.8GB) → 매물 풀 추출 → Supabase COPY

**SEO**
- 자동 `robots.txt` + `sitemap.xml`
- JSON-LD WebSite + SearchAction
- OG image 동적 생성 (`opengraph-image.tsx`)
- Google Search Console + Naver Search Advisor 등록

## 📁 디렉토리

```
patentpilot/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── market/         # 매물 검색·필터
│   │   │   ├── patent/[appNo]/ # 매물 상세
│   │   │   ├── chat/           # AI 코파일럿
│   │   │   ├── apply/          # 거래 신청(LOI)
│   │   │   ├── list/           # 매물 등록(매도)
│   │   │   ├── compare/        # 매물 비교 (DnD)
│   │   │   ├── themes/         # 기술분야별
│   │   │   └── about/
│   │   ├── admin/              # Basic Auth 보호
│   │   │   ├── page.tsx        # 대시보드 v2
│   │   │   ├── applications/   # LOI 관리
│   │   │   └── listings/       # 매물 등록 관리
│   │   ├── api/
│   │   │   ├── search/         # GET 매물 검색
│   │   │   ├── suggest/        # 자동완성
│   │   │   ├── patents/        # GET 다건
│   │   │   ├── chat/           # POST AI 의도 추출
│   │   │   ├── loi/            # POST 거래 신청
│   │   │   ├── list/           # POST 매물 등록
│   │   │   ├── events/         # POST 이벤트 트래킹
│   │   │   ├── stats/          # GET 통계
│   │   │   └── admin/          # DELETE/PATCH (인증)
│   │   ├── icon.svg            # favicon
│   │   ├── opengraph-image.tsx # 동적 OG 카드
│   │   ├── robots.ts           # auto robots.txt
│   │   ├── sitemap.ts          # auto sitemap.xml
│   │   └── layout.tsx
│   ├── components/             # 30+ UI 컴포넌트
│   ├── lib/                    # types · supabase · 매칭 · 분석 · 폼 유틸
│   └── middleware.ts           # /admin/* Basic Auth
├── supabase/migrations/        # SQL 마이그레이션 (patents/companies/applications/listings/events + RPC)
├── etl/                        # Python 데이터 파이프라인
│   ├── patentpilot_etl/
│   │   ├── classify.py         # UNIV/GRI 분류
│   │   ├── urgency.py          # 긴급도 + 잔여년
│   │   ├── extract.py          # 매물 풀 추출
│   │   ├── merge_status.py     # 연차료 상태 join
│   │   ├── merge_transfers.py  # 권리이동 카운트
│   │   ├── load_supabase.py    # COPY 적재
│   │   ├── load_companies.py   # 시드 + IPC 매핑
│   │   ├── load_inventors.py   # 발명자 채우기
│   │   └── config.py
│   ├── data/                   # 시드 CSV (companies, ipc_company)
│   └── tests/                  # pytest 16 cases
└── docs/superpowers/
    ├── specs/                  # 설계 문서
    └── plans/                  # 구현 계획
```

## 🚀 로컬 개발

### 1) Next.js 프론트엔드

```bash
git clone https://github.com/wannahappyaroundme/patentpilot
cd patentpilot
npm install
cp .env.example .env.local       # Supabase 키 채우기
npm run dev                       # http://localhost:3000
```

### 2) Python ETL (선택 — 본인 KIPRIS 데이터 적재 시)

```bash
cd etl
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest                                       # 16 cases
python -m patentpilot_etl.extract           # CSV → 매물 풀
python -m patentpilot_etl.merge_status      # legalStatus join
python -m patentpilot_etl.merge_transfers   # transfers join
python -m patentpilot_etl.load_supabase     # Supabase COPY
python -m patentpilot_etl.load_companies    # 시드 적재
python -m patentpilot_etl.load_inventors    # 발명자 채우기
```

### 3) 환경변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
SUPABASE_DB_URL=postgresql://...           # ETL 전용
ADMIN_USER=patentpilot
ADMIN_PASSWORD=...
OPENAI_API_KEY=sk-...                       # (선택) AI 채팅용
OPENAI_CHAT_MODEL=gpt-5.4-nano              # (선택) 기본값 override
```

## 🔑 키워드

`PatentPilot` · `특허 매매` · `특허 거래` · `R&D 특허` · `기술이전` · `한국 특허` · `대학 특허` · `정출연 특허` · `TLO` · `산학협력단` · `KIPRIS` · `지식재산` · `IP` · `유지비` · `연차료` · `특허 매칭 AI` · `공공기술 사업화` · `ETRI` · `KAIST` · `KIST` · `한국전자통신연구원` · `Korean patent marketplace` · `tech transfer Korea`

## 🏆 대회

**2026 지식재산 데이터 활용 창업 경진대회** (KIPRIS Plus 주최)
- 마감: 2026년 6월 11일
- 본 프로젝트 출품작

## 👥 팀 TreeO

- 기획·개발 통합 작업
- 데이터 출처: KIPRIS Plus 유료 API (대학·정출연 특허 370,666건)
- 라이선스: 본 레포 코드는 MIT (데이터 자체는 KIPRIS Plus 약관 적용)

---

<div align="center">

**[🌐 사이트 방문](https://patentpilot-livid.vercel.app)** &nbsp;·&nbsp; **[💬 AI 검색해보기](https://patentpilot-livid.vercel.app/chat)** &nbsp;·&nbsp; **[🛒 매물 둘러보기](https://patentpilot-livid.vercel.app/market)**

</div>
