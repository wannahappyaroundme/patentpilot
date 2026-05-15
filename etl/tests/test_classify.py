from patentpilot_etl.classify import classify_org


def test_classify_etri_as_gri():
    assert classify_org("한국전자통신연구원", "한국전자통신연구원") == "GRI"


def test_classify_kaist_as_gri():
    assert classify_org("한국과학기술원", "한국과학기술원") == "GRI"


def test_classify_yonsei_as_univ():
    assert classify_org("연세대학교 산학협력단", "연세대학교") == "UNIV"


def test_classify_seoul_national_university_as_univ():
    assert classify_org("서울대학교산학협력단", "서울대학교") == "UNIV"


def test_classify_unknown_as_other():
    assert classify_org("삼성전자 주식회사", "") == "OTHER"


def test_classify_empty_inputs():
    assert classify_org("", "") == "OTHER"


def test_classify_dgist_as_gri():
    assert (
        classify_org("재단법인대구경북과학기술원", "재단법인대구경북과학기술원")
        == "GRI"
    )
