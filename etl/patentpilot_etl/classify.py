"""대학(UNIV)/정출연(GRI)/기타(OTHER) 분류 룰."""

GRI_KEYWORDS = (
    "연구원", "연구소", "연구재단", "연구개발원", "과학기술원", "기술원",
    "진흥원", "연구회", "연구센터",
    "KIST", "KAIST", "POSTECH", "GIST", "UNIST", "DGIST",
    "ETRI", "KRIBB", "KARI", "KASI", "KAERI", "KIER",
    "KIMM", "KIGAM", "KIOM", "KISTI", "KIRAMS", "KISTEP",
    "KFRI", "KIOST", "KOPRI", "KICT", "KITECH", "KRRI", "NFRI",
    "한국과학기술연구원", "한국과학기술원", "한국과학기술정보연구원",
    "한국전자통신연구원", "한국에너지기술연구원", "한국기계연구원",
    "한국지질자원연구원", "한국한의학연구원", "한국항공우주연구원",
    "한국원자력연구원", "한국화학연구원", "한국식품연구원",
    "한국생명공학연구원", "한국천문연구원", "한국건설기술연구원",
    "한국철도기술연구원", "국립암센터", "한국전기연구원",
    "한국표준과학연구원", "한국재료연구원", "한국해양과학기술원",
    "한국극지연구소", "국방과학연구소",
    "농촌진흥청", "국립농업과학원", "국립수산과학원",
    "국립산림과학원", "국립식량과학원",
)

UNIV_KEYWORDS = (
    "대학교", "학교법인", "산학협력단", "대학산학", "산학",
    "university", "UNIV", "학원", "학교",
)


def classify_org(applicant: str, university_name: str) -> str:
    """출원인/기관명 텍스트로부터 UNIV/GRI/OTHER 분류.

    GRI 키워드가 하나라도 매치되면 GRI(정출연/특수연구기관),
    그 다음 UNIV 키워드 매치 시 UNIV(대학),
    아니면 OTHER.
    """
    text = (applicant or "") + " " + (university_name or "")
    for kw in GRI_KEYWORDS:
        if kw in text:
            return "GRI"
    for kw in UNIV_KEYWORDS:
        if kw in text:
            return "UNIV"
    return "OTHER"
