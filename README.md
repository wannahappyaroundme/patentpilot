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

```bash
# Next.js
npm install
npm run dev

# Python ETL
cd etl
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest

# Run ETL pipeline (requires Data/ folder and .env.local with SUPABASE_DB_URL)
python -m patentpilot_etl.extract
python -m patentpilot_etl.merge_status
python -m patentpilot_etl.merge_transfers
python -m patentpilot_etl.load_supabase
python -m patentpilot_etl.load_companies
```

## 환경변수

`.env.example` 참조. `.env.local`에 실제 값 채워넣기 (gitignore에 의해 commit 안 됨).
