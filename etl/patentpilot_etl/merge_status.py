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

    print("reading legalStatus (1.8GB, chunked)...")
    pool_keys = set(pool["application_number"].tolist())
    rows = []
    for chunk in pd.read_csv(
        status_path,
        dtype=str,
        encoding="utf-8-sig",
        keep_default_na=False,
        chunksize=300_000,
    ):
        chunk["lsApplicationNumber"] = chunk["lsApplicationNumber"].map(
            _strip_excel
        )
        chunk["lsStatusDate"] = chunk["lsStatusDate"].map(_strip_excel)
        chunk = chunk[chunk["lsApplicationNumber"].isin(pool_keys)]
        if not chunk.empty:
            rows.append(
                chunk[["lsApplicationNumber", "lsStatusName", "lsStatusDate"]]
            )

    status_df = (
        pd.concat(rows, ignore_index=True)
        if rows
        else pd.DataFrame(
            {"lsApplicationNumber": [], "lsStatusName": [], "lsStatusDate": []}
        )
    )
    print(f"matched status rows: {len(status_df):,}")

    status_df = status_df.sort_values(["lsApplicationNumber", "lsStatusDate"])
    latest = status_df.groupby("lsApplicationNumber").tail(1)
    latest = latest.rename(
        columns={
            "lsApplicationNumber": "application_number",
            "lsStatusName": "latest_status",
            "lsStatusDate": "latest_status_date",
        }
    )

    merged = pool.merge(latest, on="application_number", how="left")
    merged.to_csv(out_path, index=False, encoding="utf-8")
    print(f"wrote {out_path} ({len(merged):,} rows)")


if __name__ == "__main__":
    main()
