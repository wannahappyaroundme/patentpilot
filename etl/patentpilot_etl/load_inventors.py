"""06_load_inventors: patents.csv → 출원번호별 발명자 추출 → Supabase UPDATE.

전제: 마이그레이션 20260517000002로 patents.inventor 컬럼이 추가되어 있어야 함.
방법: 임시 테이블에 COPY 후 UPDATE FROM JOIN (가장 빠름, 104,582 활성 행 약 5초).
"""
import io
import pandas as pd
import psycopg2

from .config import SOURCE_DATA_DIR, BUILD_DIR, SUPABASE_DB_URL


def _strip_excel(s):
    if not isinstance(s, str):
        return s
    return s.strip().strip("=").strip('"')


def main():
    if not SUPABASE_DB_URL:
        raise RuntimeError("SUPABASE_DB_URL not set")

    pool_path = BUILD_DIR / "patents_final.csv"
    src_path = SOURCE_DATA_DIR / "patents.csv"

    print(f"reading pool keys from {pool_path}")
    pool = pd.read_csv(pool_path, dtype=str, keep_default_na=False, usecols=["application_number"])
    pool_keys = set(pool["application_number"].tolist())
    print(f"pool rows: {len(pool_keys):,}")

    print(f"streaming inventors from {src_path}")
    rows = []
    for chunk in pd.read_csv(
        src_path,
        dtype=str,
        encoding="utf-8-sig",
        keep_default_na=False,
        chunksize=200_000,
        usecols=["patApplicationNumber", "patInventor"],
    ):
        chunk["application_number"] = chunk["patApplicationNumber"].map(_strip_excel)
        chunk["inventor"] = chunk["patInventor"].fillna("").map(_strip_excel)
        chunk = chunk[chunk["application_number"].isin(pool_keys)]
        if not chunk.empty:
            rows.append(chunk[["application_number", "inventor"]])

    df = (
        pd.concat(rows, ignore_index=True)
        if rows
        else pd.DataFrame({"application_number": [], "inventor": []})
    )
    df = df.drop_duplicates(subset=["application_number"], keep="last")
    print(f"matched inventors: {len(df):,}")

    print("connecting to Supabase...")
    conn = psycopg2.connect(SUPABASE_DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    print("creating temp table...")
    cur.execute(
        """
        create temp table tmp_inventors (
          application_number text primary key,
          inventor text not null default ''
        ) on commit drop;
        """
    )

    print("uploading via COPY...")
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False)
    buf.seek(0)
    cur.copy_expert(
        "copy tmp_inventors (application_number, inventor) from stdin with (format csv)",
        buf,
    )
    cur.execute("select count(*) from tmp_inventors")
    print(f"tmp rows: {cur.fetchone()[0]:,}")

    print("UPDATE patents.inventor from tmp...")
    cur.execute(
        """
        update public.patents p
           set inventor = t.inventor
          from tmp_inventors t
         where t.application_number = p.application_number
        """
    )
    conn.commit()

    cur.execute("select count(*) from public.patents where inventor <> ''")
    print(f"patents with inventor: {cur.fetchone()[0]:,}")

    cur.close()
    conn.close()
    print("done.")


if __name__ == "__main__":
    main()
