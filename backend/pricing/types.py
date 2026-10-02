"""Value types for the pricing engine.

Everything the engine needs is declared here as plain dataclasses, so the
engine never imports SQLAlchemy, FastAPI, Redis, or anything that touches the
network. The API layer adapts DB rows into these shapes and back.

All money and all weights are ``Decimal``. Never float — ``0.1 + 0.2 != 0.3``,
and this module decides what customers are charged.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation

from .rounding import Rounding

__all__ = [
    "InvalidProductError",
    "PricingConfig",
    "PricingProduct",
    "RateTable",
    "BreakupLine",
    "PriceResult",
    "DEFAULT_CONFIG",
    "to_decimal",
]


class InvalidProductError(ValueError):
    """Product data that cannot be priced at all (bad weights, missing metal).

    Distinct from "no rate today", which is a normal, expected state and comes
    back as ``PriceResult(rate_available=False)`` rather than an exception.
    """


def to_decimal(value: Decimal | int | float | str, field_name: str) -> Decimal:
    """Coerce a number to Decimal without inheriting binary-float error.

    Floats are accepted (JSON bodies produce them) but routed through ``str``:
    ``Decimal(0.1)`` is 0.1000000000000000055511151231257827, while
    ``Decimal(str(0.1))`` is exactly 0.1.
    """
    if isinstance(value, Decimal):
        candidate = value
    elif isinstance(value, bool):  # bool is an int subclass; never a valid amount
        raise InvalidProductError(f"{field_name} must be a number, got bool")
    elif isinstance(value, int):
        candidate = Decimal(value)
    elif isinstance(value, (float, str)):
        try:
            candidate = Decimal(str(value))
        except InvalidOperation:
            raise InvalidProductError(f"{field_name} is not a valid number: {value!r}") from None
    else:
        raise InvalidProductError(f"{field_name} must be a number, got {type(value).__name__}")

    if not candidate.is_finite():
        raise InvalidProductError(f"{field_name} must be finite, got {value!r}")
    return candidate


def _normalize_metal(metal: str) -> str:
    return metal.strip().lower()


def _normalize_purity(purity: str) -> str:
    """Purity keys are compared exactly, so normalize case once, here.

    "18k" and "18K" must hit the same rate row — a silent miss would hide the
    price on a live product.
    """
    return purity.strip().upper()


@dataclass(frozen=True)
class PricingConfig:
    """Tunables the client may change without a code change."""

    gst_rate: Decimal = Decimal("0.03")
    default_making_rate: Decimal = Decimal("1100")
    rounding: Rounding = Rounding.TWO_DECIMALS


DEFAULT_CONFIG = PricingConfig()


@dataclass(frozen=True)
class PricingProduct:
    """The engine's own view of a product — only the fields that affect price.

    Validates on construction, so an instance is always priceable. Callers that
    accept owner input should catch :class:`InvalidProductError` at the edge.
    """

    metal: str
    purity: str
    net_weight_grams: Decimal
    gross_weight_grams: Decimal
    diamond_value: Decimal | None = None
    making_rate: Decimal | None = None

    def __post_init__(self) -> None:
        set_field = object.__setattr__  # frozen dataclass: normalize in place

        metal = _normalize_metal(self.metal or "")
        if not metal:
            raise InvalidProductError("metal is required")
        set_field(self, "metal", metal)

        purity = _normalize_purity(self.purity or "")
        if not purity:
            raise InvalidProductError("purity is required")
        set_field(self, "purity", purity)

        net = to_decimal(self.net_weight_grams, "net_weight_grams")
        gross = to_decimal(self.gross_weight_grams, "gross_weight_grams")
        if net <= 0:
            raise InvalidProductError(f"net_weight_grams must be greater than 0, got {net}")
        if gross <= 0:
            raise InvalidProductError(f"gross_weight_grams must be greater than 0, got {gross}")
        if net > gross:
            # Net is metal only; gross includes stones and findings. Net above
            # gross means the two fields were swapped on entry, which would
            # misprice the piece in both directions.
            raise InvalidProductError(
                f"net_weight_grams ({net}) cannot exceed gross_weight_grams ({gross})"
            )
        set_field(self, "net_weight_grams", net)
        set_field(self, "gross_weight_grams", gross)

        if self.diamond_value is not None:
            diamond_value = to_decimal(self.diamond_value, "diamond_value")
            if diamond_value < 0:
                raise InvalidProductError(f"diamond_value cannot be negative, got {diamond_value}")
            set_field(self, "diamond_value", diamond_value)

        if self.making_rate is not None:
            making_rate = to_decimal(self.making_rate, "making_rate")
            if making_rate < 0:  # 0 is allowed — the owner may waive making charges
                raise InvalidProductError(f"making_rate cannot be negative, got {making_rate}")
            set_field(self, "making_rate", making_rate)


@dataclass(frozen=True)
class RateTable:
    """The day's rates, keyed by (metal, purity).

    Wraps a plain mapping so lookups normalize the same way on both sides.
    Rates are per purity — an 18K rate is set directly, never derived from 24K.
    """

    _rates: dict[tuple[str, str], Decimal] = field(default_factory=dict)

    @classmethod
    def from_mapping(
        cls, rates: Mapping[tuple[str, str], Decimal | int | float | str] | RateTable
    ) -> RateTable:
        if isinstance(rates, RateTable):
            return rates
        normalized: dict[tuple[str, str], Decimal] = {}
        for (metal, purity), rate in rates.items():
            key = (_normalize_metal(metal), _normalize_purity(purity))
            normalized[key] = to_decimal(rate, f"rate[{metal},{purity}]")
        return cls(normalized)

    def get(self, metal: str, purity: str) -> Decimal | None:
        return self._rates.get((_normalize_metal(metal), _normalize_purity(purity)))

    def __len__(self) -> int:
        return len(self._rates)


@dataclass(frozen=True)
class BreakupLine:
    """One visible line of the price breakup shown on the PDP and invoice."""

    label: str
    amount: Decimal


@dataclass(frozen=True)
class PriceResult:
    """The engine's output. Mirrors the API contract's PriceResult shape.

    ``rate_per_gram`` is additive to that contract: the price-lock snapshot
    written on add-to-cart must record the rate the price was built from, and
    this is the only place that already knows it.
    """

    rate_available: bool
    total: Decimal | None
    breakup: tuple[BreakupLine, ...] = ()
    currency: str = "INR"
    rate_per_gram: Decimal | None = None

    @classmethod
    def unavailable(cls) -> PriceResult:
        """No rate set today for this (metal, purity).

        Storefront hides the price and disables buying; admin shows a loud
        warning. Never a stale or zero price.
        """
        return cls(rate_available=False, total=None, breakup=(), rate_per_gram=None)
