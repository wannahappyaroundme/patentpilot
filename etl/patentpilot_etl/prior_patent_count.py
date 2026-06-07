"""PriorPatentCount ETL — COM 축의 InventorCommercializationIndex 보강.

각 매물 발명자별로 본인의 과거(이 매물 출원일 기준 *5년 이내* 더 이른 출원만)
누적 등록 특허 수를 계산하고, 매물 단위로 평균(avg) + 최대(max) 집계.

학술적으로: 발명자의 발명 경험 누적이 사업화 채널 확보·라이선싱 노하우와
양의 상관 (Carpenter-Narin-Woolf 1981 변형). spec.md §6 COM 축의
InventorCommercializationIndex 내부 PriorPatentCount=0.3 비중.

동명이인 처리 (워크플로우 critic 핵심):
- 보조키: (이름, primary_applicant, ipc_subclass) 3-튜플
- 5년 시간 윈도우: app_date - prior.app_date ≤ 5년만 prior 인정
- Suspect black-list: 같은 (이름, primary_applicant) 100건+ = 다중 인물 클러스터 의심 → NULL
- confidence 등급 노출 (LOW일 때 점수 미반영)

입력:
- /Users/kyungsbook/Desktop/Tree0/Data/patents.csv (원본 370k)

출력:
- etl/build/prior_patent_count.csv (application_number · avg · max · conf)

사용:
    python -m patentpilot_etl.prior_patent_count
"""

from __future__ import annotations

import re
import sys

import numpy as np
import pandas as pd

from .config import SOURCE_DATA_DIR, BUILD_DIR


EXCEL_RE = re.compile(r'^="?|"$')
SPLIT_INV = re.compile(r"\s*;\s*")
WS_RE = re.compile(r"\s+")
# 기관명 후행어 — 발명자 칸에 잘못 들어온 기관명 필터링
ORG_TAIL = re.compile(
    r"(연구원|대학교?|주식회사|연구소|센터|랩|재단|법인|병원|학교|"
    r"Inc\.?$|Corp\.?$|Ltd\.?$|Co\.?$|LLC$)",
    re.IGNORECASE,
)


def strip_excel(s: str) -> str:
    if not isinstance(s, str):
        return ""
    return EXCEL_RE.sub("", s).strip().strip('"').strip()


def parse_inventors(raw: str) -> list[str]:
    """세미콜론 구분 + 공백 정규화 + 기관 오염 필터 + 매물 내 중복 제거."""
    parts = [WS_RE.sub(" ", p.strip()) for p in SPLIT_INV.split(raw) if p.strip()]
    clean = [p for p in parts if not ORG_TAIL.search(p)]
    return list(dict.fromkeys(clean))  # 매물 내 중복 제거


def ipc_to_subclass(raw_ipc: str) -> str:
    if not raw_ipc:
        return ""
    head = re.split(r"[;|]", raw_ipc)[0]
    return head.replace(" ", "").upper()[:4]


def windowed_prior(group: pd.DataFrame) -> pd.Series:
    """그룹 내 5년 윈도우 prior count.

    group은 (key 단일) · app_date 오름차순. 각 row i에 대해
    cutoffs[i] ≤ app_date[j] < app_date[i] 인 j의 개수.
    """
    dates = group["app_date"].to_numpy()
    cutoffs = group["cutoff"].to_numpy()
    n = len(group)
    out = np.zeros(n, dtype=np.int32)
    lo = 0
    for i in range(n):
        # cutoff보다 빠른 출원은 윈도우 밖
        while lo < i and dates[lo] < cutoffs[i]:
            lo += 1
        out[i] = i - lo
    return pd.Series(out, index=group.index)


def main() -> int:
    print("[prior_patent_count] ETL 시작", file=sys.stderr)

    # ── 1) load + 정규화 ─────────────────────────────────────────────────
    df = pd.read_csv(
        SOURCE_DATA_DIR / "patents.csv",
        usecols=[
            "patApplicationNumber",
            "patApplicationDate",
            "patInventor",
            "patApplicant",
            "patIpcNumber",
        ],
        dtype=str,
        keep_default_na=False,
        encoding="utf-8-sig",
    )
    for c in ("patApplicationNumber", "patApplicationDate"):
        df[c] = df[c].map(strip_excel)
    df["app_date"] = pd.to_datetime(
        df["patApplicationDate"], format="%Y-%m-%d", errors="coerce"
    )
    df = df.dropna(subset=["app_date"])
    df = df[df["patInventor"].str.len() > 0]

    print(f"[prior_patent_count] valid patents: {len(df):,}", file=sys.stderr)

    # ── 2) 발명자 파싱 + 매물 메타 ───────────────────────────────────────
    df["inventors"] = df["patInventor"].map(parse_inventors)
    df["primary_app"] = df["patApplicant"].map(
        lambda s: SPLIT_INV.split(s)[0].strip() if isinstance(s, str) else ""
    )
    df["subclass"] = df["patIpcNumber"].fillna("").map(ipc_to_subclass)

    long = df.explode("inventors").dropna(subset=["inventors"])
    long = long.rename(
        columns={"inventors": "name", "patApplicationNumber": "app_no"}
    )
    long["name"] = long["name"].str.strip()
    long = long[long["name"].str.len() > 0]

    # 3-튜플 키 (동명이인 분리 보조)
    long["key"] = (
        long["name"] + "||" + long["primary_app"] + "||" + long["subclass"].fillna("")
    )
    print(
        f"[prior_patent_count] long rows: {len(long):,} · "
        f"unique keys: {long['key'].nunique():,}",
        file=sys.stderr,
    )

    # ── 3) Suspect 클러스터 black-list ────────────────────────────────────
    # 같은 (name, primary_applicant) 100건+ = 동명이인 클러스터 의심
    name_app = long["name"] + "||" + long["primary_app"]
    suspect_keys = (
        name_app.value_counts().loc[lambda s: s >= 100].index.tolist()
    )
    long["suspect"] = name_app.isin(suspect_keys)
    print(
        f"[prior_patent_count] suspect (name,applicant) clusters: "
        f"{len(suspect_keys):,} keys · {int(long['suspect'].sum()):,} rows tagged",
        file=sys.stderr,
    )

    # ── 4) 5년 윈도우 cumcount ───────────────────────────────────────────
    long = long.sort_values(["key", "app_date", "app_no"], kind="mergesort")
    long["cutoff"] = long["app_date"] - pd.Timedelta(days=365 * 5)

    print("[prior_patent_count] computing windowed prior counts...", file=sys.stderr)
    long["prior_count"] = (
        long.groupby("key", sort=False)
        .apply(windowed_prior)
        .reset_index(level=0, drop=True)
    )
    # suspect 키는 prior_count NULL (신호 폐기)
    long.loc[long["suspect"], "prior_count"] = np.nan

    # ── 5) 매물별 집계 ────────────────────────────────────────────────────
    valid = long.dropna(subset=["prior_count"])
    agg = (
        valid.groupby("app_no")["prior_count"]
        .agg(prior_avg="mean", prior_max="max", prior_n="count")
        .reset_index()
    )
    total_inv = long.groupby("app_no").size().rename("total_inv").reset_index()
    agg = agg.merge(total_inv, on="app_no", how="left")
    agg["conf_ratio"] = agg["prior_n"] / agg["total_inv"]
    agg["prior_patent_conf"] = np.where(
        agg["conf_ratio"] >= 0.7,
        "HIGH",
        np.where(agg["conf_ratio"] >= 0.4, "MED", "LOW"),
    )
    agg["prior_patent_count"] = agg["prior_avg"].round().astype(int)
    agg["prior_patent_count_max"] = agg["prior_max"].astype(int)

    out = agg[
        [
            "app_no",
            "prior_patent_count",
            "prior_patent_count_max",
            "prior_patent_conf",
        ]
    ].rename(columns={"app_no": "application_number"})

    if len(out) == 0:
        print("[prior_patent_count] FATAL: 0 rows — 입력 포맷 재확인", file=sys.stderr)
        return 1

    conf_high_pct = (out["prior_patent_conf"] == "HIGH").mean()
    print(
        f"[prior_patent_count] output {len(out):,} rows · "
        f"p50_avg={out['prior_patent_count'].median():.0f} · "
        f"conf_HIGH={conf_high_pct:.1%}",
        file=sys.stderr,
    )

    out_path = BUILD_DIR / "prior_patent_count.csv"
    out.to_csv(out_path, index=False)
    print(f"[prior_patent_count] wrote {out_path}", file=sys.stderr)
    print(
        "[prior_patent_count] 다음: python -m patentpilot_etl.load_imp_com",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
