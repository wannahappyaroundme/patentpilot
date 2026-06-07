"""IMP·COM 보강 컬럼 적재 — citation_span + prior_patent_count.

전제:
- 마이그레이션 20260612000001 실행으로 6개 컬럼 + 2개 인덱스 추가됨
- ETL CSV 두 개 빌드 완료:
    etl/build/citation_span.csv
    etl/build/prior_patent_count.csv

방법: 각 CSV를 임시 테이블에 COPY → UPDATE FROM JOIN (load_inventors.py와 동일 패턴).

사용:
    python -m patentpilot_etl.load_imp_com
"""

from __future__ import annotations

import io
import sys
from pathlib import Path

import pandas as pd
import psycopg2

from .config import BUILD_DIR, SUPABASE_DB_URL


def load_citation_span(conn) -> None:
    csv_path = BUILD_DIR / "citation_span.csv"
    if not csv_path.exists():
        print(f"  [skip] {csv_path} 없음 — citation_span ETL 먼저 실행", file=sys.stderr)
        return

    df = pd.read_csv(csv_path, dtype=str, keep_default_na=False)
    print(f"  [citation_span] {len(df):,} rows", file=sys.stderr)
    if df.empty:
        print("  [skip] 0 rows", file=sys.stderr)
        return

    cur = conn.cursor()
    cur.execute(
        """
        create temp table tmp_citation_span (
          application_number text primary key,
          citation_span_norm smallint,
          citation_span_n    smallint,
          citation_span_conf text
        ) on commit drop;
        """
    )
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False)
    buf.seek(0)
    cur.copy_expert(
        "copy tmp_citation_span (application_number, citation_span_norm, citation_span_n, citation_span_conf) "
        "from stdin with (format csv)",
        buf,
    )
    cur.execute("select count(*) from tmp_citation_span")
    print(f"  [citation_span] tmp rows: {cur.fetchone()[0]:,}", file=sys.stderr)

    cur.execute(
        """
        update public.patents p
           set citation_span_norm = t.citation_span_norm,
               citation_span_n    = t.citation_span_n,
               citation_span_conf = t.citation_span_conf
          from tmp_citation_span t
         where t.application_number = p.application_number;
        """
    )
    conn.commit()
    cur.execute(
        "select count(*) from public.patents where citation_span_norm is not null"
    )
    print(
        f"  [citation_span] patents 컬럼 채워진 행: {cur.fetchone()[0]:,}",
        file=sys.stderr,
    )
    cur.close()


def load_prior_patent(conn) -> None:
    csv_path = BUILD_DIR / "prior_patent_count.csv"
    if not csv_path.exists():
        print(
            f"  [skip] {csv_path} 없음 — prior_patent_count ETL 먼저 실행",
            file=sys.stderr,
        )
        return

    df = pd.read_csv(csv_path, dtype=str, keep_default_na=False)
    print(f"  [prior_patent_count] {len(df):,} rows", file=sys.stderr)
    if df.empty:
        print("  [skip] 0 rows", file=sys.stderr)
        return

    cur = conn.cursor()
    cur.execute(
        """
        create temp table tmp_prior_patent (
          application_number     text primary key,
          prior_patent_count     smallint,
          prior_patent_count_max smallint,
          prior_patent_conf      text
        ) on commit drop;
        """
    )
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False)
    buf.seek(0)
    cur.copy_expert(
        "copy tmp_prior_patent (application_number, prior_patent_count, prior_patent_count_max, prior_patent_conf) "
        "from stdin with (format csv)",
        buf,
    )
    cur.execute("select count(*) from tmp_prior_patent")
    print(f"  [prior_patent_count] tmp rows: {cur.fetchone()[0]:,}", file=sys.stderr)

    cur.execute(
        """
        update public.patents p
           set prior_patent_count     = t.prior_patent_count,
               prior_patent_count_max = t.prior_patent_count_max,
               prior_patent_conf      = t.prior_patent_conf
          from tmp_prior_patent t
         where t.application_number = p.application_number;
        """
    )
    conn.commit()
    cur.execute(
        "select count(*) from public.patents where prior_patent_count is not null"
    )
    print(
        f"  [prior_patent_count] patents 컬럼 채워진 행: {cur.fetchone()[0]:,}",
        file=sys.stderr,
    )
    cur.close()


def main() -> int:
    if not SUPABASE_DB_URL:
        print(
            "[error] SUPABASE_DB_URL 환경변수 필요 (.env.local 확인)", file=sys.stderr
        )
        return 2

    print("[load_imp_com] 연결 중...", file=sys.stderr)
    conn = psycopg2.connect(SUPABASE_DB_URL)
    conn.autocommit = False

    print("[load_imp_com] citation_span 적재", file=sys.stderr)
    load_citation_span(conn)

    print("[load_imp_com] prior_patent_count 적재", file=sys.stderr)
    load_prior_patent(conn)

    # 최종 분포 검증
    cur = conn.cursor()
    cur.execute(
        """
        select count(*) total,
               count(citation_span_norm) span_filled,
               count(prior_patent_count) prior_filled
        from public.patents
        where latest_status = '연차료납부';
        """
    )
    total, span, prior = cur.fetchone()
    print(
        f"\n[load_imp_com] 활성 풀 {total:,}건 중 "
        f"span={span:,} ({span / total:.1%}) · prior={prior:,} ({prior / total:.1%})",
        file=sys.stderr,
    )
    cur.close()
    conn.close()
    print("[load_imp_com] 완료", file=sys.stderr)
    print(
        "[load_imp_com] 다음: npm run precompute-rank (PatentRank 재계산)",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
