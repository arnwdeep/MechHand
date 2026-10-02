"""Time helpers.

"Today" is always India time. The shop, the rates, and every customer are in
IST; deriving the date from a UTC server clock would make the day's rate expire
5.5 hours early and blank out the storefront each evening.
"""

from __future__ import annotations

from datetime import date, datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")


def now_ist() -> datetime:
    return datetime.now(IST)


def today_ist() -> date:
    return now_ist().date()
