"""Request/response shapes for the backend <-> frontend contract.

Money crosses the wire as a JSON number because the frontend contract says
``total: number|null`` and the frontend only ever *displays* it. Every
calculation and everything durable (snapshots, orders, invoices) stays Decimal
or string. Nothing on the frontend recomputes a price.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from pricing import PriceResult


class BreakupLineOut(BaseModel):
    label: str
    amount: float


class PriceResultOut(BaseModel):
    """Matches the PriceResult shape in the frontend spec."""

    total: float | None
    currency: str = "INR"
    breakup: list[BreakupLineOut] = Field(default_factory=list)
    rate_available: bool
    #: Additive to the contract — lets the PDP show "at today's 18K rate".
    rate_per_gram: float | None = None

    @classmethod
    def from_result(cls, result: PriceResult) -> PriceResultOut:
        return cls(
            total=float(result.total) if result.total is not None else None,
            currency=result.currency,
            breakup=[
                BreakupLineOut(label=line.label, amount=float(line.amount))
                for line in result.breakup
            ],
            rate_available=result.rate_available,
            rate_per_gram=float(result.rate_per_gram) if result.rate_per_gram else None,
        )


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    type: str
    metal: str
    purity: str
    net_weight_grams: float
    gross_weight_grams: float
    category: str | None = None
    occasion: list[str] = Field(default_factory=list)
    images: list[dict] = Field(default_factory=list)
    videos: list[dict] = Field(default_factory=list)
    description: str | None = None
    in_stock: bool
    quantity: int
    #: null when today's rate is missing — storefront hides price, disables buy.
    price: PriceResultOut | None = None
    is_buyable: bool = True


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    #: True when at least one listed product has no rate today. The storefront
    #: uses this to show the "prices updating" state instead of blank cards.
    has_unpriced_items: bool = False


class RateIn(BaseModel):
    metal: str
    purity: str
    rate_per_gram: Decimal = Field(gt=0, description="INR per gram for this exact purity")
    effective_date: date | None = None

    @field_validator("metal")
    @classmethod
    def _normalize_metal(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("metal is required")
        return normalized

    @field_validator("purity")
    @classmethod
    def _normalize_purity(cls, value: str) -> str:
        normalized = value.strip().upper()
        if not normalized:
            raise ValueError("purity is required")
        return normalized


class RateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    metal: str
    purity: str
    rate_per_gram: float
    effective_date: date
    created_at: datetime


class PuritySummaryOut(BaseModel):
    """One (metal, purity) line for the owner's rate screen.

    Answers "which pieces does this rate move?" — the count is of live products
    carrying that exact purity.
    """

    metal: str
    purity: str
    rate_per_gram: float | None
    product_count: int
    #: Fraction of pure metal, e.g. 0.75 for 18K. None for a non-standard purity.
    fineness: float | None = None


class RatesTodayOut(BaseModel):
    """What the frontend polls to detect the no-rate state."""

    date: date
    rates: list[RateOut]
    #: (metal, purity) pairs that products exist for but today has no rate for.
    #: Drives the loud admin warning.
    missing: list[dict[str, str]] = Field(default_factory=list)
    all_rates_set: bool
    #: Every purity that either has products or has a rate today.
    purities: list[PuritySummaryOut] = Field(default_factory=list)


class DerivedRateOut(BaseModel):
    """A suggested rate. Nothing is saved until the owner confirms it."""

    metal: str
    purity: str
    fineness: float
    rate_per_gram: float
    product_count: int = 0


class DeriveRatesOut(BaseModel):
    metal: str
    pure_purity: str
    pure_rate_per_gram: float
    derived: list[DerivedRateOut]


class BulkRatesIn(BaseModel):
    """Save several per-purity rates at once, after the owner has reviewed them."""

    rates: list[RateIn] = Field(min_length=1, max_length=40)
