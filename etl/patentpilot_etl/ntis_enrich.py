"""NTIS OpenAPI 기반 R&D 과제 매칭 ETL — COM 축 변수 보강.

NTIS(National Science & Technology Information Service) OpenAPI는 한국 정부
R&D 과제 메타데이터를 제공한다. 각 patent의 권리자(법인)를 NTIS 과제의
주관/공동 기관과 매칭해 다음 변수를 추출:

- FundedProjectsCount: 해당 법인이 참여한 정부 R&D 과제 누적 건수
- ProjectFundingScale: 해당 법인의 정부 R&D 과제 누적 예산(억 원)

발명자 단위 매칭(InventorCommercializationIndex.FundedProjectsCount)은
동명이인 리스크로 v2에서 처리. 본 스크립트는 *법인 단위*만 다룬다.

사전 조건:
1. NTIS OpenAPI 인증키 발급 (영업일 3~5일) — https://www.ntis.go.kr/
2. .env.local에 NTIS_API_KEY 설정
3. Supabase 테이블 `org_ntis_summary` 생성 (스키마는 본 파일 하단 SQL 참조)

사용:
    python -m patentpilot_etl.ntis_enrich --year-from 2010 --year-to 2024 \\
        --out etl/build/org_ntis_summary.csv

    # 검증: 일부 기관만 먼저 시도
    python -m patentpilot_etl.ntis_enrich --orgs "한국전자통신연구원,한국과학기술원"
"""

from __future__ import annotations

import argparse
import csv
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    import requests
except ImportError:
    print(
        "[error] requests 모듈이 필요합니다: pip install requests",
        file=sys.stderr,
    )
    sys.exit(1)

NTIS_API_BASE = "https://www.ntis.go.kr/rndopen/openApi/public_project"
DEFAULT_TIMEOUT = 15  # seconds
SLEEP_BETWEEN_CALLS = 0.4  # NTIS rate limit 보호 (정확한 한도 미공개)


@dataclass
class OrgNtisSummary:
    org_name: str
    funded_projects_count: int
    project_funding_scale_billions: float  # 단위: 억 원
    sample_project_title: str
    sample_project_year: str


def fetch_ntis_projects(
    org_name: str,
    api_key: str,
    year_from: int = 2010,
    year_to: int = 2024,
    max_pages: int = 50,
) -> list[dict]:
    """NTIS OpenAPI에서 특정 기관 참여 과제 메타데이터 수집.

    NTIS API 스펙이 외부 공개 제한적이라 본 함수는 *어댑터 인터페이스*다.
    실제 API 호출 부분은 NTIS 인증키 발급 후 응답 스펙에 맞춰 수정 필요.
    """
    if not api_key:
        raise RuntimeError("NTIS_API_KEY 환경변수가 설정되지 않았습니다.")

    projects: list[dict] = []
    for page in range(1, max_pages + 1):
        params = {
            "apprvKey": api_key,
            "collection": "rndPjt",
            "searchWord": org_name,
            "searchField": "조직",
            "yearFrom": year_from,
            "yearTo": year_to,
            "displayCnt": 100,
            "pageNum": page,
            "responseType": "json",
        }
        try:
            r = requests.get(NTIS_API_BASE, params=params, timeout=DEFAULT_TIMEOUT)
            r.raise_for_status()
            data = r.json()
        except (requests.RequestException, ValueError) as e:
            print(f"  [warn] {org_name} page {page} 실패: {e}", file=sys.stderr)
            break

        # NTIS 응답 스키마는 인증키 발급 후 직접 확인 — 아래는 가정 스키마
        items = data.get("items") or data.get("body", {}).get("items", [])
        if not items:
            break
        projects.extend(items)
        if len(items) < 100:
            break
        time.sleep(SLEEP_BETWEEN_CALLS)

    return projects


def summarize_org(
    org_name: str, projects: list[dict]
) -> OrgNtisSummary:
    """과제 리스트 → 법인별 요약 통계."""
    count = len(projects)
    total_billion = 0.0
    sample_title = ""
    sample_year = ""

    for p in projects:
        # NTIS 응답에서 예산 필드명은 발급 후 확인 필요. 가정: 'totalBudget'(원)
        budget_won = p.get("totalBudget") or p.get("budget") or 0
        try:
            budget_billion = float(budget_won) / 100_000_000.0  # 원 → 억
            total_billion += budget_billion
        except (TypeError, ValueError):
            pass
        if not sample_title:
            sample_title = (p.get("title") or p.get("prjtTitle") or "")[:80]
            sample_year = str(p.get("year") or p.get("startYear") or "")

    return OrgNtisSummary(
        org_name=org_name,
        funded_projects_count=count,
        project_funding_scale_billions=round(total_billion, 2),
        sample_project_title=sample_title,
        sample_project_year=sample_year,
    )


def write_csv(rows: Iterable[OrgNtisSummary], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(
            [
                "org_name",
                "funded_projects_count",
                "project_funding_scale_billions",
                "sample_project_title",
                "sample_project_year",
            ]
        )
        for r in rows:
            w.writerow(
                [
                    r.org_name,
                    r.funded_projects_count,
                    r.project_funding_scale_billions,
                    r.sample_project_title,
                    r.sample_project_year,
                ]
            )


def main() -> int:
    ap = argparse.ArgumentParser(description="NTIS R&D 과제 매칭 ETL (법인 단위)")
    ap.add_argument(
        "--orgs",
        help="콤마 구분 기관명 (지정 시 해당 기관만 처리). 미지정 시 patents 테이블에서 자동 수집",
    )
    ap.add_argument("--year-from", type=int, default=2010)
    ap.add_argument("--year-to", type=int, default=2024)
    ap.add_argument(
        "--out",
        type=Path,
        default=Path("etl/build/org_ntis_summary.csv"),
    )
    args = ap.parse_args()

    api_key = os.environ.get("NTIS_API_KEY", "").strip()
    if not api_key:
        print(
            "[error] NTIS_API_KEY 환경변수를 설정하세요.\n"
            "  발급: https://www.ntis.go.kr/ (인증키 신청 → 영업일 3~5일)\n"
            "  설정: export NTIS_API_KEY=xxxxx 또는 .env.local 추가",
            file=sys.stderr,
        )
        return 2

    if args.orgs:
        org_list = [o.strip() for o in args.orgs.split(",") if o.strip()]
    else:
        # patents 테이블에서 상위 100개 기관 자동 수집
        from .config import build_supabase_client

        sb = build_supabase_client()
        if sb is None:
            print(
                "[error] Supabase client 빌드 실패. --orgs 옵션으로 수동 지정하거나 "
                "환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)를 설정하세요.",
                file=sys.stderr,
            )
            return 2
        # 상위 100개 기관 (매물 풀 기준)
        resp = sb.rpc("top_universities", {"limit_n": 100}).execute()
        org_list = [row["university_name"] for row in (resp.data or [])]
        print(f"[info] 상위 기관 {len(org_list)}개 자동 수집")

    if not org_list:
        print("[error] 처리할 기관이 없습니다.", file=sys.stderr)
        return 2

    print(f"[info] {len(org_list)}개 기관 NTIS 매칭 시작 ({args.year_from}~{args.year_to})")
    summaries: list[OrgNtisSummary] = []
    for i, org in enumerate(org_list, 1):
        print(f"  [{i}/{len(org_list)}] {org}...", end=" ", flush=True)
        try:
            projects = fetch_ntis_projects(
                org, api_key, args.year_from, args.year_to
            )
            summary = summarize_org(org, projects)
            summaries.append(summary)
            print(
                f"{summary.funded_projects_count}건 · "
                f"{summary.project_funding_scale_billions}억"
            )
        except Exception as e:
            print(f"실패: {e}")
            summaries.append(OrgNtisSummary(org, 0, 0.0, "", ""))
        time.sleep(SLEEP_BETWEEN_CALLS)

    write_csv(summaries, args.out)
    print(f"\n[ok] {args.out} 작성 완료. 다음 단계:")
    print(f"     1) Supabase org_ntis_summary 테이블에 적재")
    print(f"     2) patents 테이블과 university_name 기준 join")
    print(f"     3) src/lib/patent-rank.ts의 COM 축 계산을 NTIS 컬럼 사용으로 교체")
    return 0


if __name__ == "__main__":
    sys.exit(main())


# === Supabase 스키마 (적재 전 1회 실행) ===========================================
#
# create table public.org_ntis_summary (
#     org_name                       text primary key,
#     funded_projects_count          integer not null default 0,
#     project_funding_scale_billions numeric(12,2) not null default 0,
#     sample_project_title           text,
#     sample_project_year            text,
#     synced_at                      timestamptz not null default now()
# );
# create index on public.org_ntis_summary (funded_projects_count desc);
#
# -- patents 조인용 view (선택)
# create view public.patents_with_ntis as
# select p.*,
#        coalesce(n.funded_projects_count, 0)          as ntis_projects,
#        coalesce(n.project_funding_scale_billions, 0) as ntis_funding_billions
# from public.patents p
# left join public.org_ntis_summary n
#   on n.org_name = p.university_name;
# =============================================================================
