"""Reading and writing the day's metal rates.

Writes are inserts only — metal_rates is append-only. Reads take the most
recently inserted row per (metal, purity) *for today in IST*. Yesterday's rate
is deliberately not a fallback: the stale-rate rule says show nothing rather
than a price built on an old rate.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from core.time import today_ist
from models import MetalRate
from pricing import RateTable


def set_rate(
    session: Session,
    *,
    metal: str,
    purity: str,
    rate_per_gram: Decimal,
    effective_date: date | None = None,
) -> MetalRate:
    """Insert a new rate row. Never updates an existing one."""
    if rate_per_gram <= 0:
        raise ValueError(f"rate_per_gram must be greater than 0, got {rate_per_gram}")

    rate = MetalRate(
        metal=metal.strip().lower(),
        purity=purity.strip().upper(),
        rate_per_gram=rate_per_gram,
        effective_date=effective_date or today_ist(),
    )
    session.add(rate)
    session.flush()
    return rate


def get_rates_for_date(session: Session, on_date: date | None = None) -> list[MetalRate]:
    """Latest row per (metal, purity) for the given date. Newest insert wins."""
    on_date = on_date or today_ist()
    rows = session.scalars(
        select(MetalRate)
        .where(MetalRate.effective_date == on_date)
        .order_by(MetalRate.metal, MetalRate.purity, MetalRate.created_at.asc())
    ).all()

    # Later rows overwrite earlier ones for the same key, leaving the newest.
    latest: dict[tuple[str, str], MetalRate] = {}
    for row in rows:
        latest[(row.metal, row.purity)] = row
    return list(latest.values())


def get_rate_table(session: Session, on_date: date | None = None) -> RateTable:
    """Today's rates in the shape the pricing engine expects."""
    return RateTable.from_mapping(
        {(row.metal, row.purity): row.rate_per_gram for row in get_rates_for_date(session, on_date)}
    )


def get_rate_history(
    session: Session, *, metal: str, purity: str, limit: int = 60
) -> list[MetalRate]:
    """Full insert history for one (metal, purity) — the audit trail."""
    return list(
        session.scalars(
            select(MetalRate)
            .where(
                MetalRate.metal == metal.strip().lower(),
                MetalRate.purity == purity.strip().upper(),
            )
            .order_by(MetalRate.created_at.desc())
            .limit(limit)
        ).all()
    )
