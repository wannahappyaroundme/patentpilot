"""03_merge_transfers: 출원번호별 transfer event 카운트 join."""
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

    print("reading transfers (156MB, chunked)...")
    rows = []
    for chunk in pd.read_csv(
        tr_path,
        dtype=str,
        encoding="utf-8-sig",
        keep_default_na=False,
        chunksize=300_000,
    ):
        first_col = chunk.columns[0]
        chunk = chunk.rename(columns={first_col: "application_number"})
        chunk["application_number"] = chunk["application_number"].map(
            _strip_excel
        )
        chunk = chunk[chunk["application_number"].isin(pool_keys)]
        if not chunk.empty:
            rows.append(chunk[["application_number"]])

    tr_df = (
        pd.concat(rows, ignore_index=True)
        if rows
        else pd.DataFrame({"application_number": []})
    )
    counts = (
        tr_df.groupby("application_number")
        .size()
        .rename("transfer_events")
        .reset_index()
    )
    print(f"applications with transfer events: {len(counts):,}")

    merged = pool.merge(counts, on="application_number", how="left")
    merged["transfer_events"] = (
        merged["transfer_events"].fillna(0).astype(int)
    )
    merged.to_csv(out_path, index=False, encoding="utf-8")
    print(f"wrote {out_path} ({len(merged):,} rows)")


if __name__ == "__main__":
    main()
