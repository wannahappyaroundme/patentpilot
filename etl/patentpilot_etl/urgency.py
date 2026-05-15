"""매물 긴급도 태그 + 권리잔여년 계산."""
from datetime import date
from typing import Optional

from .config import (
    URGENCY_RED_YEARS,
    URGENCY_YELLOW_YEARS,
    URGENCY_GREEN_YEARS,
    CURRENT_YEAR,
)


def _parse_year(s: Optional[str]) -> Optional[int]:
    if not s or not isinstance(s, str):
        return None
    s = s.strip().strip("=").strip('"')
    if len(s) < 4 or not s[:4].isdigit():
        return None
    return int(s[:4])


def urgency_tag(application_date: Optional[str]) -> Optional[str]:
    """출원일 문자열(YYYY-MM-DD)로부터 RED/YELLOW/GREEN/None."""
    year = _parse_year(application_date)
    if year is None:
        return None
    if URGENCY_RED_YEARS[0] <= year <= URGENCY_RED_YEARS[1]:
        return "RED"
    if URGENCY_YELLOW_YEARS[0] <= year <= URGENCY_YELLOW_YEARS[1]:
        return "YELLOW"
    if URGENCY_GREEN_YEARS[0] <= year <= URGENCY_GREEN_YEARS[1]:
        return "GREEN"
    return None


def remaining_years(expiration_date: Optional[str]) -> Optional[int]:
    """만료일로부터 2026-05-16 기준 잔여년(정수). 이미 만료면 0, 누락이면 None."""
    year = _parse_year(expiration_date)
    if year is None:
        return None
    today = date(CURRENT_YEAR, 5, 16)
    diff = year - today.year
    return max(0, diff)
