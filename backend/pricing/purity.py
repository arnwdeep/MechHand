"""Purity fineness, and deriving per-purity rates from one pure-metal rate.

Pure like the rest of this package: no DB, no network, no clock.

The pricing engine still prices from an explicit rate row for a product's exact
(metal, purity) — that rule has not changed. This module is a *data-entry* aid.
The owner enters one pure-metal rate ("100 touch"), sees the derived 22K / 18K /
14K numbers, adjusts any that the trade quotes differently, and saves them as
ordinary rate rows.

Deriving when the rate is SET rather than when a price is COMPUTED matters:
every price still traces back to a rate row a person approved, the append-only
history records what was actually charged, and a change to these ratios can
never retroactively move the price of a past sale.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .rounding import to_paise_precision
from .types import InvalidProductError, to_decimal

__all__ = [
    "UnknownPurityError",
    "DerivedRate",
    "fineness",
    "derive_rate",
    "derive_rates",
    "known_purities",
    "PURE_PURITY",
]


class UnknownPurityError(InvalidProductError):
    """No standard fineness for this (metal, purity) — the owner must type a rate."""


#: Karat out of 24. 24K is "pure" / 100 touch.
GOLD_KARATS: dict[str, int] = {
    "24K": 24,
    "23K": 23,
    "22K": 22,
    "21K": 21,
    "20K": 20,
    "18K": 18,
    "14K": 14,
    "10K": 10,
    "9K": 9,
}

#: Millesimal fineness out of 1000. 999 is fine silver.
SILVER_MILLESIMAL: dict[str, int] = {
    "999": 999,
    "958": 958,
    "925": 925,
    "900": 900,
    "800": 800,
}

#: What "pure" means per metal — the purity the owner's base rate refers to.
PURE_PURITY: dict[str, str] = {"gold": "24K", "silver": "999"}


def _norm(metal: str, purity: str) -> tuple[str, str]:
    return metal.strip().lower(), purity.strip().upper()


def known_purities(metal: str) -> list[str]:
    """Standard purities for a metal, richest first."""
    m = metal.strip().lower()
    if m == "gold":
        return sorted(GOLD_KARATS, key=lambda p: -GOLD_KARATS[p])
    if m == "silver":
        return sorted(SILVER_MILLESIMAL, key=lambda p: -SILVER_MILLESIMAL[p])
    return []


def fineness(metal: str, purity: str) -> Decimal | None:
    """Fraction of pure metal in this purity, or None if it isn't a standard one.

    18K gold is 18/24 = 0.75. Sterling silver (925) is 925/1000 = 0.925.
    """
    m, p = _norm(metal, purity)
    if m == "gold" and p in GOLD_KARATS:
        return Decimal(GOLD_KARATS[p]) / Decimal(24)
    if m == "silver" and p in SILVER_MILLESIMAL:
        return Decimal(SILVER_MILLESIMAL[p]) / Decimal(1000)
    return None


@dataclass(frozen=True)
class DerivedRate:
    """One suggested rate. Not saved until the owner confirms it."""

    metal: str
    purity: str
    fineness: Decimal
    rate_per_gram: Decimal
    #: True when the owner supplied the ratio instead of the standard one.
    overridden: bool = False


def derive_rate(
    pure_rate_per_gram: Decimal | int | float | str,
    metal: str,
    purity: str,
    *,
    fineness_override: Decimal | int | float | str | None = None,
) -> DerivedRate:
    """Work one purity's rate out of the pure-metal rate.

    The trade does not always sell at the exact metallurgical ratio, so
    ``fineness_override`` exists — but the standard ratio is the default, and
    whatever is used ends up visible on the saved rate row either way.
    """
    m, p = _norm(metal, purity)
    pure_rate = to_decimal(pure_rate_per_gram, "pure_rate_per_gram")
    if pure_rate <= 0:
        raise InvalidProductError(
            f"pure_rate_per_gram must be greater than 0, got {pure_rate}"
        )

    if fineness_override is not None:
        ratio = to_decimal(fineness_override, "fineness_override")
        if ratio <= 0 or ratio > 1:
            raise InvalidProductError(
                f"fineness must be between 0 and 1, got {ratio}"
            )
        overridden = True
    else:
        standard = fineness(m, p)
        if standard is None:
            raise UnknownPurityError(
                f"No standard fineness for {metal} {purity}. "
                "Enter this purity's rate directly instead."
            )
        ratio = standard
        overridden = False

    return DerivedRate(
        metal=m,
        purity=p,
        fineness=ratio,
        rate_per_gram=to_paise_precision(pure_rate * ratio),
        overridden=overridden,
    )


def derive_rates(
    pure_rate_per_gram: Decimal | int | float | str,
    metal: str,
    purities: list[str] | None = None,
) -> list[DerivedRate]:
    """Derive every standard purity for a metal, richest first."""
    targets = purities if purities is not None else known_purities(metal)
    return [derive_rate(pure_rate_per_gram, metal, purity) for purity in targets]

