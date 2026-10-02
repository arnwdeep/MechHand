"""Deriving per-purity rates from one pure-metal rate.

These numbers decide what customers pay, so the ratios are pinned here rather
than left to whoever reads the table next.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from pricing import compute_price
from pricing.purity import (
    PURE_PURITY,
    UnknownPurityError,
    derive_rate,
    derive_rates,
    fineness,
    known_purities,
)
from pricing.types import InvalidProductError, PricingProduct


def d(value: str) -> Decimal:
    return Decimal(value)


# --------------------------------------------------------------------------
# Fineness
# --------------------------------------------------------------------------


@pytest.mark.parametrize(
    "purity,expected",
    [("24K", "1"), ("22K", "0.9166666666666666666666666667"), ("18K", "0.75")],
)
def test_gold_fineness_is_karat_over_24(purity, expected):
    assert fineness("gold", purity) == d(expected)


def test_silver_fineness_is_millesimal_over_1000():
    assert fineness("silver", "925") == d("0.925")
    assert fineness("silver", "999") == d("0.999")


def test_fineness_is_case_and_space_insensitive():
    assert fineness("Gold", " 18k ") == d("0.75")


def test_unknown_purity_has_no_fineness():
    assert fineness("gold", "17K") is None
    assert fineness("platinum", "950") is None


def test_pure_purity_per_metal():
    assert PURE_PURITY["gold"] == "24K"
    assert PURE_PURITY["silver"] == "999"


def test_known_purities_are_richest_first():
    gold = known_purities("gold")
    assert gold[0] == "24K"
    assert gold[-1] == "9K"
    assert "22K" in gold and "18K" in gold


# --------------------------------------------------------------------------
# Derivation
# --------------------------------------------------------------------------


def test_derive_18k_from_pure_gold():
    """₹10,000/g pure → 18K at three quarters = ₹7,500/g."""
    result = derive_rate(d("10000"), "gold", "18K")
    assert result.rate_per_gram == d("7500.00")
    assert result.fineness == d("0.75")
    assert result.overridden is False


def test_derive_22k_rounds_to_paise():
    """22/24 of 10,000 is 9166.666… — money stops at paise."""
    assert derive_rate(d("10000"), "gold", "22K").rate_per_gram == d("9166.67")


def test_derive_silver_925():
    assert derive_rate(d("100"), "silver", "925").rate_per_gram == d("92.50")


def test_derive_pure_returns_the_rate_unchanged():
    assert derive_rate(d("10000"), "gold", "24K").rate_per_gram == d("10000.00")


def test_derive_rates_covers_every_standard_purity():
    rates = derive_rates(d("10000"), "gold")
    by_purity = {r.purity: r.rate_per_gram for r in rates}
    assert by_purity["24K"] == d("10000.00")
    assert by_purity["22K"] == d("9166.67")
    assert by_purity["18K"] == d("7500.00")
    assert by_purity["14K"] == d("5833.33")


def test_derive_rates_accepts_an_explicit_subset():
    rates = derive_rates(d("10000"), "gold", ["22K", "18K"])
    assert [r.purity for r in rates] == ["22K", "18K"]


# --------------------------------------------------------------------------
# Overrides — the trade does not always sell at the metallurgical ratio
# --------------------------------------------------------------------------


def test_fineness_override_wins_and_is_flagged():
    result = derive_rate(d("10000"), "gold", "22K", fineness_override=d("0.92"))
    assert result.rate_per_gram == d("9200.00")
    assert result.overridden is True


def test_override_lets_a_non_standard_purity_be_derived():
    result = derive_rate(d("10000"), "gold", "17K", fineness_override=d("0.708"))
    assert result.rate_per_gram == d("7080.00")


@pytest.mark.parametrize("bad", [d("0"), d("-0.5"), d("1.5")])
def test_override_outside_zero_to_one_rejected(bad):
    with pytest.raises(InvalidProductError, match="fineness"):
        derive_rate(d("10000"), "gold", "22K", fineness_override=bad)


# --------------------------------------------------------------------------
# Validation
# --------------------------------------------------------------------------


def test_unknown_purity_without_override_is_refused():
    """Refuse rather than guess a ratio — this decides what customers pay."""
    with pytest.raises(UnknownPurityError, match="No standard fineness"):
        derive_rate(d("10000"), "gold", "17K")


@pytest.mark.parametrize("bad", [d("0"), d("-100")])
def test_non_positive_pure_rate_rejected(bad):
    with pytest.raises(InvalidProductError, match="pure_rate_per_gram"):
        derive_rate(bad, "gold", "18K")


def test_float_pure_rate_does_not_leak_binary_error():
    assert derive_rate(10000.10, "gold", "18K").rate_per_gram == d("7500.08")


# --------------------------------------------------------------------------
# The engine is unchanged: it still prices from an explicit per-purity rate
# --------------------------------------------------------------------------


def test_derived_rate_feeds_the_engine_like_any_other_rate():
    """Derivation happens at rate-entry; compute_price never sees a pure rate."""
    derived = derive_rate(d("8000"), "gold", "18K")  # → 6000.00/g
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    result = compute_price(product, {("gold", "18K"): derived.rate_per_gram})

    # Exactly spec case A — the engine cannot tell the rate was derived.
    assert result.total == d("36719.50")


def test_a_22k_piece_prices_from_its_own_derived_rate():
    derived = derive_rate(d("10000"), "gold", "22K")  # → 9166.67/g
    product = PricingProduct(
        metal="gold",
        purity="22K",
        net_weight_grams=d("5.000"),
        gross_weight_grams=d("5.500"),
        making_rate=d("1100"),
    )
    result = compute_price(product, {("gold", "22K"): derived.rate_per_gram})

    # 9166.67 × 5 = 45,833.35 metal; 1100 × 5.5 = 6,050 making
    # subtotal 51,883.35 + GST 1,556.50
    amounts = {line.label: line.amount for line in result.breakup}
    assert amounts["Gold value"] == d("45833.35")
    assert amounts["Making"] == d("6050.00")
    assert amounts["GST 3%"] == d("1556.50")
    assert result.total == d("53439.85")
