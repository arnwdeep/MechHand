"""Locked test cases for the pricing engine.

Cases A-E come straight from CLAUDE.md and were confirmed against the owner's
hand calculation. Treat them as a contract: if a change here is needed, the
client has changed the formula, not the code.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from pricing import (
    DEFAULT_CONFIG,
    InvalidProductError,
    PricingConfig,
    PricingProduct,
    RateTable,
    Rounding,
    compute_price,
)

GOLD_18K = ("gold", "18K")
GOLD_14K = ("gold", "14K")
SILVER_925 = ("silver", "925")


def d(value: str) -> Decimal:
    return Decimal(value)


def labels(result) -> list[str]:
    return [line.label for line in result.breakup]


def amounts(result) -> dict[str, Decimal]:
    return {line.label: line.amount for line in result.breakup}


# --------------------------------------------------------------------------
# A — Diamond gold ring (18K)
# --------------------------------------------------------------------------


def test_case_a_diamond_gold_ring_18k():
    """rate 6000/g, net 3.000g, diamond 13,800, gross 3.500g, making 1100."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    result = compute_price(product, {GOLD_18K: d("6000")})

    assert result.rate_available is True
    assert result.currency == "INR"
    assert amounts(result) == {
        "Gold value": d("18000.00"),
        "Diamond value": d("13800.00"),
        "Making": d("3850.00"),
        "GST 3%": d("1069.50"),
    }
    assert labels(result) == ["Gold value", "Diamond value", "Making", "GST 3%"]
    assert result.total == d("36719.50")
    assert result.rate_per_gram == d("6000")


def test_case_a_subtotal_is_consistent_with_breakup():
    """Breakup lines must add up to the total the customer is charged."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    result = compute_price(product, {GOLD_18K: d("6000")})
    assert sum(line.amount for line in result.breakup) == result.total


# --------------------------------------------------------------------------
# B — Silver diamond piece
# --------------------------------------------------------------------------


def test_case_b_silver_diamond_piece():
    """rate 90/g, net 10.0g, diamond 5,000, gross 11.0g, making 1100."""
    product = PricingProduct(
        metal="silver",
        purity="925",
        net_weight_grams=d("10.0"),
        gross_weight_grams=d("11.0"),
        diamond_value=d("5000"),
    )
    result = compute_price(product, {SILVER_925: d("90")})

    assert result.rate_available is True
    assert amounts(result) == {
        "Silver value": d("900.00"),
        "Diamond value": d("5000.00"),
        "Making": d("12100.00"),
        "GST 3%": d("540.00"),
    }
    assert result.total == d("18540.00")


def test_silver_line_is_labelled_silver_not_gold():
    product = PricingProduct(
        metal="silver",
        purity="925",
        net_weight_grams=d("10.0"),
        gross_weight_grams=d("11.0"),
        diamond_value=d("5000"),
    )
    result = compute_price(product, {SILVER_925: d("90")})
    assert labels(result)[0] == "Silver value"


# --------------------------------------------------------------------------
# C — No rate set today
# --------------------------------------------------------------------------


def test_case_c_no_rate_today_returns_unavailable():
    """Storefront must hide the price and disable buying — never show stale/zero."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    result = compute_price(product, {SILVER_925: d("90")})  # gold 18K absent

    assert result.rate_available is False
    assert result.total is None
    assert result.breakup == ()
    assert result.rate_per_gram is None


def test_empty_rate_table_returns_unavailable():
    product = PricingProduct(
        metal="gold", purity="18K", net_weight_grams=d("3"), gross_weight_grams=d("3.5")
    )
    result = compute_price(product, {})
    assert result.rate_available is False
    assert result.total is None


def test_rate_for_other_purity_does_not_leak():
    """A 14K rate must not price an 18K piece."""
    product = PricingProduct(
        metal="gold", purity="18K", net_weight_grams=d("3"), gross_weight_grams=d("3.5")
    )
    result = compute_price(product, {GOLD_14K: d("4500")})
    assert result.rate_available is False


@pytest.mark.parametrize("bad_rate", [d("0"), d("-6000")])
def test_zero_or_negative_rate_is_treated_as_unset(bad_rate):
    """A bad rate row must not produce a free or negative piece."""
    product = PricingProduct(
        metal="gold", purity="18K", net_weight_grams=d("3"), gross_weight_grams=d("3.5")
    )
    result = compute_price(product, {GOLD_18K: bad_rate})
    assert result.rate_available is False
    assert result.total is None


# --------------------------------------------------------------------------
# D — Custom making rate
# --------------------------------------------------------------------------


def test_case_d_custom_making_rate():
    """Case A but making_rate=1500 → making 5,250, total 38,161.50."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
        making_rate=d("1500"),
    )
    result = compute_price(product, {GOLD_18K: d("6000")})

    assert amounts(result)["Making"] == d("5250.00")
    assert amounts(result)["GST 3%"] == d("1111.50")
    assert result.total == d("38161.50")


def test_making_rate_falls_back_to_config_default():
    """making_rate=None uses config.default_making_rate (1100)."""
    explicit = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        making_rate=d("1100"),
    )
    implicit = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
    )
    rates = {GOLD_18K: d("6000")}
    assert compute_price(implicit, rates).total == compute_price(explicit, rates).total
    assert DEFAULT_CONFIG.default_making_rate == d("1100")


def test_making_rate_zero_is_allowed_and_not_treated_as_missing():
    """making_rate=0 means the owner waived making — it must not fall back to 1100."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        making_rate=d("0"),
    )
    result = compute_price(product, {GOLD_18K: d("6000")})
    assert amounts(result)["Making"] == d("0.00")
    # 18,000 + 0 making, GST 540 → 18,540
    assert result.total == d("18540.00")


def test_config_default_making_rate_is_overridable():
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
    )
    config = PricingConfig(default_making_rate=d("1500"))
    result = compute_price(product, {GOLD_18K: d("6000")}, config)
    assert amounts(result)["Making"] == d("5250.00")


# --------------------------------------------------------------------------
# E — No diamond (future plain-gold case)
# --------------------------------------------------------------------------


def test_case_e_no_diamond_omits_the_diamond_line():
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("0"),
    )
    result = compute_price(product, {GOLD_18K: d("6000")})

    assert labels(result) == ["Gold value", "Making", "GST 3%"]
    # 18,000 + 3,850 = 21,850 subtotal, GST 655.50
    assert result.total == d("22505.50")


def test_diamond_value_none_behaves_as_zero():
    with_none = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=None,
    )
    result = compute_price(with_none, {GOLD_18K: d("6000")})
    assert labels(result) == ["Gold value", "Making", "GST 3%"]
    assert result.total == d("22505.50")


# --------------------------------------------------------------------------
# Weights: net drives metal, gross drives making
# --------------------------------------------------------------------------


def test_metal_uses_net_and_making_uses_gross():
    """The single easiest formula error to make — pin it down explicitly."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("2.000"),
        gross_weight_grams=d("5.000"),
        making_rate=d("1000"),
    )
    result = compute_price(product, {GOLD_18K: d("6000")})
    assert amounts(result)["Gold value"] == d("12000.00")  # 6000 x net 2.000
    assert amounts(result)["Making"] == d("5000.00")  # 1000 x gross 5.000


def test_no_wastage_is_applied():
    """subtotal is exactly metal + diamond + making, with nothing added."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    result = compute_price(product, {GOLD_18K: d("6000")})
    lines = amounts(result)
    subtotal = lines["Gold value"] + lines["Diamond value"] + lines["Making"]
    assert subtotal == d("35650.00")


# --------------------------------------------------------------------------
# Validation
# --------------------------------------------------------------------------


@pytest.mark.parametrize("net", [d("0"), d("-1"), d("-0.001")])
def test_zero_or_negative_net_weight_rejected(net):
    with pytest.raises(InvalidProductError, match="net_weight_grams"):
        PricingProduct(
            metal="gold", purity="18K", net_weight_grams=net, gross_weight_grams=d("3.5")
        )


@pytest.mark.parametrize("gross", [d("0"), d("-1")])
def test_zero_or_negative_gross_weight_rejected(gross):
    with pytest.raises(InvalidProductError, match="gross_weight_grams"):
        PricingProduct(
            metal="gold", purity="18K", net_weight_grams=d("1"), gross_weight_grams=gross
        )


def test_net_weight_above_gross_rejected():
    """Catches the swapped-fields data entry mistake before it misprices a piece."""
    with pytest.raises(InvalidProductError, match="cannot exceed"):
        PricingProduct(
            metal="gold", purity="18K", net_weight_grams=d("3.5"), gross_weight_grams=d("3.0")
        )


def test_net_equal_to_gross_is_allowed():
    """A plain piece with no stones has net == gross."""
    product = PricingProduct(
        metal="gold", purity="18K", net_weight_grams=d("3.0"), gross_weight_grams=d("3.0")
    )
    assert compute_price(product, {GOLD_18K: d("6000")}).rate_available is True


@pytest.mark.parametrize("purity", ["", "   ", None])
def test_missing_purity_rejected(purity):
    with pytest.raises(InvalidProductError, match="purity"):
        PricingProduct(
            metal="gold", purity=purity, net_weight_grams=d("3"), gross_weight_grams=d("3.5")
        )


@pytest.mark.parametrize("metal", ["", "  ", None])
def test_missing_metal_rejected(metal):
    with pytest.raises(InvalidProductError, match="metal"):
        PricingProduct(
            metal=metal, purity="18K", net_weight_grams=d("3"), gross_weight_grams=d("3.5")
        )


def test_negative_diamond_value_rejected():
    with pytest.raises(InvalidProductError, match="diamond_value"):
        PricingProduct(
            metal="gold",
            purity="18K",
            net_weight_grams=d("3"),
            gross_weight_grams=d("3.5"),
            diamond_value=d("-1"),
        )


def test_negative_making_rate_rejected():
    with pytest.raises(InvalidProductError, match="making_rate"):
        PricingProduct(
            metal="gold",
            purity="18K",
            net_weight_grams=d("3"),
            gross_weight_grams=d("3.5"),
            making_rate=d("-1"),
        )


def test_non_numeric_weight_rejected():
    with pytest.raises(InvalidProductError):
        PricingProduct(
            metal="gold", purity="18K", net_weight_grams="heavy", gross_weight_grams=d("3.5")
        )


def test_nan_weight_rejected():
    with pytest.raises(InvalidProductError, match="finite"):
        PricingProduct(
            metal="gold",
            purity="18K",
            net_weight_grams=Decimal("NaN"),
            gross_weight_grams=d("3.5"),
        )


# --------------------------------------------------------------------------
# Normalization
# --------------------------------------------------------------------------


def test_purity_and_metal_lookup_is_case_insensitive():
    """'18k' on the product must still find the ('gold','18K') rate row."""
    product = PricingProduct(
        metal="Gold",
        purity=" 18k ",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    result = compute_price(product, {("GOLD", "18k"): d("6000")})
    assert result.total == d("36719.50")


def test_float_inputs_do_not_leak_binary_error():
    """Floats arrive from JSON; they must not drag 0.1-style error into money."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=3.1,
        gross_weight_grams=3.5,
        diamond_value=13800.0,
    )
    result = compute_price(product, {GOLD_18K: 6000.0})
    # 18,600 metal + 13,800 diamond + 3,850 making = 36,250 subtotal, GST 1,087.50
    assert amounts(result)["Gold value"] == d("18600.00")
    assert amounts(result)["GST 3%"] == d("1087.50")
    assert result.total == d("37337.50")


# --------------------------------------------------------------------------
# Rounding policy (client has not confirmed nearest-rupee yet)
# --------------------------------------------------------------------------


def test_default_rounding_keeps_paise():
    assert DEFAULT_CONFIG.rounding is Rounding.TWO_DECIMALS
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    assert compute_price(product, {GOLD_18K: d("6000")}).total == d("36719.50")


def test_nearest_rupee_rounding_is_a_config_switch():
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    config = PricingConfig(rounding=Rounding.NEAREST_RUPEE)
    result = compute_price(product, {GOLD_18K: d("6000")}, config)
    assert result.total == d("36720")


def test_rounding_is_half_up_not_bankers():
    """0.005 must go up. Decimal's default (HALF_EVEN) would send it down here."""
    from pricing.rounding import round_amount

    assert round_amount(d("36719.505")) == d("36719.51")
    assert round_amount(d("36718.505")) == d("36718.51")
    assert round_amount(d("36719.50"), Rounding.NEAREST_RUPEE) == d("36720")


def test_total_is_rounded_once_from_unrounded_intermediates():
    """Rounding each line first would drift the total by paise."""
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.333"),
        gross_weight_grams=d("3.777"),
        diamond_value=d("13800.333"),
    )
    result = compute_price(product, {GOLD_18K: d("6001.77")})

    metal_value = d("6001.77") * d("3.333")
    making = d("1100") * d("3.777")
    subtotal = metal_value + d("13800.333") + making
    expected = (subtotal * d("0.03") + subtotal).quantize(d("0.01"))
    assert result.total == expected


# --------------------------------------------------------------------------
# Purity / metal extensibility (plain gold, 22K etc. are deferred, not blocked)
# --------------------------------------------------------------------------


@pytest.mark.parametrize("purity", ["14K", "18K", "20K", "22K", "24K"])
def test_engine_supports_any_purity_the_rate_table_carries(purity):
    product = PricingProduct(
        metal="gold", purity=purity, net_weight_grams=d("2"), gross_weight_grams=d("2")
    )
    result = compute_price(product, {("gold", purity): d("5000")})
    assert result.rate_available is True
    assert amounts(result)["Gold value"] == d("10000.00")


# --------------------------------------------------------------------------
# Purity of the engine itself
# --------------------------------------------------------------------------


def test_engine_does_not_mutate_its_inputs():
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    rates = {GOLD_18K: d("6000")}
    compute_price(product, rates)

    assert rates == {GOLD_18K: d("6000")}
    assert product.net_weight_grams == d("3.000")
    assert product.making_rate is None


def test_repeated_calls_are_deterministic():
    product = PricingProduct(
        metal="gold",
        purity="18K",
        net_weight_grams=d("3.000"),
        gross_weight_grams=d("3.500"),
        diamond_value=d("13800"),
    )
    rates = RateTable.from_mapping({GOLD_18K: d("6000")})
    first = compute_price(product, rates)
    second = compute_price(product, rates)
    assert first == second
