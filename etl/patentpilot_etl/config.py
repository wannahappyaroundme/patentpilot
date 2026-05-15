"""ETL configuration and paths."""
from pathlib import Path
from dotenv import load_dotenv
import os

ETL_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ETL_DIR.parent

# 입력: 사용자가 가지고 있는 KIPRIS CSV 데이터 폴더
SOURCE_DATA_DIR = Path("/Users/kyungsbook/Desktop/Tree0/Data")

# 출력: ETL 중간/최종 산출물
BUILD_DIR = ETL_DIR / "build"
BUILD_DIR.mkdir(exist_ok=True)

# .env.local에서 Supabase 연결 정보 로드
load_dotenv(REPO_ROOT / ".env.local")
SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL", "")

# 매물 풀 정의 — spec 4.1 참조
URGENCY_RED_YEARS = (2006, 2011)      # 출원 15~20년차
URGENCY_YELLOW_YEARS = (2012, 2017)   # 출원 8~14년차
URGENCY_GREEN_YEARS = (2018, 2022)    # 출원 4~7년차
CURRENT_YEAR = 2026
