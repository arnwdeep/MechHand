"""Rate endpoints.

One screen sets the day's gold/silver rates and the whole catalogue re-prices,
because no price is ever stored.

Rates are still stored and read per purity. The derive endpoints below are a
data-entry convenience: they turn one pure-metal rate into suggested per-purity
rates that the owner reviews and saves as ordinary rows. Nothing is derived at
pricing time.
"""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from api.deps import get_session, require_admin
from api.schemas import (
    BulkRatesIn,
    DerivedRateOut,
    DeriveRatesOut,
    PuritySummaryOut,
    RateIn,
    RateOut,
    RatesTodayOut,
)
from core.time import today_ist
from models import Product
from pricing.purity import (
    PURE_PURITY,
    UnknownPurityError,
    derive_rates,
    fineness,
    known_purities,
)
from pricing.types import InvalidProductError
from services import rates as rates_service

router = APIRouter(tags=["rates"])


def _product_counts(session: Session) -> dict[tuple[str, str], int]:
    """How many live pieces sit behind each (metal, purity)."""
    rows = session.execute(
        select(Product.metal, Product.purity, func.count())
        .where(Product.in_stock.is_(True))
        .group_by(Product.metal, Product.purity)
    ).all()
    return {(metal, purity): count for metal, purity, count in rows}


def _purity_summary(session: Session, on_date: date) -> list[PuritySummaryOut]:
    counts = _product_counts(session)
    rates = {
        (row.metal, row.purity): row
        for row in rates_service.get_rates_for_date(session, on_date)
    }

    summary = []
    for key in sorted(set(counts) | set(rates)):
        metal, purity = key
        rate = rates.get(key)
        ratio = fineness(metal, purity)
        summary.append(
            PuritySummaryOut(
                metal=metal,
                purity=purity,
                rate_per_gram=float(rate.rate_per_gram) if rate else None,
                product_count=counts.get(key, 0),
                fineness=float(ratio) if ratio is not None else None,
            )
        )
    return summary


@router.get("/rates/today", response_model=RatesTodayOut)
def get_rates_today(
    on_date: date | None = Query(default=None, alias="date"),
    session: Session = Depends(get_session),
) -> RatesTodayOut:
    """Current rates. The frontend uses this to detect the no-rate state."""
    target = on_date or today_ist()
    rows = rates_service.get_rates_for_date(session, target)
    purities = _purity_summary(session, target)

    # Missing = a purity that live products need but today has no rate for.
    missing = [
        {"metal": p.metal, "purity": p.purity}
        for p in purities
        if p.rate_per_gram is None and p.product_count > 0
    ]

    return RatesTodayOut(
        date=target,
        rates=[RateOut.model_validate(row) for row in rows],
        missing=missing,
        all_rates_set=not missing,
        purities=purities,
    )


@router.get(
    "/admin/rates/derive",
    response_model=DeriveRatesOut,
    dependencies=[Depends(require_admin)],
)
def preview_derived_rates(
    pure_rate_per_gram: float = Query(gt=0, description="Rate for pure metal (100 touch)"),
    metal: str = Query(default="gold"),
    session: Session = Depends(get_session),
) -> DeriveRatesOut:
    """Suggest per-purity rates from one pure-metal rate. Saves nothing.

    Computed server-side on purpose: the frontend never does money arithmetic,
    not even for a preview the owner is about to confirm.
    """
    metal = metal.strip().lower()
    if metal not in PURE_PURITY:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No standard purity table for '{metal}'.",
        )

    counts = _product_counts(session)
    try:
        derived = derive_rates(str(pure_rate_per_gram), metal)
    except (UnknownPurityError, InvalidProductError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    return DeriveRatesOut(
        metal=metal,
        pure_purity=PURE_PURITY[metal],
        pure_rate_per_gram=pure_rate_per_gram,
        derived=[
            DerivedRateOut(
                metal=d.metal,
                purity=d.purity,
                fineness=float(d.fineness),
                rate_per_gram=float(d.rate_per_gram),
                product_count=counts.get((d.metal, d.purity), 0),
            )
            for d in derived
        ],
    )


@router.post(
    "/admin/rates",
    response_model=RateOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def set_rate(payload: RateIn, session: Session = Depends(get_session)) -> RateOut:
    """Set the rate for one (metal, purity).

    Always an INSERT — metal_rates is append-only, so setting a corrected rate
    an hour later adds a row and leaves the earlier one provable.
    """
    try:
        rate = rates_service.set_rate(
            session,
            metal=payload.metal,
            purity=payload.purity,
            rate_per_gram=payload.rate_per_gram,
            effective_date=payload.effective_date,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    session.commit()
    return RateOut.model_validate(rate)


@router.post(
    "/admin/rates/bulk",
    response_model=list[RateOut],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def set_rates_bulk(payload: BulkRatesIn, session: Session = Depends(get_session)):
    """Save several per-purity rates in one transaction.

    Used after the owner reviews derived rates. All or nothing: a half-applied
    rate update would leave part of the catalogue priced off yesterday.
    """
    saved = []
    try:
        for entry in payload.rates:
            saved.append(
                rates_service.set_rate(
                    session,
                    metal=entry.metal,
                    purity=entry.purity,
                    rate_per_gram=entry.rate_per_gram,
                    effective_date=entry.effective_date,
                )
            )
    except ValueError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    session.commit()
    return [RateOut.model_validate(row) for row in saved]


@router.get(
    "/admin/rates/history",
    response_model=list[RateOut],
    dependencies=[Depends(require_admin)],
)
def rate_history(
    metal: str,
    purity: str,
    limit: int = Query(default=60, le=365),
    session: Session = Depends(get_session),
) -> list[RateOut]:
    """Every rate ever set for this purity, newest first — the audit trail."""
    rows = rates_service.get_rate_history(session, metal=metal, purity=purity, limit=limit)
    return [RateOut.model_validate(row) for row in rows]


@router.get(
    "/admin/purities",
    response_model=list[str],
    dependencies=[Depends(require_admin)],
)
def list_known_purities(metal: str = Query(default="gold")) -> list[str]:
    """Standard purities for a metal, richest first."""
    return known_purities(metal)
