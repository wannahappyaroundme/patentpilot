"""CitationSpan ETL — IMP 축 보강 변수 (OECD Generality / Shannon entropy).

각 활성 매물에 대해 그 매물을 인용한(forward citation) 후속 특허들의 IPC
서브클래스 분포가 얼마나 다양한지 Shannon entropy로 측정. 학술적으로는
Trajtenberg-Henderson-Jaffe 1997 / OECD 2013의 generality 지수 운영화.

입력:
- /Users/kyungsbook/Desktop/Tree0/Data/patents.csv   (원본 370k — IPC + 출원일 lookup)
- /Users/kyungsbook/Desktop/Tree0/Data/citings.csv   (935k forward citation 관계)

출력:
- etl/build/citation_span.csv (application_number · norm · n · conf)

핵심 안전 장치 (워크플로우 critic 반영):
1. Excel 이스케이프 ='...' 제거 (이 한 줄 빠지면 lookup 100% 미스)
2. 날짜 포맷 %Y-%m-%d (대시 포함)
3. patIpcNumber 구분자는 ';' (공백 포함), 일관성 위해 [;|] 모두 split
4. backward 인용 제거 (citing.app_date > cited.app_date)
5. NPL 코드 E0805 제외 (논문/표준 인용)
6. drop_duplicates 명시
7. N<5 NULL 가드 (이전 N<2일 때 47%가 binary 0/100 노이즈가 되는 문제 차단)
8. citing-side IPC lookup hit rate를 stderr로 출력 (50% 미만이면 IMP fallback)

사용:
    python -m patentpilot_etl.citation_span
"""

from __future__ import annotations

import re
import sys
from math import log2
from pathlib import Path

import numpy as np
import pandas as pd

from .config import SOURCE_DATA_DIR, BUILD_DIR


EXCEL_RE = re.compile(r'^="?|"$')
KR_APPNO_RE = re.compile(r"^\d{2}-\d{4}-\d{7}$")
IPC_SUBCLASS_RE = re.compile(r"^[A-H]\d{2}[A-Z]$")


def strip_excel(s: str) -> str:
    """Excel 텍스트 저장으로 생긴 ='...' 래퍼를 제거."""
    if not isinstance(s, str):
        return ""
    return EXCEL_RE.sub("", s).strip().strip('"').strip()


def ipc_to_subclass(raw_ipc: str) -> str:
    """patIpcNumber 첫 IPC의 4자리 subclass 추출. 'G04G 7/00; G04R 20/22' → 'G04G'."""
    if not raw_ipc:
        return ""
    head = re.split(r"[;|]", raw_ipc)[0]
    return head.replace(" ", "").upper()[:4]


def shannon_norm(subclasses: np.ndarray, cap: int = 30) -> int | None:
    """Shannon entropy → 0~100 정규화. N<5는 None (binary 노이즈 차단)."""
    n = len(subclasses)
    if n < 5:
        return None
    _, counts = np.unique(subclasses, return_counts=True)
    p = counts / n
    H = float(-(p * np.log2(p)).sum())
    Hmax = log2(min(n, cap))
    if Hmax <= 0:
        return 0
    return int(round(H / Hmax * 100))


def main() -> int:
    print("[citation_span] ETL 시작", file=sys.stderr)

    # ── 1) patents.csv → (app_no → ipc_subclass, app_date) lookup ──────────
    pat = pd.read_csv(
        SOURCE_DATA_DIR / "patents.csv",
        usecols=["patApplicationNumber", "patIpcNumber", "patApplicationDate"],
        dtype=str,
        keep_default_na=False,
        encoding="utf-8-sig",
    )
    for c in ("patApplicationNumber", "patApplicationDate"):
        pat[c] = pat[c].map(strip_excel)
    pat["subclass"] = pat["patIpcNumber"].fillna("").map(ipc_to_subclass)
    pat = pat[pat["subclass"].str.match(IPC_SUBCLASS_RE, na=False)]
    pat["app_date"] = pd.to_datetime(
        pat["patApplicationDate"], format="%Y-%m-%d", errors="coerce"
    )
    pat = pat.dropna(subset=["app_date"])
    ipc_map = dict(zip(pat["patApplicationNumber"], pat["subclass"]))
    date_map = dict(zip(pat["patApplicationNumber"], pat["app_date"]))
    print(f"[citation_span] ipc_map {len(ipc_map):,} entries", file=sys.stderr)

    # ── 2) citings.csv 로드 + 정규화 ───────────────────────────────────────
    cit = pd.read_csv(
        SOURCE_DATA_DIR / "citings.csv",
        usecols=[
            "citStandardApplicationNumber",
            "citApplicationNumber",
            "citStatusCode",
            "citLiteratureTypeCode",
        ],
        dtype=str,
        keep_default_na=False,
        encoding="utf-8-sig",
    )
    for c in ("citStandardApplicationNumber", "citApplicationNumber"):
        cit[c] = cit[c].map(strip_excel)
    cit = cit.rename(
        columns={
            "citStandardApplicationNumber": "cited",
            "citApplicationNumber": "citing",
        }
    )
    # KR 포맷만 + self-loop 제거
    cit = cit[
        cit["cited"].str.match(KR_APPNO_RE, na=False)
        & cit["citing"].str.match(KR_APPNO_RE, na=False)
    ]
    cit = cit[cit["cited"] != cit["citing"]]
    # NPL (E0805) 제외 — examiner + 출원서 인용만 채택
    cit = cit[cit["citLiteratureTypeCode"].isin(["E0801", "E0802", "E0806"])]
    cit = cit.drop_duplicates(subset=["cited", "citing"])
    print(f"[citation_span] unique cited↔citing pairs: {len(cit):,}", file=sys.stderr)

    # ── 3) IPC + 시점 조인, forward만 ─────────────────────────────────────
    cit["citing_ipc"] = cit["citing"].map(ipc_map)
    cit["citing_date"] = cit["citing"].map(date_map)
    cit["cited_date"] = cit["cited"].map(date_map)

    ipc_hit = cit["citing_ipc"].notna().mean()
    print(f"[citation_span] citing-side IPC lookup hit: {ipc_hit:.1%}", file=sys.stderr)
    if ipc_hit < 0.50:
        print(
            "[citation_span] ⚠ hit rate <50% — IMP 가중치 통합 비활성 권장",
            file=sys.stderr,
        )

    cit = cit.dropna(subset=["citing_ipc", "citing_date", "cited_date"])
    cit = cit[cit["citing_date"] > cit["cited_date"]]
    print(f"[citation_span] forward-only pairs: {len(cit):,}", file=sys.stderr)

    # ── 4) Shannon entropy per cited ──────────────────────────────────────
    def agg_shannon(s: pd.Series) -> int | None:
        return shannon_norm(s.to_numpy())

    grp = cit.groupby("cited")["citing_ipc"]
    out = grp.agg(
        citation_span_norm=agg_shannon,
        citation_span_n="size",
    ).reset_index()
    out = out.rename(columns={"cited": "application_number"})

    # confidence (N 기반)
    out["citation_span_conf"] = np.where(
        out["citation_span_n"] >= 20,
        "HIGH",
        np.where(out["citation_span_n"] >= 10, "MED", "LOW"),
    )
    # N<5 (norm = None) drop
    out = out.dropna(subset=["citation_span_norm"])
    out["citation_span_norm"] = out["citation_span_norm"].astype(int)
    out["citation_span_n"] = out["citation_span_n"].astype(int)

    # ── 5) sanity ─────────────────────────────────────────────────────────
    if len(out) == 0:
        print("[citation_span] FATAL: 0 rows — 입력 포맷 재확인", file=sys.stderr)
        return 1

    mode_share = (
        out["citation_span_norm"].value_counts(normalize=True).iloc[0]
        if len(out) > 0
        else 0
    )
    print(
        f"[citation_span] output {len(out):,} rows · "
        f"p50={out['citation_span_norm'].median():.0f} · "
        f"mode_share={mode_share:.1%}",
        file=sys.stderr,
    )

    out_path = BUILD_DIR / "citation_span.csv"
    out.to_csv(out_path, index=False)
    print(f"[citation_span] wrote {out_path}", file=sys.stderr)
    print(
        "[citation_span] 다음: python -m patentpilot_etl.load_imp_com",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
