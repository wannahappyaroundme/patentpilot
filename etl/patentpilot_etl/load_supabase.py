"""04_load_to_supabase: patents_final.csv → Supabase patents 테이블.

추가 정규화:
- ipc_primary: 원본 patIpcNumber가 `;` 구분이라 첫 IPC만 추출.
- kipris_link: 원본이 javascript: 코드 형태라 표준 deeplink로 대체.
"""
import io
import re
import pandas as pd
import psycopg2
from psycopg2 import sql

from .config import BUILD_DIR, SUPABASE_DB_URL


def _normalize_date(s):
    if not s or s == "" or pd.isna(s):
        return None
    s = str(s).strip()
    return s if len(s) >= 10 else None


def _normalize_ipc(s):
    if not s or pd.isna(s):
        return ""
    parts = re.split(r"[;|]", str(s))
    return parts[0].strip() if parts else ""


def _kipris_deeplink(app_number):
    """출원번호로부터 표준 KIPRIS deeplink(GET) 생성.

    예: '10-2006-0000081' → 'https://doi.org/10.8080/1020060000081'
    """
    if not app_number or pd.isna(app_number):
        return ""
    digits = re.sub(r"[^0-9]", "", str(app_number))
    if not digits:
        return ""
    return f"https://doi.org/10.8080/{digits}"


def main():
    if not SUPABASE_DB_URL:
        raise RuntimeError("SUPABASE_DB_URL not set in .env.local")

    src = BUILD_DIR / "patents_final.csv"
    df = pd.read_csv(src, dtype=str, keep_default_na=False)
    print(f"loaded {len(df):,} rows from {src}")

    # 정규화
    for col in [
        "application_date",
        "registration_date",
        "expiration_date",
        "latest_status_date",
    ]:
        if col in df.columns:
            df[col] = df[col].map(_normalize_date)

    df["ipc_primary"] = df["ipc_all"].map(_normalize_ipc)
    df["kipris_link"] = df["application_number"].map(_kipris_deeplink)

    for col in [
        "claims_count",
        "family_count",
        "citation_count",
        "transfer_count",
        "transfer_events",
        "remaining_years",
    ]:
        if col in df.columns:
            df[col] = (
                pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)
            )

    cols = [
        "application_number",
        "title",
        "applicant",
        "university_name",
        "org_type",
        "application_date",
        "registration_date",
        "expiration_date",
        "ipc_primary",
        "ipc_all",
        "claims_count",
        "family_count",
        "citation_count",
        "transfer_count",
        "transfer_events",
        "legal_status",
        "final_disposal",
        "latest_status",
        "latest_status_date",
        "rnd_department",
        "kipris_link",
        "urgency",
        "remaining_years",
    ]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    df = df[cols]

    print("connecting to Supabase...")
    conn = psycopg2.connect(SUPABASE_DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    print("truncating patents (CASCADE applications)...")
    cur.execute("truncate table public.patents cascade")

    print("uploading via COPY...")
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False, na_rep="\\N")
    buf.seek(0)
    cur.copy_expert(
        sql.SQL(
            "copy public.patents ({cols}) from stdin with (format csv, null '\\N')"
        ).format(
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
