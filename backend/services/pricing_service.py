"""Adapter between DB rows and the pure pricing engine.

This is the ONLY place a ``Product`` row becomes a ``PricingProduct``. The
engine stays ignorant of SQLAlchemy; everything that touches the DB stays here.
"""

from __future__ import annotations

import logging
from datetime import datetime
from decimal import Decimal

from core.config import get_settings
from core.time import now_ist
from models import Product
from pricing import InvalidProductError, PriceResult, PricingProduct, RateTable, compute_price
from pricing.rounding import to_paise_precision

logger = logging.getLogger(__name__)

#: Weights are recorded to the milligram, matching the products table.
WEIGHT_QUANTUM = Decimal("0.001")


def to_pricing_product(product: Product) -> PricingProduct:
    return PricingProduct(
        metal=product.metal,
        purity=product.purity,
        net_weight_grams=product.net_weight_grams,
        gross_weight_grams=product.gross_weight_grams,
        diamond_value=product.diamond_value,
        making_rate=product.making_rate,
    )


def price_for(product: Product, rates: RateTable) -> PriceResult:
    """Price one product at today's rates.

    A product whose own data is unpriceable (bad weights) comes back as
    unavailable rather than raising: one bad row must not take down the whole
    catalogue listing. It is logged so the admin screen can surface it.
    """
    try:
        pricing_product = to_pricing_product(product)
    except InvalidProductError:
        logger.exception("Product %s has unpriceable data", product.slug)
        return PriceResult.unavailable()

    return compute_price(pricing_product, rates, get_settings().pricing_config())


def build_price_snapshot(
    product: Product, result: PriceResult, *, at: datetime | None = None
) -> dict:
    """Serialize a price for durable storage (Redis price-lock, order record).

    Money is written as strings so a JSON float round-trip can never shift a
    paise on a figure we may have to defend to a customer months later.

    Every figure is quantized to a fixed scale first. A Decimal carries its own
    scale, so the same rate reads "6000" in memory but "6000.00" once it has
    been through the Numeric(12,2) column — two spellings of one number in a
    record that has to be consistent on an invoice.
    """
    if not result.rate_available or result.total is None:
        raise ValueError(f"Cannot snapshot an unavailable price for {product.slug}")

    return {
        "product_id": str(product.id),
        "product_slug": product.slug,
        "product_name": product.name,
        "currency": result.currency,
        "total": str(result.total),
        "breakup": [{"label": line.label, "amount": str(line.amount)} for line in result.breakup],
        "rate": {
            "metal": product.metal,
            "purity": product.purity,
            "rate_per_gram": str(to_paise_precision(result.rate_per_gram)),
        },
        "weights": {
            "net_grams": str(product.net_weight_grams.quantize(WEIGHT_QUANTUM)),
            "gross_grams": str(product.gross_weight_grams.quantize(WEIGHT_QUANTUM)),
        },
        "timestamp": (at or now_ist()).isoformat(),
    }


def snapshot_total(snapshot: dict) -> Decimal:
    """Read the locked total back out. Razorpay orders are built from this."""
    return Decimal(snapshot["total"])
