# PatentPilot W1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PatentPilot W1 (5/16~5/22) — 데이터 파이프라인 구축 + Supabase 스키마 + 랜딩 페이지 배포까지 끝내 `patentpilot.vercel.app`에서 라이브 매물 카운터가 작동하는 상태를 만든다.

**Architecture:** Python ETL이 로컬 CSV 4개(patents 728MB + legalStatus 1.8GB + transfers 156MB + 시드)를 정제·조인해 Supabase Postgres에 약 10만 행을 적재한다. Next.js 14 App Router 프론트엔드가 Supabase 클라이언트로 카운터·검색을 호출한다. GitHub Actions가 main 브랜치 push마다 Vercel에 자동 배포한다.

**Tech Stack:** Python 3.11 (pandas, psycopg2-binary, python-dotenv) · Next.js 14 (App Router, TypeScript strict) · Tailwind CSS · shadcn/ui · Supabase Postgres 15 · pg_trgm · Vercel Hobby · GitHub Actions

**Spec:** `docs/superpowers/specs/2026-05-16-patentpilot-design.md`

---

## File Structure

```
patentpilot/                              # 새 GitHub repo 루트
├── .env.example                          # 환경변수 템플릿 (실제 값 X)
├── .env.local                            # 로컬 비밀 (gitignore)
├── .gitignore
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json                       # shadcn/ui 설정
├── README.md
├── .github/
│   └── workflows/
│       └── ci.yml                        # typecheck + build 검증
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # 루트 레이아웃 (헤더·푸터)
│   │   ├── page.tsx                      # 랜딩 페이지
│   │   ├── globals.css
│   │   └── api/
│   │       └── stats/route.ts            # GET /api/stats — 매물 카운터
│   ├── components/
│   │   ├── ui/                           # shadcn 자동 생성
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx                      # 랜딩 Hero 섹션
│   │   ├── live-counter.tsx              # 라이브 매물 카운터
│   │   ├── value-props.tsx               # 가치 제안 3블록
│   │   └── stats-panel.tsx               # 매물 통계 시각화
│   └── lib/
│       ├── supabase.ts                   # Supabase 클라이언트
│       ├── types.ts                      # DB 타입 정의
│       └── format.ts                     # 숫자·날짜 포맷터
├── public/
│   └── og-image.png                      # SEO OG 이미지
├── supabase/
│   └── migrations/
│       └── 20260516000001_initial_schema.sql
└── etl/                                  # Python ETL (별도 venv)
    ├── pyproject.toml
    ├── requirements.txt
    ├── .python-version
    ├── README.md
    ├── tests/
    │   ├── __init__.py
    │   ├── test_classify.py
    │   ├── test_urgency.py
    │   └── test_extract.py
    └── patentpilot_etl/
        ├── __init__.py
        ├── config.py                     # 경로·환경변수
        ├── classify.py                   # 정출연/대학 분류 함수
        ├── urgency.py                    # 긴급도 태그 함수
        ├── extract.py                    # 01_extract_patents_pool
        ├── merge_status.py               # 02_merge_legal_status
        ├── merge_transfers.py            # 03_merge_transfers
        ├── load_supabase.py              # 04_load_to_supabase
        └── load_companies.py             # 05_build_company_seed
```

**중요 분리 원칙:**
- ETL은 Next.js와 완전 분리된 Python 트리. 둘 다 같은 repo에 있되 빌드/실행이 독립.
- 정출연/대학 분류와 긴급도 태그는 순수 함수 모듈로 분리 → 단위 테스트 가능.
- Supabase 클라이언트는 `src/lib/supabase.ts` 한 곳에서만 생성.

---

## Phase 0: 환경 셋업 (Day 1, 5/16)

### Task 1: GitHub repo 생성 + 로컬 디렉토리 초기화

**Files:**
- Create: `/Users/kyungsbook/Desktop/Tree0/patentpilot/` (전체 신규)
- Create: `/Users/kyungsbook/Desktop/Tree0/patentpilot/.gitignore`
- Create: `/Users/kyungsbook/Desktop/Tree0/patentpilot/README.md`

- [ ] **Step 1: GitHub에서 빈 repo 생성 (사용자가 수동)**

브라우저에서 https://github.com/new
- Owner: `wannahappyaroundme`
- Repository name: `patentpilot`
- Description: `잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿 / 2026 지식재산 데이터 활용 창업 경진대회`
- Public
- "Add a README" / ".gitignore" / "license" 모두 **체크 해제** (로컬에서 만들 것)
- Create repository 클릭 → repo URL 복사 (예: `https://github.com/wannahappyaroundme/patentpilot.git`)

- [ ] **Step 2: 로컬 디렉토리 생성**

Run:
```bash
mkdir -p /Users/kyungsbook/Desktop/Tree0/patentpilot
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git init -b main
```
Expected: `Initialized empty Git repository in .../patentpilot/.git/`

- [ ] **Step 3: .gitignore 작성**

Create `/Users/kyungsbook/Desktop/Tree0/patentpilot/.gitignore`:
```
# Node
node_modules/
.next/
out/
.vercel
*.tsbuildinfo
next-env.d.ts

# Python
etl/.venv/
etl/__pycache__/
etl/**/__pycache__/
etl/.pytest_cache/
*.pyc

# Env
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# ETL build artifacts
etl/build/
etl/data/
*.csv
*.parquet

# IDE
.vscode/
.idea/
```

- [ ] **Step 4: README.md 작성**

Create `/Users/kyungsbook/Desktop/Tree0/patentpilot/README.md`:
````markdown
# PatentPilot

> 잠자는 한국 R&D 특허 7.8만건을 깨우는 매칭 코파일럿
>
> 2026 지식재산 데이터 활용 창업 경진대회 출품작

## 한 줄 소개

한국 대학·정출연이 보유한 R&D 특허 중 곧 유지비를 포기할 매물을 발굴해 기업과 매칭한다.

## Tech Stack

- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL)
- Vercel + GitHub Actions
- Python ETL (pandas, psycopg2)

## 디렉토리

- `src/` — Next.js 프론트엔드
- `etl/` — Python 데이터 파이프라인
- `supabase/migrations/` — DB 스키마
- `docs/superpowers/specs/` — 설계 문서
- `docs/superpowers/plans/` — 구현 계획

## 로컬 개발

(W1 완료 후 작성)
````

- [ ] **Step 5: 첫 commit + remote 연결 + push**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add .gitignore README.md
git commit -m "chore: init repo"
git remote add origin https://github.com/wannahappyaroundme/patentpilot.git
git push -u origin main
```
Expected: GitHub repo에 .gitignore와 README.md 보이면 성공.

- [ ] **Step 6: spec/plan 문서 옮기기**

Run:
```bash
mkdir -p /Users/kyungsbook/Desktop/Tree0/patentpilot/docs/superpowers/specs
mkdir -p /Users/kyungsbook/Desktop/Tree0/patentpilot/docs/superpowers/plans
cp /Users/kyungsbook/Desktop/Tree0/docs/superpowers/specs/2026-05-16-patentpilot-design.md /Users/kyungsbook/Desktop/Tree0/patentpilot/docs/superpowers/specs/
cp /Users/kyungsbook/Desktop/Tree0/docs/superpowers/plans/2026-05-16-patentpilot-w1-foundation.md /Users/kyungsbook/Desktop/Tree0/patentpilot/docs/superpowers/plans/
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add docs/
git commit -m "docs: add spec and W1 plan"
git push
```

---

### Task 2: Next.js 14 scaffold + TypeScript + Tailwind + shadcn/ui

**Files:**
- Create: `patentpilot/package.json`, `patentpilot/tsconfig.json`, `patentpilot/next.config.mjs`, `patentpilot/tailwind.config.ts`, `patentpilot/postcss.config.mjs`, `patentpilot/components.json`
- Create: `patentpilot/src/app/layout.tsx`, `patentpilot/src/app/page.tsx`, `patentpilot/src/app/globals.css`

- [ ] **Step 1: create-next-app 실행**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --use-npm
```
프롬프트가 뜨면 모두 yes (또는 Enter로 기본 선택). 이미 .gitignore/README 존재 → "files already exist, overwrite?" 나오면 **No** 선택 (또는 `-y` 옵션으로 자동).

만약 위 명령이 디렉토리 비어있지 않다고 거부하면:
```bash
npx create-next-app@14 patentpilot-tmp --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --use-npm
cp -r patentpilot-tmp/* patentpilot-tmp/.* /Users/kyungsbook/Desktop/Tree0/patentpilot/ 2>/dev/null
rm -rf patentpilot-tmp
```

Expected: `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `src/app/page.tsx`, `src/app/layout.tsx` 생성됨.

- [ ] **Step 2: tsconfig.json을 strict 모드로 강화**

Edit `patentpilot/tsconfig.json` — `compilerOptions` 안에 다음 키들이 있는지 확인하고 없으면 추가:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

- [ ] **Step 3: 타입체크 통과 확인**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
npx tsc --noEmit
```
Expected: 에러 없이 종료. 만약 에러 나면 기본 스캐폴드 파일에 strict 모드 위반이 있는 것 — 그 파일을 수정.

- [ ] **Step 4: shadcn/ui 초기화**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
npx shadcn@latest init -y --base-color slate --css-variables
```
Expected: `components.json`, `src/lib/utils.ts`, `src/app/globals.css` 업데이트.

- [ ] **Step 5: 자주 쓸 shadcn 컴포넌트 5개 추가**

Run:
```bash
npx shadcn@latest add button card input badge separator -y
```
Expected: `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `separator.tsx` 생성.

- [ ] **Step 6: 개발 서버 작동 확인**

Run:
```bash
npm run dev
```
브라우저에서 http://localhost:3000 접속. 기본 Next.js 시작 화면이 보이면 성공. Ctrl+C로 종료.

- [ ] **Step 7: 빌드 통과 확인**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully` + `Route` 표가 표시되면 통과.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js 14 with TypeScript strict + Tailwind + shadcn/ui"
git push
```

---

### Task 3: 환경변수 + Supabase 프로젝트 생성

**Files:**
- Create: `patentpilot/.env.example`
- Create: `patentpilot/.env.local` (gitignore에 의해 push 안 됨)
- Create: `patentpilot/src/lib/supabase.ts`

- [ ] **Step 1: Supabase에서 프로젝트 생성 (사용자 수동)**

브라우저에서 https://supabase.com 로그인 → "New project" 클릭
- Organization: 기본
- Name: `patentpilot`
- Database Password: 강한 비밀번호 생성 + 1Password/메모장에 저장
- Region: `Northeast Asia (Seoul)` (가장 가까움)
- Pricing Plan: `Free`
- Create new project 클릭 → 2~3분 대기

프로젝트 생성 후 Settings → API에서 다음 3개 값 복사:
- `Project URL` (예: `https://xxxx.supabase.co`)
- `anon public` API key
- `service_role` API key (절대 클라이언트 노출 금지)

- [ ] **Step 2: .env.example 작성**

Create `patentpilot/.env.example`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase service role (server only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase direct DB connection (for Python ETL)
SUPABASE_DB_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# OpenAI (W3 stretch)
OPENAI_API_KEY=
```

- [ ] **Step 3: .env.local 작성 (실제 값)**

Create `patentpilot/.env.local`:
- Step 1에서 복사한 실제 값 채워넣기.
- `SUPABASE_DB_URL`은 Supabase Settings → Database → Connection string → URI에서 복사 (`?pgbouncer=true&connection_limit=1`까지 포함).

- [ ] **Step 4: Supabase 클라이언트 모듈 작성**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
npm install @supabase/supabase-js
```

Create `patentpilot/src/lib/supabase.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url!, serviceKey, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 5: 타입체크 + 빌드 통과**

Run:
```bash
npx tsc --noEmit && npm run build
```
Expected: 통과.

- [ ] **Step 6: Commit**

```bash
git add .env.example src/lib/supabase.ts package.json package-lock.json
git commit -m "feat: add Supabase client and env scaffold"
git push
```

---

### Task 4: Vercel 연결 + GitHub Actions CI

**Files:**
- Create: `patentpilot/.github/workflows/ci.yml`

- [ ] **Step 1: Vercel에서 프로젝트 임포트 (사용자 수동)**

https://vercel.com 로그인 → "Add New" → "Project" → GitHub에서 `wannahappyaroundme/patentpilot` 임포트
- Framework Preset: Next.js (자동 인식)
- Root Directory: `./` 기본
- Build/Output: 기본
- Environment Variables: `.env.local`에 있는 4개 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`) 추가
- Deploy 클릭

배포 완료 후 URL 확인 (예: `patentpilot.vercel.app` 또는 `patentpilot-xxx.vercel.app`). Settings → Domains에서 `patentpilot.vercel.app`로 변경(가능하면).

- [ ] **Step 2: GitHub Actions CI 워크플로 작성**

Create `patentpilot/.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Next.js build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key
        run: npm run build
```

- [ ] **Step 3: Commit + push로 CI 첫 실행 검증**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add typecheck and build workflow"
git push
```

브라우저에서 GitHub repo → Actions 탭 확인. 워크플로 실행이 녹색이면 성공.

Vercel 대시보드에서도 자동 배포 트리거 확인 → 배포된 URL 접속 가능한지 확인.

---

## Phase 1: 데이터 파이프라인 ETL (Day 2~3, 5/17~5/18)

### Task 5: Python ETL 환경 + 의존성

**Files:**
- Create: `patentpilot/etl/requirements.txt`
- Create: `patentpilot/etl/.python-version`
- Create: `patentpilot/etl/pyproject.toml`
- Create: `patentpilot/etl/patentpilot_etl/__init__.py`
- Create: `patentpilot/etl/patentpilot_etl/config.py`
- Create: `patentpilot/etl/tests/__init__.py`

- [ ] **Step 1: venv + 의존성 설치**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
mkdir -p etl/patentpilot_etl etl/tests
cd etl
python3.11 -m venv .venv
source .venv/bin/activate
python -V
```
Expected: `Python 3.11.x`. (3.11 없으면 3.10/3.12도 가능 — 단 결과 일관성 위해 `.python-version`에 명시.)

- [ ] **Step 2: requirements.txt 작성**

Create `patentpilot/etl/requirements.txt`:
```
pandas>=2.2
psycopg2-binary>=2.9
python-dotenv>=1.0
tqdm>=4.66
pytest>=8.0
```

- [ ] **Step 3: 의존성 설치 + 버전 잠금**

Run:
```bash
pip install -r requirements.txt
pip freeze > requirements.lock.txt
```

- [ ] **Step 4: .python-version 작성**

Create `patentpilot/etl/.python-version`:
```
3.11
```

- [ ] **Step 5: pyproject.toml + config.py 작성**

Create `patentpilot/etl/pyproject.toml`:
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
```

Create `patentpilot/etl/patentpilot_etl/__init__.py`:
```python
"""PatentPilot ETL pipeline."""
```

Create `patentpilot/etl/patentpilot_etl/config.py`:
```python
"""ETL configuration and paths."""
from pathlib import Path
from dotenv import load_dotenv
import os

ETL_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ETL_DIR.parent

# 입력: 사용자가 가지고 있는 KIPRIS CSV 데이터 폴더
SOURCE_DATA_DIR = Path("/Users/kyungsbook/Desktop/Tree0/Data")

# 출력: ETL 중간/최종 산출물
BUILD_DIR = ETL_DIR / "build"
BUILD_DIR.mkdir(exist_ok=True)

# .env.local에서 Supabase 연결 정보 로드
load_dotenv(REPO_ROOT / ".env.local")
SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL", "")

# 매물 풀 정의 — spec 4.1 참조
URGENCY_RED_YEARS = (2006, 2011)      # 출원 15~20년차
URGENCY_YELLOW_YEARS = (2012, 2017)   # 출원 8~14년차
URGENCY_GREEN_YEARS = (2018, 2022)    # 출원 4~7년차
CURRENT_YEAR = 2026
```

Create `patentpilot/etl/tests/__init__.py` (빈 파일).

- [ ] **Step 6: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/
git commit -m "feat(etl): add Python environment and config"
git push
```

---

### Task 6: 정출연/대학 분류 함수 + TDD

**Files:**
- Create: `patentpilot/etl/patentpilot_etl/classify.py`
- Create: `patentpilot/etl/tests/test_classify.py`

- [ ] **Step 1: 실패 테스트 작성**

Create `patentpilot/etl/tests/test_classify.py`:
```python
from patentpilot_etl.classify import classify_org

def test_classify_etri_as_gri():
    assert classify_org("한국전자통신연구원", "한국전자통신연구원") == "GRI"

def test_classify_kaist_as_gri():
    # KAIST는 과학기술원 → GRI 카테고리
    assert classify_org("한국과학기술원", "한국과학기술원") == "GRI"

def test_classify_yonsei_as_univ():
    assert classify_org("연세대학교 산학협력단", "연세대학교") == "UNIV"

def test_classify_seoul_national_university_as_univ():
    assert classify_org("서울대학교산학협력단", "서울대학교") == "UNIV"

def test_classify_unknown_as_other():
    assert classify_org("삼성전자 주식회사", "") == "OTHER"

def test_classify_empty_inputs():
    assert classify_org("", "") == "OTHER"

def test_classify_gri_keyword_priority():
    # 대학 키워드와 정출연 키워드 동시 출현 시 정출연 우선
    # (예: "한국과학기술원" — 학교법인이지만 GRI 분류)
    assert classify_org("재단법인대구경북과학기술원", "재단법인대구경북과학기술원") == "GRI"
```

- [ ] **Step 2: 테스트 실패 확인**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot/etl
source .venv/bin/activate
pytest tests/test_classify.py -v
```
Expected: `ModuleNotFoundError: No module named 'patentpilot_etl.classify'` (또는 ImportError).

- [ ] **Step 3: classify.py 구현**

Create `patentpilot/etl/patentpilot_etl/classify.py`:
```python
"""대학(UNIV)/정출연(GRI)/기타(OTHER) 분류 룰."""

GRI_KEYWORDS = (
    "연구원", "연구소", "연구재단", "연구개발원", "과학기술원", "기술원",
    "진흥원", "연구회", "연구센터",
    "KIST", "KAIST", "POSTECH", "GIST", "UNIST", "DGIST",
    "ETRI", "KRIBB", "KARI", "KASI", "KAERI", "KIER",
    "KIMM", "KIGAM", "KIOM", "KISTI", "KIRAMS", "KISTEP",
    "KFRI", "KIOST", "KOPRI", "KICT", "KITECH", "KRRI", "NFRI",
    "한국과학기술연구원", "한국과학기술원", "한국과학기술정보연구원",
    "한국전자통신연구원", "한국에너지기술연구원", "한국기계연구원",
    "한국지질자원연구원", "한국한의학연구원", "한국항공우주연구원",
    "한국원자력연구원", "한국화학연구원", "한국식품연구원",
    "한국생명공학연구원", "한국천문연구원", "한국건설기술연구원",
    "한국철도기술연구원", "국립암센터", "한국전기연구원",
    "한국표준과학연구원", "한국재료연구원", "한국해양과학기술원",
    "한국극지연구소", "국방과학연구소",
    "농촌진흥청", "국립농업과학원", "국립수산과학원",
    "국립산림과학원", "국립식량과학원",
)

UNIV_KEYWORDS = (
    "대학교", "학교법인", "산학협력단", "대학산학", "산학",
    "university", "UNIV", "학원", "학교",
)


def classify_org(applicant: str, university_name: str) -> str:
    """출원인/기관명 텍스트로부터 UNIV/GRI/OTHER 분류.

    GRI 키워드가 하나라도 매치되면 GRI(정출연/특수연구기관),
    그 다음 UNIV 키워드 매치 시 UNIV(대학),
    아니면 OTHER.
    """
    text = (applicant or "") + " " + (university_name or "")
    for kw in GRI_KEYWORDS:
        if kw in text:
            return "GRI"
    for kw in UNIV_KEYWORDS:
        if kw in text:
            return "UNIV"
    return "OTHER"
```

- [ ] **Step 4: 테스트 통과 확인**

Run:
```bash
pytest tests/test_classify.py -v
```
Expected: 모든 테스트 PASS (7 passed).

- [ ] **Step 5: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/patentpilot_etl/classify.py etl/tests/test_classify.py
git commit -m "feat(etl): add UNIV/GRI/OTHER classifier with tests"
git push
```

---

### Task 7: 긴급도 태그 함수 + TDD

**Files:**
- Create: `patentpilot/etl/patentpilot_etl/urgency.py`
- Create: `patentpilot/etl/tests/test_urgency.py`

- [ ] **Step 1: 실패 테스트 작성**

Create `patentpilot/etl/tests/test_urgency.py`:
```python
from patentpilot_etl.urgency import urgency_tag, remaining_years

def test_urgency_red_for_2008_application():
    # 2008 출원 → 2026 기준 18년차 → RED (06~11)
    assert urgency_tag("2008-03-14") == "RED"

def test_urgency_yellow_for_2014_application():
    # 2014 출원 → 12년차 → YELLOW (12~17)
    assert urgency_tag("2014-06-01") == "YELLOW"

def test_urgency_green_for_2020_application():
    # 2020 출원 → 6년차 → GREEN (18~22)
    assert urgency_tag("2020-01-01") == "GREEN"

def test_urgency_none_for_2005_application():
    # 2005 출원 → 21년차 → 풀에서 제외 → None
    assert urgency_tag("2005-12-31") is None

def test_urgency_none_for_2024_application():
    # 너무 신규 → 풀 제외
    assert urgency_tag("2024-08-15") is None

def test_urgency_none_for_invalid_date():
    assert urgency_tag("") is None
    assert urgency_tag("not-a-date") is None
    assert urgency_tag(None) is None

def test_remaining_years_basic():
    # 2026-05-16 기준 만료일 2030-01-01 → 약 3.6년
    years = remaining_years("2030-01-01")
    assert 3 <= years <= 4

def test_remaining_years_already_expired():
    assert remaining_years("2020-01-01") == 0

def test_remaining_years_missing():
    assert remaining_years("") is None
    assert remaining_years(None) is None
```

- [ ] **Step 2: 테스트 실패 확인**

Run:
```bash
pytest tests/test_urgency.py -v
```
Expected: ImportError.

- [ ] **Step 3: urgency.py 구현**

Create `patentpilot/etl/patentpilot_etl/urgency.py`:
```python
"""매물 긴급도 태그 + 권리잔여년 계산."""
from datetime import date
from .config import (
    URGENCY_RED_YEARS,
    URGENCY_YELLOW_YEARS,
    URGENCY_GREEN_YEARS,
    CURRENT_YEAR,
)


def _parse_year(s):
    if not s or not isinstance(s, str):
        return None
    s = s.strip().strip('=').strip('"')
    if len(s) < 4 or not s[:4].isdigit():
        return None
    return int(s[:4])


def urgency_tag(application_date: str | None) -> str | None:
    """출원일 문자열(YYYY-MM-DD)로부터 RED/YELLOW/GREEN/None."""
    year = _parse_year(application_date)
    if year is None:
        return None
    if URGENCY_RED_YEARS[0] <= year <= URGENCY_RED_YEARS[1]:
        return "RED"
    if URGENCY_YELLOW_YEARS[0] <= year <= URGENCY_YELLOW_YEARS[1]:
        return "YELLOW"
    if URGENCY_GREEN_YEARS[0] <= year <= URGENCY_GREEN_YEARS[1]:
        return "GREEN"
    return None


def remaining_years(expiration_date: str | None) -> int | None:
    """만료일로부터 2026-05-16 기준 잔여년(정수). 이미 만료면 0, 누락이면 None."""
    year = _parse_year(expiration_date)
    if year is None:
        return None
    today = date(CURRENT_YEAR, 5, 16)
    diff = year - today.year
    return max(0, diff)
```

- [ ] **Step 4: 테스트 통과 확인**

Run:
```bash
pytest tests/test_urgency.py -v
```
Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/patentpilot_etl/urgency.py etl/tests/test_urgency.py
git commit -m "feat(etl): add urgency tagger and remaining_years"
git push
```

---

### Task 8: ETL 1 — 매물 풀 추출 (patents.csv → patents_pool.csv)

**Files:**
- Create: `patentpilot/etl/patentpilot_etl/extract.py`
- Create: `patentpilot/etl/tests/test_extract.py`

- [ ] **Step 1: 실패 테스트 작성**

Create `patentpilot/etl/tests/test_extract.py`:
```python
import io
import pandas as pd
from patentpilot_etl.extract import extract_pool

SAMPLE_CSV = """patApplicationNumber,patTitle,patApplicant,patUniversityName,patApplicationDate,patRegistrationDate,patExpirationDate,patIpcNumber,patClaimsCount,patFamilyCount,patCitationCount,patTransferCount,patLegalStatus,patFinalDisposal,patRndDepartment,patKiprisLink
="10-2008-0001"," 발열저감 배터리","연세대학교 산학협력단",연세대학교,="2008-01-15",="2010-03-20",,B60L,12,3,8,0,연차료납부,등록결정(일반),산업통상자원부,http://kpat.kipris.or.kr/?app=10-2008-0001
="10-2014-0002","반도체 공정","한국전자통신연구원",한국전자통신연구원,="2014-04-10",="2016-08-22",,H01L,10,2,5,0,연차료납부,등록결정(일반),,http://kpat.kipris.or.kr/?app=10-2014-0002
="10-2024-0003","최신 출원","삼성전자",,="2024-09-01",,,H04L,8,1,0,0,출원공개,,,http://kpat.kipris.or.kr/?app=10-2024-0003
="10-2010-0004","거절된 출원","고려대학교 산학협력단",고려대학교,="2010-05-12",,,A61K,5,0,0,0,특허거절결정,거절결정(일반),,http://kpat.kipris.or.kr/?app=10-2010-0004
="10-2009-0005","연차료 미납","한국화학연구원",한국화학연구원,="2009-11-30",="2011-07-15",,C07C,15,4,12,1,연차료미납,등록결정(일반),,http://kpat.kipris.or.kr/?app=10-2009-0005
"""

def test_extract_pool_filters_disposal():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    # 거절결정과 연차료미납은 제외, 출원 2024는 GREEN 구간 밖 + 미등록 → 제외
    nums = set(df["application_number"].tolist())
    assert "10-2008-0001" in nums
    assert "10-2014-0002" in nums
    assert "10-2024-0003" not in nums   # 너무 신규 + 미등록
    assert "10-2010-0004" not in nums   # 거절결정
    assert "10-2009-0005" not in nums   # 연차료미납


def test_extract_pool_adds_org_type():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    rec = df[df["application_number"] == "10-2008-0001"].iloc[0]
    assert rec["org_type"] == "UNIV"
    rec = df[df["application_number"] == "10-2014-0002"].iloc[0]
    assert rec["org_type"] == "GRI"


def test_extract_pool_adds_urgency():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    rec = df[df["application_number"] == "10-2008-0001"].iloc[0]
    assert rec["urgency"] == "RED"
    rec = df[df["application_number"] == "10-2014-0002"].iloc[0]
    assert rec["urgency"] == "YELLOW"


def test_extract_pool_strips_excel_prefix():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    nums = df["application_number"].tolist()
    # ="..." 형식 prefix 제거
    assert all(not n.startswith("=") and not n.startswith('"') for n in nums)
```

- [ ] **Step 2: 테스트 실패 확인**

Run:
```bash
pytest tests/test_extract.py -v
```
Expected: ImportError.

- [ ] **Step 3: extract.py 구현**

Create `patentpilot/etl/patentpilot_etl/extract.py`:
```python
"""01_extract_patents_pool: patents.csv → 매물 풀."""
from pathlib import Path
import pandas as pd
from .classify import classify_org
from .urgency import urgency_tag, remaining_years

# 매물 풀에 포함되는 정상 등록 disposal
ACCEPTED_DISPOSALS = {
    "등록결정(일반)",
    "등록결정(재심사후)",
    "등록결정(심사전치후)",
    "등록결정(취소환송후)",
}

# 풀에서 즉시 제외하는 legalStatus
REJECTED_STATUSES = {
    "연차료미납",
    "포기(등록료 미납)",
    "특허거절결정",
    "특허취하",
    "심사미청구취하",
}


def _strip_excel(s):
    if not isinstance(s, str):
        return s
    return s.strip().strip("=").strip('"')


def extract_pool(source) -> pd.DataFrame:
    """patents.csv를 받아 매물 풀 DataFrame 반환.

    source: 파일 경로(str/Path) 또는 file-like 객체.
    """
    df = pd.read_csv(source, dtype=str, encoding="utf-8-sig", keep_default_na=False)

    # Excel 강제 텍스트 prefix 제거
    for col in ["patApplicationNumber", "patApplicationDate",
                "patRegistrationDate", "patExpirationDate"]:
        if col in df.columns:
            df[col] = df[col].map(_strip_excel)

    # 필수 컬럼 결측 처리
    df["patFinalDisposal"] = df.get("patFinalDisposal", "").fillna("")
    df["patLegalStatus"] = df.get("patLegalStatus", "").fillna("")

    # 매물 풀 필터: 등록결정 + reject 아닌 status + 긴급도 RED/YELLOW
    mask_disposal = df["patFinalDisposal"].isin(ACCEPTED_DISPOSALS)
    mask_status = ~df["patLegalStatus"].isin(REJECTED_STATUSES)
    df = df[mask_disposal & mask_status].copy()

    # 분류 + 긴급도 + 잔여년
    df["org_type"] = df.apply(
        lambda r: classify_org(r.get("patApplicant", ""), r.get("patUniversityName", "")),
        axis=1,
    )
    df["urgency"] = df["patApplicationDate"].map(urgency_tag)
    df = df[df["urgency"].isin(["RED", "YELLOW", "GREEN"])].copy()
    df["remaining_years"] = df["patExpirationDate"].map(remaining_years)

    # 컬럼 매핑 (Supabase 스키마와 일치)
    out = pd.DataFrame({
        "application_number": df["patApplicationNumber"],
        "title": df.get("patTitle", "").fillna(""),
        "applicant": df.get("patApplicant", "").fillna(""),
        "university_name": df.get("patUniversityName", "").fillna(""),
        "org_type": df["org_type"],
        "application_date": df["patApplicationDate"],
        "registration_date": df.get("patRegistrationDate", "").fillna(""),
        "expiration_date": df.get("patExpirationDate", "").fillna(""),
        "ipc_primary": df.get("patIpcNumber", "").fillna("").map(
            lambda s: s.split("|")[0].strip() if s else ""
        ),
        "ipc_all": df.get("patIpcNumber", "").fillna(""),
        "claims_count": pd.to_numeric(df.get("patClaimsCount", "0"), errors="coerce").fillna(0).astype(int),
        "family_count": pd.to_numeric(df.get("patFamilyCount", "0"), errors="coerce").fillna(0).astype(int),
        "citation_count": pd.to_numeric(df.get("patCitationCount", "0"), errors="coerce").fillna(0).astype(int),
        "transfer_count": pd.to_numeric(df.get("patTransferCount", "0"), errors="coerce").fillna(0).astype(int),
        "legal_status": df["patLegalStatus"],
        "final_disposal": df["patFinalDisposal"],
        "rnd_department": df.get("patRndDepartment", "").fillna(""),
        "kipris_link": df.get("patKiprisLink", "").fillna(""),
        "urgency": df["urgency"],
        "remaining_years": df["remaining_years"],
    })
    return out


def main():
    """CLI 진입점: SOURCE/patents.csv → BUILD/patents_pool.csv"""
    from .config import SOURCE_DATA_DIR, BUILD_DIR
    src = SOURCE_DATA_DIR / "patents.csv"
    dst = BUILD_DIR / "patents_pool.csv"
    print(f"reading {src} ...")
    df = extract_pool(src)
    print(f"pool size: {len(df):,}")
    df.to_csv(dst, index=False, encoding="utf-8")
    print(f"wrote {dst}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: 테스트 통과 확인**

Run:
```bash
pytest tests/test_extract.py -v
```
Expected: 4 passed.

- [ ] **Step 5: 실데이터로 ETL 실행**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot/etl
source .venv/bin/activate
python -m patentpilot_etl.extract
```
Expected:
```
reading /Users/kyungsbook/Desktop/Tree0/Data/patents.csv ...
pool size: 80,000~110,000 사이 (RED+YELLOW+GREEN)
wrote /Users/kyungsbook/Desktop/Tree0/patentpilot/etl/build/patents_pool.csv
```

- [ ] **Step 6: 결과 검증**

Run:
```bash
wc -l build/patents_pool.csv
head -3 build/patents_pool.csv
python -c "import pandas as pd; df=pd.read_csv('build/patents_pool.csv'); print(df['urgency'].value_counts()); print(df['org_type'].value_counts())"
```
Expected: RED 약 3~5만, YELLOW 약 6~8만, GREEN 약 5~10만 / UNIV가 GRI보다 많음.

- [ ] **Step 7: Commit (build/ 파일 제외)**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/patentpilot_etl/extract.py etl/tests/test_extract.py
git commit -m "feat(etl): extract patents pool with urgency tagging"
git push
```

---

### Task 9: ETL 2 — legalStatus 최신 status join

**Files:**
- Create: `patentpilot/etl/patentpilot_etl/merge_status.py`

- [ ] **Step 1: merge_status.py 구현 (테스트 없이 - 단순 join이라 검증은 실행 결과로)**

Create `patentpilot/etl/patentpilot_etl/merge_status.py`:
```python
"""02_merge_legal_status: 출원번호별 최신 legalStatus만 patents_pool에 left join."""
import pandas as pd
from .config import SOURCE_DATA_DIR, BUILD_DIR


def _strip_excel(s):
    if not isinstance(s, str):
        return s
    return s.strip().strip("=").strip('"')


def main():
    pool_path = BUILD_DIR / "patents_pool.csv"
    status_path = SOURCE_DATA_DIR / "legalStatus.csv"
    out_path = BUILD_DIR / "patents_with_status.csv"

    print(f"reading pool: {pool_path}")
    pool = pd.read_csv(pool_path, dtype=str, keep_default_na=False)
    print(f"pool rows: {len(pool):,}")

    print(f"reading legalStatus (large file, chunked)...")
    # 1.8GB는 메모리에 한 번에 못 올릴 수 있음 → chunk
    pool_keys = set(pool["application_number"].tolist())
    rows = []
    for chunk in pd.read_csv(status_path, dtype=str, encoding="utf-8-sig",
                              keep_default_na=False, chunksize=200_000):
        chunk["lsApplicationNumber"] = chunk["lsApplicationNumber"].map(_strip_excel)
        chunk["lsStatusDate"] = chunk["lsStatusDate"].map(_strip_excel)
        chunk = chunk[chunk["lsApplicationNumber"].isin(pool_keys)]
        rows.append(chunk[["lsApplicationNumber", "lsStatusName", "lsStatusDate"]])

    status_df = pd.concat(rows, ignore_index=True)
    print(f"matched status rows: {len(status_df):,}")

    # 출원번호별 최신 status (date 기준)
    status_df = status_df.sort_values(["lsApplicationNumber", "lsStatusDate"])
    latest = status_df.groupby("lsApplicationNumber").tail(1)
    latest = latest.rename(columns={
        "lsApplicationNumber": "application_number",
        "lsStatusName": "latest_status",
        "lsStatusDate": "latest_status_date",
    })

    merged = pool.merge(latest, on="application_number", how="left")
    merged.to_csv(out_path, index=False, encoding="utf-8")
    print(f"wrote {out_path} ({len(merged):,} rows)")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 실행**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot/etl
source .venv/bin/activate
python -m patentpilot_etl.merge_status
```
Expected: 약 1~3분 소요 (1.8GB chunked). `pool rows`와 `wrote ... rows`가 같으면 정상.

- [ ] **Step 3: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/patentpilot_etl/merge_status.py
git commit -m "feat(etl): merge latest legalStatus per application"
git push
```

---

### Task 10: ETL 3 — transfers count + 최근 이전일 join

**Files:**
- Create: `patentpilot/etl/patentpilot_etl/merge_transfers.py`

- [ ] **Step 1: merge_transfers.py 구현**

Create `patentpilot/etl/patentpilot_etl/merge_transfers.py`:
```python
"""03_merge_transfers: 출원번호별 transfer 카운트 + 최근 이전일 join."""
import pandas as pd
from .config import SOURCE_DATA_DIR, BUILD_DIR


def _strip_excel(s):
    if not isinstance(s, str):
        return s
    return s.strip().strip("=").strip('"')


def main():
    pool_path = BUILD_DIR / "patents_with_status.csv"
    tr_path = SOURCE_DATA_DIR / "transfers.csv"
    out_path = BUILD_DIR / "patents_final.csv"

    print(f"reading pool: {pool_path}")
    pool = pd.read_csv(pool_path, dtype=str, keep_default_na=False)
    pool_keys = set(pool["application_number"].tolist())

    print(f"reading transfers (chunked)...")
    rows = []
    for chunk in pd.read_csv(tr_path, dtype=str, encoding="utf-8-sig",
                              keep_default_na=False, chunksize=200_000):
        # transfers.csv 헤더 첫 컬럼명 확인 후 변경
        first_col = chunk.columns[0]
        chunk = chunk.rename(columns={first_col: "application_number"})
        chunk["application_number"] = chunk["application_number"].map(_strip_excel)
        chunk = chunk[chunk["application_number"].isin(pool_keys)]
        rows.append(chunk[["application_number"]])

    tr_df = pd.concat(rows, ignore_index=True) if rows else pd.DataFrame({"application_number": []})
    counts = tr_df.groupby("application_number").size().rename("transfer_events").reset_index()
    print(f"applications with transfer events: {len(counts):,}")

    merged = pool.merge(counts, on="application_number", how="left")
    merged["transfer_events"] = merged["transfer_events"].fillna(0).astype(int)
    merged.to_csv(out_path, index=False, encoding="utf-8")
    print(f"wrote {out_path} ({len(merged):,} rows)")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 실행 + 결과 확인**

Run:
```bash
python -m patentpilot_etl.merge_transfers
wc -l build/patents_final.csv
python -c "import pandas as pd; df=pd.read_csv('build/patents_final.csv'); print(df.dtypes); print(df[['urgency','org_type']].value_counts().head(10))"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/patentpilot_etl/merge_transfers.py
git commit -m "feat(etl): merge transfers count"
git push
```

---

### Task 11: Supabase 스키마 마이그레이션 SQL

**Files:**
- Create: `patentpilot/supabase/migrations/20260516000001_initial_schema.sql`

- [ ] **Step 1: 마이그레이션 SQL 작성**

Create `patentpilot/supabase/migrations/20260516000001_initial_schema.sql`:
```sql
-- PatentPilot 초기 스키마 (W1)
-- 매물(patents) + 매수 후보 기업(companies) + IPC 매핑(ipc_company) + LOI(applications)

-- pg_trgm: 한글 부분일치 검색용
create extension if not exists pg_trgm;

-- =============================================================
-- 1) patents — 매물 풀 ~10만 행
-- =============================================================
create table public.patents (
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

create index patents_urgency_idx on public.patents (urgency);
create index patents_org_type_idx on public.patents (org_type);
create index patents_ipc_primary_idx on public.patents (ipc_primary);
create index patents_university_name_idx on public.patents (university_name);
create index patents_title_trgm_idx on public.patents using gin (title gin_trgm_ops);
create index patents_applicant_trgm_idx on public.patents using gin (applicant gin_trgm_ops);

-- =============================================================
-- 2) companies — 매수 후보 기업 시드 30~50
-- =============================================================
create table public.companies (
  id                     bigserial primary key,
  name                   text not null unique,
  industry               text not null default '',
  description            text not null default '',
  revenue_band           text not null default '',  -- 예: '5천억~1조'
  website                text not null default '',
  created_at             timestamptz not null default now()
);

-- =============================================================
-- 3) ipc_company — IPC 코드 ↔ 기업 매칭 가중치
-- =============================================================
create table public.ipc_company (
  id                     bigserial primary key,
  ipc_prefix             text not null,           -- 예: 'B60L', 'H01L', 'A61K'
  company_id             bigint not null references public.companies(id) on delete cascade,
  weight                 numeric(4,3) not null default 1.0,
  note                   text not null default '',
  unique (ipc_prefix, company_id)
);

create index ipc_company_prefix_idx on public.ipc_company (ipc_prefix);

-- =============================================================
-- 4) applications — 거래 신청(LOI) lead
-- =============================================================
create table public.applications (
  id                     bigserial primary key,
  patent_application_number text references public.patents(application_number),
  company_name           text not null,
  contact_name           text not null,
  contact_email          text not null,
  contact_phone          text not null default '',
  proposed_amount        text not null default '', -- 자유 텍스트 (예: '5000만원 협상가능')
  message                text not null default '',
  created_at             timestamptz not null default now()
);

create index applications_created_at_idx on public.applications (created_at desc);

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

create policy patents_read on public.patents for select using (true);
create policy companies_read on public.companies for select using (true);
create policy ipc_company_read on public.ipc_company for select using (true);

-- applications는 익명 insert 허용 (LOI 폼 제출)
create policy applications_insert on public.applications for insert with check (true);
-- 읽기는 service_role만 (admin 페이지 W2 이후)
```

- [ ] **Step 2: Supabase SQL Editor에서 실행 (사용자 수동)**

Supabase 대시보드 → SQL Editor → New query → 위 마이그레이션 SQL 붙여넣기 → Run.
Expected: "Success. No rows returned." 메시지.

Table Editor에서 4개 테이블(`patents`, `companies`, `ipc_company`, `applications`)이 보이면 성공.

- [ ] **Step 3: market_stats() RPC 호출 테스트**

Supabase SQL Editor에서:
```sql
select public.market_stats();
```
Expected: 모든 카운트가 0인 JSON 반환.

- [ ] **Step 4: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add supabase/migrations/20260516000001_initial_schema.sql
git commit -m "feat(db): initial schema for patents, companies, ipc_company, applications"
git push
```

---

### Task 12: ETL 4 — Supabase 적재

**Files:**
- Create: `patentpilot/etl/patentpilot_etl/load_supabase.py`

- [ ] **Step 1: load_supabase.py 구현**

Create `patentpilot/etl/patentpilot_etl/load_supabase.py`:
```python
"""04_load_to_supabase: patents_final.csv → Supabase patents 테이블."""
import io
import pandas as pd
import psycopg2
from psycopg2 import sql
from tqdm import tqdm
from .config import BUILD_DIR, SUPABASE_DB_URL


def _normalize_date(s):
    """빈 문자열을 None으로, 그렇지 않으면 YYYY-MM-DD 그대로."""
    if not s or s == "" or pd.isna(s):
        return None
    s = str(s).strip()
    return s if len(s) >= 10 else None


def main():
    if not SUPABASE_DB_URL:
        raise RuntimeError("SUPABASE_DB_URL not set in .env.local")

    src = BUILD_DIR / "patents_final.csv"
    df = pd.read_csv(src, dtype=str, keep_default_na=False)
    print(f"loaded {len(df):,} rows from {src}")

    # 날짜 정규화
    for col in ["application_date", "registration_date", "expiration_date", "latest_status_date"]:
        if col in df.columns:
            df[col] = df[col].map(_normalize_date)

    # 숫자 컬럼
    for col in ["claims_count", "family_count", "citation_count",
                "transfer_count", "transfer_events", "remaining_years"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

    # 컬럼 순서 맞추기 (SQL 스키마 순)
    cols = [
        "application_number", "title", "applicant", "university_name", "org_type",
        "application_date", "registration_date", "expiration_date",
        "ipc_primary", "ipc_all",
        "claims_count", "family_count", "citation_count",
        "transfer_count", "transfer_events",
        "legal_status", "final_disposal",
        "latest_status", "latest_status_date",
        "rnd_department", "kipris_link",
        "urgency", "remaining_years",
    ]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    df = df[cols]

    print("connecting to Supabase...")
    conn = psycopg2.connect(SUPABASE_DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    # 기존 데이터 비우기 (멱등성)
    print("truncating patents...")
    cur.execute("truncate table public.patents")

    print("uploading via COPY...")
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False, na_rep="\\N")
    buf.seek(0)
    cur.copy_expert(
        sql.SQL("copy public.patents ({cols}) from stdin with (format csv, null '\\N')").format(
            cols=sql.SQL(", ").join(map(sql.Identifier, cols))
        ),
        buf,
    )
    conn.commit()
    cur.execute("select count(*) from public.patents")
    print(f"row count: {cur.fetchone()[0]:,}")

    cur.close()
    conn.close()
    print("done.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 실행**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot/etl
source .venv/bin/activate
python -m patentpilot_etl.load_supabase
```
Expected:
```
loaded 100,000 rows from .../build/patents_final.csv (대략)
connecting to Supabase...
truncating patents...
uploading via COPY...
row count: 100,000
done.
```

대용량 COPY가 안 되면 (Supabase pooler 제한) `SUPABASE_DB_URL`을 pooler URL이 아닌 Direct URL로 바꿔 재시도. Settings → Database → Connection string → URI(Direct) 사용.

- [ ] **Step 3: Supabase에서 적재 검증**

Supabase SQL Editor:
```sql
select count(*) from public.patents;
select urgency, count(*) from public.patents group by urgency order by 1;
select org_type, count(*) from public.patents group by org_type order by 1;
select * from public.market_stats();
```
Expected: `market_stats()`의 total이 적재된 행수와 같고 RED/YELLOW/GREEN 분포가 spec 4.1과 비슷.

- [ ] **Step 4: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/patentpilot_etl/load_supabase.py
git commit -m "feat(etl): load patents into Supabase via COPY"
git push
```

---

### Task 13: 매수 기업 시드 30개 + IPC 매핑 적재

**Files:**
- Create: `patentpilot/etl/data/companies_seed.csv`
- Create: `patentpilot/etl/data/ipc_company_seed.csv`
- Create: `patentpilot/etl/patentpilot_etl/load_companies.py`

- [ ] **Step 1: companies_seed.csv 작성**

Create `patentpilot/etl/data/companies_seed.csv` (30개 시드):
```csv
name,industry,description,revenue_band,website
LG에너지솔루션,배터리,EV·ESS 리튬이온 배터리 글로벌 1위,30조+,https://www.lgensol.com
삼성SDI,배터리,EV·ESS 배터리 및 전자재료,20조+,https://www.samsungsdi.co.kr
SK온,배터리,EV 배터리,10조+,https://www.sk-on.com
포스코퓨처엠,배터리 소재,양극재·음극재·내화물,5조+,https://www.poscofuturem.com
에코프로비엠,배터리 소재,하이니켈 양극재,7조+,https://www.ecoprobm.co.kr
삼성전자,반도체·가전,종합 반도체·디스플레이·가전,300조+,https://www.samsung.com
SK하이닉스,반도체,메모리 반도체 (DRAM/NAND),60조+,https://www.skhynix.com
DB하이텍,반도체,파운드리,2조+,https://www.dbhitek.com
LX세미콘,반도체,디스플레이 구동 IC,2조+,https://www.lxsemicon.com
삼성바이오로직스,바이오,바이오 CDMO,3조+,https://www.samsungbiologics.com
셀트리온,바이오,바이오시밀러,3조+,https://www.celltrion.com
한미약품,바이오,신약 개발 제약,1조+,https://www.hanmi.co.kr
유한양행,바이오,제약·신약,2조+,https://www.yuhan.co.kr
GC녹십자,바이오,혈액제제·백신,1조+,https://www.greencross.com
LG디스플레이,디스플레이,OLED·LCD 패널,20조+,https://www.lgdisplay.com
삼성디스플레이,디스플레이,OLED 패널,30조+,https://www.samsungdisplay.com
한화솔루션,에너지·화학,태양광·케미칼,10조+,https://www.hanwhasolutions.com
두산퓨얼셀,수소·연료전지,수소연료전지,5천억+,https://www.doosanfuelcell.com
효성첨단소재,소재,타이어코드·탄소섬유,3조+,https://www.hyosungadvancedmaterials.com
LG화학,화학,종합 화학·바이오,50조+,https://www.lgchem.com
한화에어로스페이스,항공·방산,항공엔진·방산,5조+,https://www.hanwhaaerospace.co.kr
포스코홀딩스,철강·소재,철강·이차전지 소재,80조+,https://www.posco-inc.com
현대자동차,모빌리티,자동차 OEM,150조+,https://www.hyundai.com
기아,모빌리티,자동차 OEM,100조+,https://www.kia.com
현대모비스,모빌리티 부품,핵심 모듈·전장,50조+,https://www.mobis.co.kr
한국타이어앤테크놀로지,타이어,승용·상용 타이어,8조+,https://www.hankooktire.com
LG전자,가전·전장,가전·전장·B2B,80조+,https://www.lge.co.kr
삼성중공업,조선·해양,LNG선·해양 플랜트,10조+,https://www.samsungshi.com
HD한국조선해양,조선·해양,조선 통합 지주,20조+,https://www.hd.com
KT,통신·AI,통신·클라우드·AI,25조+,https://www.kt.com
```

- [ ] **Step 2: ipc_company_seed.csv 작성**

Create `patentpilot/etl/data/ipc_company_seed.csv` (IPC 4자리 prefix ↔ 기업명, 가중치):
```csv
ipc_prefix,company_name,weight,note
B60L,LG에너지솔루션,1.0,EV 배터리
B60L,삼성SDI,1.0,EV 배터리
B60L,SK온,1.0,EV 배터리
H01M,LG에너지솔루션,1.0,2차 전지
H01M,삼성SDI,1.0,2차 전지
H01M,SK온,1.0,2차 전지
H01M,포스코퓨처엠,0.9,양극재
H01M,에코프로비엠,0.9,양극재
C01G,포스코퓨처엠,0.9,양극재 전구체
C22B,포스코홀딩스,0.9,제련
H01L,삼성전자,1.0,반도체
H01L,SK하이닉스,1.0,반도체
H01L,DB하이텍,0.9,파운드리
H01L,LX세미콘,0.8,DDI
G11C,삼성전자,1.0,메모리
G11C,SK하이닉스,1.0,메모리
G09G,LG디스플레이,1.0,디스플레이 구동
G09G,삼성디스플레이,1.0,디스플레이 구동
H01R,LG디스플레이,0.7,디스플레이 부품
H01R,삼성디스플레이,0.7,디스플레이 부품
A61K,한미약품,1.0,의약
A61K,유한양행,1.0,의약
A61K,GC녹십자,1.0,혈액제제·백신
A61K,셀트리온,1.0,바이오시밀러
C07K,셀트리온,1.0,단백질
C07K,삼성바이오로직스,1.0,항체 의약
C12N,셀트리온,1.0,세포배양
C12N,삼성바이오로직스,1.0,세포배양
C12N,GC녹십자,0.9,백신 생산
H01F,한화솔루션,0.7,에너지 자기
H01M(8),두산퓨얼셀,1.0,수소 연료전지
C08L,한화솔루션,0.9,화학
C08F,LG화학,1.0,고분자
C08L,LG화학,1.0,고분자
F03D,한화솔루션,0.7,풍력
B64C,한화에어로스페이스,1.0,항공
F02C,한화에어로스페이스,1.0,엔진
B62D,현대자동차,1.0,자동차 조향
B62D,기아,1.0,자동차 조향
B60K,현대자동차,1.0,파워트레인
B60K,기아,1.0,파워트레인
B60W,현대모비스,1.0,전장 제어
H04W,KT,1.0,통신
H04L,KT,0.9,통신 프로토콜
H04N,LG전자,0.9,영상
H04N,삼성전자,0.9,영상
H04R,LG전자,0.8,음향
F25B,LG전자,0.9,냉장·HVAC
F24F,LG전자,0.9,공조
B63B,삼성중공업,1.0,선박
B63B,HD한국조선해양,1.0,선박
F17C,HD한국조선해양,0.8,LNG 저장
C09K,LG화학,0.8,화학
C09K,한화솔루션,0.7,화학
```

- [ ] **Step 3: load_companies.py 구현**

Create `patentpilot/etl/patentpilot_etl/load_companies.py`:
```python
"""05_build_company_seed: companies + ipc_company 적재."""
import pandas as pd
import psycopg2
from .config import SUPABASE_DB_URL, ETL_DIR


def main():
    if not SUPABASE_DB_URL:
        raise RuntimeError("SUPABASE_DB_URL not set")

    comp_path = ETL_DIR / "data" / "companies_seed.csv"
    ipc_path = ETL_DIR / "data" / "ipc_company_seed.csv"

    companies = pd.read_csv(comp_path)
    ipc_map = pd.read_csv(ipc_path)

    conn = psycopg2.connect(SUPABASE_DB_URL)
    cur = conn.cursor()

    cur.execute("truncate table public.ipc_company, public.companies restart identity cascade")

    # companies 적재
    for _, r in companies.iterrows():
        cur.execute(
            """insert into public.companies (name, industry, description, revenue_band, website)
               values (%s, %s, %s, %s, %s) returning id""",
            (r["name"], r["industry"], r["description"], r["revenue_band"], r["website"]),
        )

    # name → id 매핑
    cur.execute("select id, name from public.companies")
    name_to_id = {n: i for i, n in cur.fetchall()}

    # ipc_company 적재
    missing = set()
    inserted = 0
    for _, r in ipc_map.iterrows():
        cid = name_to_id.get(r["company_name"])
        if cid is None:
            missing.add(r["company_name"])
            continue
        cur.execute(
            """insert into public.ipc_company (ipc_prefix, company_id, weight, note)
               values (%s, %s, %s, %s)
               on conflict (ipc_prefix, company_id) do update set weight = excluded.weight""",
            (r["ipc_prefix"], cid, float(r["weight"]), r.get("note", "")),
        )
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"companies: {len(companies):,}, ipc_company: {inserted:,}")
    if missing:
        print(f"WARNING: missing company names in seed: {missing}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: 실행 + 검증**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot/etl
source .venv/bin/activate
python -m patentpilot_etl.load_companies
```
Supabase SQL Editor에서:
```sql
select count(*) from public.companies;       -- 30
select count(*) from public.ipc_company;     -- 50+
```

- [ ] **Step 5: Commit**

```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git add etl/data/ etl/patentpilot_etl/load_companies.py
git commit -m "feat(etl): seed 30 companies and IPC mappings"
git push
```

---

## Phase 2: 랜딩 페이지 (Day 4~7, 5/19~5/22)

### Task 14: 타입 정의 + 포맷 유틸

**Files:**
- Create: `patentpilot/src/lib/types.ts`
- Create: `patentpilot/src/lib/format.ts`

- [ ] **Step 1: types.ts 작성**

Create `patentpilot/src/lib/types.ts`:
```typescript
export type Urgency = "RED" | "YELLOW" | "GREEN";
export type OrgType = "UNIV" | "GRI" | "OTHER";

export interface MarketStats {
  total: number;
  red: number;
  yellow: number;
  green: number;
  univ: number;
  gri: number;
  top_universities: Array<{ university_name: string; n: number }>;
}

export interface PatentRow {
  application_number: string;
  title: string;
  applicant: string;
  university_name: string;
  org_type: OrgType;
  application_date: string | null;
  registration_date: string | null;
  expiration_date: string | null;
  ipc_primary: string;
  claims_count: number;
  family_count: number;
  citation_count: number;
  transfer_count: number;
  legal_status: string;
  rnd_department: string;
  kipris_link: string;
  urgency: Urgency;
  remaining_years: number | null;
}
```

- [ ] **Step 2: format.ts 작성**

Create `patentpilot/src/lib/format.ts`:
```typescript
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function urgencyLabel(u: "RED" | "YELLOW" | "GREEN"): string {
  switch (u) {
    case "RED":
      return "긴급";
    case "YELLOW":
      return "임박";
    case "GREEN":
      return "일반";
  }
}

export function urgencyColor(u: "RED" | "YELLOW" | "GREEN"): string {
  switch (u) {
    case "RED":
      return "bg-red-500/10 text-red-700 border-red-300";
    case "YELLOW":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-300";
    case "GREEN":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-300";
  }
}
```

- [ ] **Step 3: 타입체크**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
npx tsc --noEmit
```
Expected: 통과.

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat(web): add types and format utils"
git push
```

---

### Task 15: 통계 API 라우트 + 라이브 카운터 컴포넌트

**Files:**
- Create: `patentpilot/src/app/api/stats/route.ts`
- Create: `patentpilot/src/components/live-counter.tsx`

- [ ] **Step 1: API route 작성**

Create `patentpilot/src/app/api/stats/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { MarketStats } from "@/lib/types";

export const revalidate = 300; // 5분 캐시

export async function GET() {
  const { data, error } = await supabase.rpc("market_stats");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data as MarketStats);
}
```

- [ ] **Step 2: 라이브 카운터 컴포넌트 (서버 컴포넌트)**

Create `patentpilot/src/components/live-counter.tsx`:
```typescript
import { supabase } from "@/lib/supabase";
import type { MarketStats } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/card";

async function fetchStats(): Promise<MarketStats | null> {
  const { data, error } = await supabase.rpc("market_stats");
  if (error) {
    console.error("market_stats error", error);
    return null;
  }
  return data as MarketStats;
}

export async function LiveCounter() {
  const s = await fetchStats();
  if (!s) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        통계를 불러올 수 없습니다.
      </Card>
    );
  }

  const items = [
    { label: "전체 매물", value: s.total, tone: "text-foreground" },
    { label: "🔴 긴급", value: s.red, tone: "text-red-600" },
    { label: "🟡 임박", value: s.yellow, tone: "text-yellow-600" },
    { label: "🟢 일반", value: s.green, tone: "text-emerald-600" },
    { label: "대학", value: s.univ, tone: "text-slate-700" },
    { label: "정출연", value: s.gri, tone: "text-slate-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <Card key={it.label} className="p-4">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className={`mt-1 text-2xl font-bold tabular-nums ${it.tone}`}>
            {formatNumber(it.value)}
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 로컬에서 API 호출 검증**

Run:
```bash
npm run dev
```
브라우저에서 http://localhost:3000/api/stats 접속.
Expected: JSON 응답에 `total`, `red`, `yellow`, `green` 등 카운트 포함.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/stats/route.ts src/components/live-counter.tsx
git commit -m "feat(web): add /api/stats and live counter"
git push
```

---

### Task 16: 헤더 + 푸터 + 글로벌 레이아웃

**Files:**
- Modify: `patentpilot/src/app/layout.tsx`
- Create: `patentpilot/src/components/header.tsx`
- Create: `patentpilot/src/components/footer.tsx`

- [ ] **Step 1: header.tsx**

Create `patentpilot/src/components/header.tsx`:
```typescript
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-bold tracking-tight">
          <span className="text-foreground">Patent</span>
          <span className="text-blue-600">Pilot</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/market" className="text-muted-foreground hover:text-foreground">
            매물 찾기
          </Link>
          <Link href="/apply" className="text-muted-foreground hover:text-foreground">
            거래 신청
          </Link>
          <Link
            href="https://github.com/wannahappyaroundme/patentpilot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: footer.tsx**

Create `patentpilot/src/components/footer.tsx`:
```typescript
export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-24">
      <div className="container mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="mb-2 font-semibold text-foreground">PatentPilot</div>
        <div>잠자는 한국 R&D 특허 7.8만건을 깨우는 매칭 코파일럿</div>
        <div className="mt-4 text-xs">
          © 2026 TreeO. 2026 지식재산 데이터 활용 창업 경진대회 출품작. 데이터 출처: KIPRIS Plus.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: layout.tsx 수정**

Edit `patentpilot/src/app/layout.tsx`. 기존 내용 전체를 다음으로 교체:
```typescript
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "PatentPilot — 잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
  description:
    "한국 대학·정출연이 보유한 R&D 특허 7.8만건 중, 곧 유지비를 포기할 매물을 발굴해 기업과 매칭합니다.",
  openGraph: {
    title: "PatentPilot",
    description: "잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main className="container mx-auto max-w-6xl px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 빌드 + 로컬 확인**

Run:
```bash
npm run dev
```
http://localhost:3000 → 헤더에 PatentPilot 로고와 메뉴, 푸터에 카피라이트 보임.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/components/header.tsx src/components/footer.tsx
git commit -m "feat(web): add header, footer, and root layout"
git push
```

---

### Task 17: Hero 섹션 + 가치 제안 3블록

**Files:**
- Create: `patentpilot/src/components/hero.tsx`
- Create: `patentpilot/src/components/value-props.tsx`

- [ ] **Step 1: hero.tsx**

Create `patentpilot/src/components/hero.tsx`:
```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-3xl">
        <div className="mb-4 inline-block rounded-full border bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          2026 지식재산 데이터 활용 창업 경진대회 출품작
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          잠자는 한국 R&D 특허,
          <br />
          <span className="text-blue-600">깨어날 시간입니다.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          대학·정출연이 보유한 R&D 특허 중 곧 유지비를 포기할 매물을 발굴해,
          그 기술이 필요한 기업과 매칭합니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/market">매물 찾기</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/apply">매물 등록 / 거래 신청</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: value-props.tsx**

Create `patentpilot/src/components/value-props.tsx`:
```typescript
import { Card } from "@/components/ui/card";

const ITEMS = [
  {
    emoji: "🔴",
    title: "유지비 시그널로 발굴",
    body:
      "출원 15~20년차 + 연차료 납부중 + 거래 이력 0건. 데이터로 직접 식별한 매도 동기 강한 매물만 모았습니다.",
  },
  {
    emoji: "🤝",
    title: "기술 보유자 ↔ 기업 매칭",
    body:
      "주 IPC · 기업 R&D 규모 · 협력 이력 3축 가중치 매칭. 매물별 매수 후보 기업 Top 5를 자동 추천합니다.",
  },
  {
    emoji: "📑",
    title: "KIPRIS 원문 즉시 연결",
    body:
      "각 매물 카드에서 한 번에 KIPRIS 공식 원문을 새 창으로 확인. 청구항·서지 정보 별도 가공 없음.",
  },
];

export function ValueProps() {
  return (
    <section className="py-10">
      <div className="grid gap-4 md:grid-cols-3">
        {ITEMS.map((it) => (
          <Card key={it.title} className="p-6">
            <div className="text-3xl">{it.emoji}</div>
            <div className="mt-4 text-lg font-semibold">{it.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: 페이지에 조립**

Edit `patentpilot/src/app/page.tsx` — 전체 내용 교체:
```typescript
import { Hero } from "@/components/hero";
import { LiveCounter } from "@/components/live-counter";
import { ValueProps } from "@/components/value-props";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="py-2">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          지금 시장 (5분 캐시)
        </h2>
        {/* @ts-expect-error Server Component */}
        <LiveCounter />
      </section>
      <ValueProps />
    </>
  );
}
```

- [ ] **Step 4: 로컬 확인**

Run:
```bash
npm run dev
```
http://localhost:3000 → 헤로·라이브 카운터(실데이터 카운트 표시)·가치제안 3블록이 보임.

- [ ] **Step 5: 빌드 + 타입체크**

Run:
```bash
npx tsc --noEmit && npm run build
```
Expected: 통과.

- [ ] **Step 6: Commit**

```bash
git add src/components/hero.tsx src/components/value-props.tsx src/app/page.tsx
git commit -m "feat(web): landing hero, live counter, value props"
git push
```

---

### Task 18: 매물 통계 시각화 패널 (Top 기관)

**Files:**
- Create: `patentpilot/src/components/stats-panel.tsx`
- Modify: `patentpilot/src/app/page.tsx`

- [ ] **Step 1: stats-panel.tsx**

Create `patentpilot/src/components/stats-panel.tsx`:
```typescript
import { supabase } from "@/lib/supabase";
import type { MarketStats } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

async function fetchStats(): Promise<MarketStats | null> {
  const { data, error } = await supabase.rpc("market_stats");
  if (error) {
    console.error("market_stats error", error);
    return null;
  }
  return data as MarketStats;
}

export async function StatsPanel() {
  const s = await fetchStats();
  if (!s) return null;

  const top = s.top_universities ?? [];
  const max = top[0]?.n ?? 1;

  return (
    <Card className="p-6">
      <div className="mb-4 text-sm font-semibold">
        매물 보유 Top 10 기관 (대학 + 정출연)
      </div>
      <ul className="space-y-2">
        {top.map((row) => {
          const pct = (row.n / max) * 100;
          return (
            <li key={row.university_name} className="grid grid-cols-[12rem_1fr_4rem] items-center gap-3 text-sm">
              <span className="truncate text-foreground">{row.university_name}</span>
              <div className="h-2 rounded bg-muted">
                <div
                  className="h-2 rounded bg-blue-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-right tabular-nums text-muted-foreground">
                {formatNumber(row.n)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
```

- [ ] **Step 2: 페이지에 추가**

Edit `patentpilot/src/app/page.tsx` — 마지막에 StatsPanel 추가:
```typescript
import { Hero } from "@/components/hero";
import { LiveCounter } from "@/components/live-counter";
import { ValueProps } from "@/components/value-props";
import { StatsPanel } from "@/components/stats-panel";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="py-2">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          지금 시장 (5분 캐시)
        </h2>
        {/* @ts-expect-error Server Component */}
        <LiveCounter />
      </section>
      <ValueProps />
      <section className="py-10">
        {/* @ts-expect-error Server Component */}
        <StatsPanel />
      </section>
    </>
  );
}
```

- [ ] **Step 3: 로컬 확인 + Commit**

Run:
```bash
npm run dev
```
http://localhost:3000 → Top 10 기관 바차트가 실제 데이터(ETRI/KAIST/KIST/연세대 등)와 함께 표시.

```bash
git add src/components/stats-panel.tsx src/app/page.tsx
git commit -m "feat(web): add top organizations stats panel"
git push
```

---

### Task 19: SEO 메타 + OG 이미지 + 최종 배포 확인

**Files:**
- Create: `patentpilot/public/og-image.png` (수동)
- Modify: `patentpilot/src/app/layout.tsx` — OG 이미지 경로 추가

- [ ] **Step 1: OG 이미지 (수동, 또는 placeholder)**

옵션 A — 디자인 툴(Figma/Canva)로 1200x630 PNG 제작, 다음 텍스트 포함:
- "PatentPilot"
- "잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿"
- 배경: 파란 그라데이션

옵션 B — 일단 placeholder. 다음 명령으로 단색 PNG 생성:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
python3 -c "
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (1200, 630), color=(37, 99, 235))
d = ImageDraw.Draw(img)
d.text((60, 200), 'PatentPilot', fill='white')
d.text((60, 320), '잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿', fill='white')
img.save('public/og-image.png')
"
```
(PIL 없으면 `pip install pillow` 후 재시도)

- [ ] **Step 2: layout.tsx 메타에 OG 이미지 경로 추가**

Edit `patentpilot/src/app/layout.tsx` — metadata 객체의 openGraph에 images 추가:
```typescript
export const metadata: Metadata = {
  title: "PatentPilot — 잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
  description:
    "한국 대학·정출연이 보유한 R&D 특허 7.8만건 중, 곧 유지비를 포기할 매물을 발굴해 기업과 매칭합니다.",
  openGraph: {
    title: "PatentPilot",
    description: "잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PatentPilot",
    description: "잠자는 한국 R&D 특허를 깨우는 매칭 코파일럿",
    images: ["/og-image.png"],
  },
};
```

- [ ] **Step 3: 빌드 + 푸시 + Vercel 배포 확인**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
npm run build
git add public/og-image.png src/app/layout.tsx
git commit -m "feat(web): add OG image and SEO metadata"
git push
```

Vercel 대시보드에서 새 배포가 트리거됨 → 완료 후 `patentpilot.vercel.app`(또는 할당된 URL) 접속.

- [ ] **Step 4: 프로덕션 동작 검증 체크리스트**

브라우저에서 배포 URL 접속해 다음 확인:
- [ ] 헤더 PatentPilot 로고가 보이고 "매물 찾기"·"거래 신청" 메뉴가 있다
- [ ] Hero 헤드라인 "잠자는 한국 R&D 특허, 깨어날 시간입니다." 가 보인다
- [ ] 라이브 카운터에 실제 카운트(전체/RED/YELLOW/GREEN/UNIV/GRI) 6개가 0이 아닌 숫자로 표시된다
- [ ] 가치 제안 3블록(유지비 시그널 / 매칭 / KIPRIS)이 보인다
- [ ] Top 10 기관 바차트가 ETRI·KAIST·KIST 등 실제 기관명으로 채워진다
- [ ] 푸터에 카피라이트와 KIPRIS 출처 명시가 보인다
- [ ] https://patentpilot.vercel.app/api/stats 직접 호출 → JSON 응답 정상
- [ ] 모바일(브라우저 반응형) 확인 — 카드들이 1열로 쌓임
- [ ] OG 이미지: https://www.opengraph.xyz/ 에 배포 URL 붙여넣고 미리보기 확인

- [ ] **Step 5: W1 회고 commit**

Run:
```bash
cd /Users/kyungsbook/Desktop/Tree0/patentpilot
git tag w1-complete -m "W1 foundation complete: ETL + DB + landing page live"
git push --tags
```

---

## Phase 3 미리보기: W2~W4 (별도 plan 작성 예정)

본 plan(W1)은 여기서 완료. 이후 plan은 W1 실행 결과를 본 뒤 작성한다:

| 주차 | 별도 plan 예정 | 핵심 내용 |
|---|---|---|
| W2 (5/23~5/29) | `2026-05-23-patentpilot-w2-marketplace.md` | 매물 리스트 페이지(`/market`), 필터, 매물 상세(`/patent/[appNo]`), 룰베이스 매칭 API, LOI 신청 폼 |
| W3 (5/30~6/5) | `2026-05-30-patentpilot-w3-pitch.md` | 사업계획서 v2, 슬라이드 v2, 데모 영상 raw, **(stretch)** AI 채팅 코파일럿 |
| W4 (6/6~6/10) | `2026-06-06-patentpilot-w4-polish.md` | 외부 피드백 반영, 성능·접근성 폴리싱, 영상 본녹화, 6/10 17~18시 제출 |

---

## Self-Review

**Spec coverage:**
- spec §1 배경/전제 → Task 5~8에서 ETL 룰로 코드화
- spec §2 정체성 → Task 16 헤더·푸터 카피, Task 17 Hero
- spec §3 페르소나 → W1 미반영(W2 매물·매칭 화면에서 반영)
- spec §4 매물 풀 정의 → Task 7~10 ETL + Task 11 스키마
- spec §5 매칭 로직 → W2로 이월
- spec §6 정보구조 5화면 → 화면 1(랜딩) W1, 나머지 4 → W2~W3
- spec §7 기술 아키텍처 → Task 1~4 셋업
- spec §8 데이터 파이프라인 → Task 5~13
- spec §9 일정 → 본 plan = W1
- spec §10 리스크 → ETL 시간/COPY 실패 대응이 Task 12 Step 2에 명시
- spec §11 미해결 → 한글 풀텍스트는 Task 11에서 trigram(pg_trgm)으로 결정

**Placeholder scan:** 모든 step에 실제 코드/명령/SQL 포함. "TBD"·"TODO" 없음.

**Type consistency:** TypeScript 측 `MarketStats`/`PatentRow`/`Urgency` 일관, ETL 측 컬럼명이 SQL 마이그레이션과 일치 확인. `urgency` 값 'RED'/'YELLOW'/'GREEN', `org_type` 'UNIV'/'GRI'/'OTHER' 양쪽 일치.

이상 없음. 실행으로 넘어갈 준비 완료.
