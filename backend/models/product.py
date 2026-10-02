"""products — the catalogue.

A computed price is NEVER stored here. Price is always derived from the day's
rate by the pricing engine, so one rate update re-prices the whole catalogue.
"""

from __future__ import annotations

import enum
import uuid
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import MONEY_PRECISION, WEIGHT_PRECISION, Base, UpdatedAtMixin, uuid_pk


class ProductType(enum.StrEnum):
    #: Instant buy — add to cart / buy now.
    CATALOGUE = "catalogue"
    #: Consultation / quote flow, no direct buy.
    MADE_TO_ORDER = "made_to_order"
    #: Owner sets diamond value per piece; sells as catalogue OR consultation.
    DIAMOND = "diamond"


class Metal(enum.StrEnum):
    GOLD = "gold"
    SILVER = "silver"


class Product(Base, UpdatedAtMixin):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), nullable=False, unique=True, index=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False, default=ProductType.DIAMOND.value)

    metal: Mapped[str] = mapped_column(String(16), nullable=False)
    #: Per-purity rate key: "18K", "14K", "925". Never derived from 24K.
    purity: Mapped[str] = mapped_column(String(16), nullable=False)

    #: Metal only — drives metal_value.
    net_weight_grams: Mapped[Decimal] = mapped_column(Numeric(*WEIGHT_PRECISION), nullable=False)
    #: Whole piece including stones — drives making charges.
    gross_weight_grams: Mapped[Decimal] = mapped_column(Numeric(*WEIGHT_PRECISION), nullable=False)

    #: Per-piece diamond value entered by the owner; editable anytime.
    diamond_value: Mapped[Decimal | None] = mapped_column(Numeric(*MONEY_PRECISION), nullable=True)
    #: NULL falls back to config.default_making_rate (1100).
    making_rate: Mapped[Decimal | None] = mapped_column(Numeric(*MONEY_PRECISION), nullable=True)

    category: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    occasion: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    #: [{url, alt, sort_order}] — JSONB so P2's media pipeline can add fields
    #: without a migration.
    images: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    videos: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    in_stock: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    __table_args__ = (
        CheckConstraint("net_weight_grams > 0", name="ck_products_net_weight_positive"),
        CheckConstraint("gross_weight_grams > 0", name="ck_products_gross_weight_positive"),
        # Net is metal only; gross includes stones. Net above gross means the
        # fields were swapped on entry.
        CheckConstraint(
            "net_weight_grams <= gross_weight_grams", name="ck_products_net_not_above_gross"
        ),
        CheckConstraint(
            "diamond_value IS NULL OR diamond_value >= 0", name="ck_products_diamond_value_positive"
        ),
        CheckConstraint(
            "making_rate IS NULL OR making_rate >= 0", name="ck_products_making_rate_positive"
        ),
        CheckConstraint("quantity >= 0", name="ck_products_quantity_positive"),
        CheckConstraint(
            "type IN ('catalogue', 'made_to_order', 'diamond')", name="ck_products_type_valid"
        ),
    )

    @property
    def is_buyable(self) -> bool:
        """made_to_order pieces route to consultation, never to cart."""
        return self.type != ProductType.MADE_TO_ORDER.value

    def __repr__(self) -> str:
        return f"<Product {self.slug} {self.metal} {self.purity}>"
