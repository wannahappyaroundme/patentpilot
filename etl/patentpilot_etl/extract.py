"""01_extract_patents_pool: patents.csv → 매물 풀."""
from typing import Union, IO
import pandas as pd

from .classify import classify_org
from .urgency import urgency_tag, remaining_years

ACCEPTED_DISPOSALS = {
    "등록결정(일반)",
    "등록결정(재심사후)",
    "등록결정(심사전치후)",
    "등록결정(취소환송후)",
}

REJECTED_STATUSES = {
    "연차료미납",
    "포기(등록료 미납)",
    "특허거절결정",
    "특허취하",
    "심사미청구취하",
}


def _strip_excel(s):
    if not isinstance(s, str):
        return s
    return s.strip().strip("=").strip('"')


def extract_pool(source: Union[str, IO[str]]) -> pd.DataFrame:
    """patents.csv를 받아 매물 풀 DataFrame 반환."""
    df = pd.read_csv(
        source,
        dtype=str,
        encoding="utf-8-sig",
        keep_default_na=False,
    )

    for col in [
        "patApplicationNumber",
        "patApplicationDate",
        "patRegistrationDate",
        "patExpirationDate",
    ]:
        if col in df.columns:
            df[col] = df[col].map(_strip_excel)

    df["patFinalDisposal"] = df.get("patFinalDisposal", "").fillna("")
    df["patLegalStatus"] = df.get("patLegalStatus", "").fillna("")

    mask_disposal = df["patFinalDisposal"].isin(ACCEPTED_DISPOSALS)
    mask_status = ~df["patLegalStatus"].isin(REJECTED_STATUSES)
    df = df[mask_disposal & mask_status].copy()

    df["org_type"] = df.apply(
        lambda r: classify_org(
            r.get("patApplicant", ""), r.get("patUniversityName", "")
        ),
        axis=1,
    )
    df["urgency"] = df["patApplicationDate"].map(urgency_tag)
    df = df[df["urgency"].isin(["RED", "YELLOW", "GREEN"])].copy()
    df["remaining_years"] = df["patExpirationDate"].map(remaining_years)

    out = pd.DataFrame(
        {
            "application_number": df["patApplicationNumber"],
            "title": df.get("patTitle", "").fillna(""),
            "applicant": df.get("patApplicant", "").fillna(""),
            "university_name": df.get("patUniversityName", "").fillna(""),
            "org_type": df["org_type"],
            "application_date": df["patApplicationDate"],
            "registration_date": df.get("patRegistrationDate", "").fillna(""),
            "expiration_date": df.get("patExpirationDate", "").fillna(""),
            "ipc_primary": df.get("patIpcNumber", "")
            .fillna("")
            .map(lambda s: s.split("|")[0].strip() if s else ""),
            "ipc_all": df.get("patIpcNumber", "").fillna(""),
            "claims_count": pd.to_numeric(
                df.get("patClaimsCount", "0"), errors="coerce"
            )
            .fillna(0)
            .astype(int),
            "family_count": pd.to_numeric(
                df.get("patFamilyCount", "0"), errors="coerce"
            )
            .fillna(0)
            .astype(int),
            "citation_count": pd.to_numeric(
                df.get("patCitationCount", "0"), errors="coerce"
            )
            .fillna(0)
            .astype(int),
            "transfer_count": pd.to_numeric(
                df.get("patTransferCount", "0"), errors="coerce"
            )
            .fillna(0)
            .astype(int),
            "legal_status": df["patLegalStatus"],
            "final_disposal": df["patFinalDisposal"],
            "rnd_department": df.get("patRndDepartment", "").fillna(""),
            "kipris_link": df.get("patKiprisLink", "").fillna(""),
            "urgency": df["urgency"],
            "remaining_years": df["remaining_years"],
        }
    )
    return out


def main():
    from .config import SOURCE_DATA_DIR, BUILD_DIR

    src = SOURCE_DATA_DIR / "patents.csv"
    dst = BUILD_DIR / "patents_pool.csv"
    print(f"reading {src} ...")
    df = extract_pool(src)
    print(f"pool size: {len(df):,}")
    print(df["urgency"].value_counts().to_string())
    print(df["org_type"].value_counts().to_string())
    df.to_csv(dst, index=False, encoding="utf-8")
    print(f"wrote {dst}")


if __name__ == "__main__":
    main()
