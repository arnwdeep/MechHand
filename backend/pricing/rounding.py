"""Rounding policy for money amounts.

Kept in one file on purpose. The client has not yet confirmed whether totals
should land on the nearest rupee or keep paise (see "Open items" in CLAUDE.md),
so switching the rule is a one-line config change, not a code hunt.

ROUND_HALF_UP everywhere — the arithmetic people expect from an invoice.
Python's default for Decimal is ROUND_HALF_EVEN (banker's rounding), which
would send 0.005 down half the time and make hand-checks disagree.
"""

from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal
from enum import StrEnum

#: Money is displayed to paise precision regardless of how the total is rounded.
PAISE = Decimal("0.01")
RUPEE = Decimal("1")


class Rounding(StrEnum):
    """How the grand total is rounded."""

    #: Keep paise: 36,719.50 stays 36,719.50. Current default.
    TWO_DECIMALS = "two_decimals"
    #: Round to whole rupees: 36,719.50 becomes 36,720.
    NEAREST_RUPEE = "nearest_rupee"


_QUANTUM: dict[Rounding, Decimal] = {
    Rounding.TWO_DECIMALS: PAISE,
    Rounding.NEAREST_RUPEE: RUPEE,
}


def round_amount(amount: Decimal, rounding: Rounding = Rounding.TWO_DECIMALS) -> Decimal:
    """Round a final total according to the configured policy."""
    return amount.quantize(_QUANTUM[rounding], rounding=ROUND_HALF_UP)


def to_paise_precision(amount: Decimal) -> Decimal:
    """Quantize a breakup line for display. Never used for intermediate math."""
    return amount.quantize(PAISE, rounding=ROUND_HALF_UP)
