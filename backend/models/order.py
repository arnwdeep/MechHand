"""orders / order_items.

``price_snapshot`` is the record of what the customer was actually charged:
the full breakup, the rate it was built from, and when. It is written from the
Redis price-lock snapshot, never from a recompute at settlement time — the
owner may have changed the day's rate while the customer was checking out.

Money inside the snapshot JSON is stored as strings, so a float round-trip can
never shift a paise on a document we may have to defend.
"""

from __future__ import annotations

import enum
import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import MONEY_PRECISION, Base, TimestampMixin, uuid_pk


class OrderStatus(enum.StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(enum.StrEnum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=OrderStatus.PENDING.value
    )
    total: Mapped[Decimal] = mapped_column(Numeric(*MONEY_PRECISION), nullable=False)
    #: {breakup: [...], rate: {...}, timestamp: ...} — amounts as strings.
    price_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)

    #: Unique so a replayed Razorpay webhook cannot create a second order.
    razorpay_order_id: Mapped[str | None] = mapped_column(
        String(64), nullable=True, unique=True, index=True
    )
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    payment_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=PaymentStatus.PENDING.value
    )
    invoice_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    shipping_address: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    items: Mapped[list[OrderItem]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )

    __table_args__ = (CheckConstraint("total >= 0", name="ck_orders_total_positive"),)


class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = uuid_pk()
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True
    )
    #: Per-item breakup at time of sale, including the rate used.
    price_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    qty: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    order: Mapped[Order] = relationship(back_populates="items")

    __table_args__ = (CheckConstraint("qty > 0", name="ck_order_items_qty_positive"),)
