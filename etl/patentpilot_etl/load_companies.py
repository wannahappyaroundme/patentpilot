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

    cur.execute(
        "truncate table public.ipc_company, public.companies restart identity cascade"
    )

    for _, r in companies.iterrows():
        cur.execute(
            """insert into public.companies (name, industry, description, revenue_band, website)
               values (%s, %s, %s, %s, %s) returning id""",
            (
                r["name"],
                r["industry"],
                r["description"],
                r["revenue_band"],
                r["website"],
            ),
        )

    cur.execute("select id, name from public.companies")
    name_to_id = {n: i for i, n in cur.fetchall()}

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
