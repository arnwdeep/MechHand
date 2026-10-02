"""Developer-only price calculator.

Exists so the owner can check a hand calculation against the real engine, which
is the Phase 1 exit criterion. It calls ``compute_price`` directly and touches
no database, so it works before a single product row exists.

Never mounted when APP_ENV=production (see main.py).
"""

from __future__ import annotations

from decimal import Decimal
from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from api.schemas import PriceResultOut
from core.config import get_settings
from pricing import (
    InvalidProductError,
    PricingConfig,
    PricingProduct,
    RateTable,
    Rounding,
    compute_price,
)

router = APIRouter(tags=["dev"])

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


class PricePreviewIn(BaseModel):
    """One piece, priced at one rate.

    Amounts are accepted as strings so nothing passes through a JSON float on
    the way to the engine.
    """

    metal: str = "gold"
    purity: str = "18K"
    net_weight_grams: Decimal
    gross_weight_grams: Decimal
    diamond_value: Decimal | None = None
    making_rate: Decimal | None = None

    #: None simulates "no rate set today" — the stale-rate state.
    rate_per_gram: Decimal | None = None

    # Config overrides, so the client can see what nearest-rupee would do
    # without anyone editing an env file.
    gst_rate: Decimal | None = Field(default=None, ge=0)
    default_making_rate: Decimal | None = Field(default=None, ge=0)
    rounding: Rounding | None = None


@router.post("/dev/price-preview", response_model=PriceResultOut)
def price_preview(payload: PricePreviewIn) -> PriceResultOut:
    """Price a hypothetical piece. No DB, no stored state."""
    base = get_settings().pricing_config()
    config = PricingConfig(
        gst_rate=payload.gst_rate if payload.gst_rate is not None else base.gst_rate,
        default_making_rate=(
            payload.default_making_rate
            if payload.default_making_rate is not None
            else base.default_making_rate
        ),
        rounding=payload.rounding or base.rounding,
    )

    try:
        product = PricingProduct(
            metal=payload.metal,
            purity=payload.purity,
            net_weight_grams=payload.net_weight_grams,
            gross_weight_grams=payload.gross_weight_grams,
            diamond_value=payload.diamond_value,
            making_rate=payload.making_rate,
        )
    except InvalidProductError as exc:
        # Surface the guardrail text verbatim — that is the point of the tool.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    rates = RateTable.from_mapping(
        {}
        if payload.rate_per_gram is None
        else {(payload.metal, payload.purity): payload.rate_per_gram}
    )
    return PriceResultOut.from_result(compute_price(product, rates, config))


@router.get("/dev/calculator", include_in_schema=False)
def calculator() -> FileResponse:
    return FileResponse(STATIC_DIR / "calculator.html")
