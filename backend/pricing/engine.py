"""The pricing engine — pure, isolated, config-driven.

    metal_value   = daily_rate[metal, purity] x net_weight_grams
    diamond_value = per-piece value entered by the owner (0 if none)
    making        = making_rate x gross_weight_grams
    subtotal      = metal_value + diamond_value + making
    gst           = subtotal x 0.03
    total         = subtotal + gst

Gold/silver value uses NET weight; making uses GROSS weight. No wastage.

Rules this module holds to:
  * No DB reads, no network, no clock, no globals. Data in, result out.
  * Intermediate math is never rounded — only the final total is, once.
  * A missing rate is a normal state, not an error (see PriceResult.unavailable).
"""

from __future__ import annotations

from collections.abc import Mapping
from decimal import Decimal

from .rounding import round_amount, to_paise_precision
from .types import (
    DEFAULT_CONFIG,
    BreakupLine,
    PriceResult,
    PricingConfig,
    PricingProduct,
    RateTable,
)

__all__ = ["compute_price"]

ZERO = Decimal("0")

_METAL_LABELS = {
    "gold": "Gold value",
    "silver": "Silver value",
}


def _metal_label(metal: str) -> str:
    """Title of the metal line. Falls back to the metal name for future metals
    (platinum, etc.) rather than mislabelling it as gold."""
    return _METAL_LABELS.get(metal, f"{metal.title()} value")


def _gst_label(gst_rate: Decimal) -> str:
    """'GST 3%' — derived from config so a rate change updates the invoice text."""
    percent = (gst_rate * 100).normalize()
    return f"GST {percent:f}%"


def compute_price(
    product: PricingProduct,
    rates: RateTable | Mapping[tuple[str, str], Decimal | int | float | str],
    config: PricingConfig = DEFAULT_CONFIG,
) -> PriceResult:
    """Compute the full price breakup for one piece at today's rates.

    Args:
        product: the piece being priced (already validated on construction).
        rates: today's rates keyed by (metal, purity), e.g. ("gold", "18K").
        config: gst_rate, default_making_rate, rounding.

    Returns:
        A PriceResult. If no rate exists for this product's (metal, purity),
        ``rate_available`` is False and ``total`` is None — the caller must
        hide the price and disable buying.

    Raises:
        InvalidProductError: only via PricingProduct construction, never here.
    """
    rate_table = RateTable.from_mapping(rates)
    rate = rate_table.get(product.metal, product.purity)
    if rate is None or rate <= 0:
        # A zero or negative rate row is treated as "not set today" rather than
        # producing a free or negative piece.
        return PriceResult.unavailable()

    metal_value = rate * product.net_weight_grams
    diamond_value = product.diamond_value or ZERO
    # `or` would be wrong here: making_rate=0 is a deliberate waiver, not "unset".
    making_rate = (
        product.making_rate if product.making_rate is not None else config.default_making_rate
    )
    making = making_rate * product.gross_weight_grams

    subtotal = metal_value + diamond_value + making
    gst = subtotal * config.gst_rate
    total = round_amount(subtotal + gst, config.rounding)

    breakup = [BreakupLine(_metal_label(product.metal), to_paise_precision(metal_value))]
    if diamond_value > 0:
        breakup.append(BreakupLine("Diamond value", to_paise_precision(diamond_value)))
    breakup.append(BreakupLine("Making", to_paise_precision(making)))
    breakup.append(BreakupLine(_gst_label(config.gst_rate), to_paise_precision(gst)))

    return PriceResult(
        rate_available=True,
        total=total,
        breakup=tuple(breakup),
        currency="INR",
        rate_per_gram=rate,
    )
