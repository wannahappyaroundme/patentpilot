from patentpilot_etl.urgency import urgency_tag, remaining_years


def test_urgency_red_for_2008_application():
    assert urgency_tag("2008-03-14") == "RED"


def test_urgency_yellow_for_2014_application():
    assert urgency_tag("2014-06-01") == "YELLOW"


def test_urgency_green_for_2020_application():
    assert urgency_tag("2020-01-01") == "GREEN"


def test_urgency_none_for_2005_application():
    assert urgency_tag("2005-12-31") is None


def test_urgency_none_for_2024_application():
    assert urgency_tag("2024-08-15") is None


def test_urgency_none_for_invalid_date():
    assert urgency_tag("") is None
    assert urgency_tag("not-a-date") is None
    assert urgency_tag(None) is None


def test_remaining_years_basic():
    years = remaining_years("2030-01-01")
    assert years is not None
    assert 3 <= years <= 4


def test_remaining_years_already_expired():
    assert remaining_years("2020-01-01") == 0


def test_remaining_years_missing():
    assert remaining_years("") is None
    assert remaining_years(None) is None
