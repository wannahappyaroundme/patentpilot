import io
from patentpilot_etl.extract import extract_pool

SAMPLE_CSV = '''patApplicationNumber,patTitle,patApplicant,patUniversityName,patApplicationDate,patRegistrationDate,patExpirationDate,patIpcNumber,patClaimsCount,patFamilyCount,patCitationCount,patTransferCount,patLegalStatus,patFinalDisposal,patRndDepartment,patKiprisLink
="10-2008-0001",발열저감 배터리,연세대학교 산학협력단,연세대학교,="2008-01-15",="2010-03-20",,B60L,12,3,8,0,연차료납부,등록결정(일반),산업통상자원부,http://kpat.kipris.or.kr/?app=10-2008-0001
="10-2014-0002",반도체 공정,한국전자통신연구원,한국전자통신연구원,="2014-04-10",="2016-08-22",,H01L,10,2,5,0,연차료납부,등록결정(일반),,http://kpat.kipris.or.kr/?app=10-2014-0002
="10-2024-0003",최신 출원,삼성전자,,="2024-09-01",,,H04L,8,1,0,0,출원공개,,,http://kpat.kipris.or.kr/?app=10-2024-0003
="10-2010-0004",거절된 출원,고려대학교 산학협력단,고려대학교,="2010-05-12",,,A61K,5,0,0,0,특허거절결정,거절결정(일반),,http://kpat.kipris.or.kr/?app=10-2010-0004
="10-2009-0005",연차료 미납,한국화학연구원,한국화학연구원,="2009-11-30",="2011-07-15",,C07C,15,4,12,1,연차료미납,등록결정(일반),,http://kpat.kipris.or.kr/?app=10-2009-0005
'''


def test_extract_pool_filters_disposal():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    nums = set(df["application_number"].tolist())
    assert "10-2008-0001" in nums
    assert "10-2014-0002" in nums
    assert "10-2024-0003" not in nums
    assert "10-2010-0004" not in nums
    assert "10-2009-0005" not in nums


def test_extract_pool_adds_org_type():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    rec = df[df["application_number"] == "10-2008-0001"].iloc[0]
    assert rec["org_type"] == "UNIV"
    rec = df[df["application_number"] == "10-2014-0002"].iloc[0]
    assert rec["org_type"] == "GRI"


def test_extract_pool_adds_urgency():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    rec = df[df["application_number"] == "10-2008-0001"].iloc[0]
    assert rec["urgency"] == "RED"
    rec = df[df["application_number"] == "10-2014-0002"].iloc[0]
    assert rec["urgency"] == "YELLOW"


def test_extract_pool_strips_excel_prefix():
    df = extract_pool(io.StringIO(SAMPLE_CSV))
    nums = df["application_number"].tolist()
    assert all(not n.startswith("=") and not n.startswith('"') for n in nums)
