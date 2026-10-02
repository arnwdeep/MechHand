"""metal_rates — APPEND-ONLY.

Never UPDATE, never DELETE. Setting a new rate inserts a new row; reads take
the latest row per (metal, purity). This is what makes every past sale's rate
provable months later when a customer or an auditor asks.

The rule is enforced three ways: by the service layer (insert only), by the ORM
event listeners below, and it should also be enforced by a database trigger in
production (see the note in the initial migration).
"""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, Index, Numeric, String, event
from sqlalchemy.orm import Mapped, Mapper, mapped_column

from models.base import MONEY_PRECISION, Base, TimestampMixin, uuid_pk


class AppendOnlyViolation(RuntimeError):
    """Raised when something tries to mutate a rate row."""


class MetalRate(Base, TimestampMixin):
    __tablename__ = "metal_rates"

    id: Mapped[uuid.UUID] = uuid_pk()
    metal: Mapped[str] = mapped_column(String(16), nullable=False)
    purity: Mapped[str] = mapped_column(String(16), nullable=False)
    rate_per_gram: Mapped[Decimal] = mapped_column(Numeric(*MONEY_PRECISION), nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)

    __table_args__ = (
        CheckConstraint("rate_per_gram > 0", name="ck_metal_rates_rate_positive"),
        # Reads are always "latest row for this metal+purity on this date".
        Index(
            "ix_metal_rates_lookup",
            "metal",
            "purity",
            "effective_date",
            "created_at",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<MetalRate {self.metal} {self.purity} "
            f"{self.rate_per_gram}/g on {self.effective_date}>"
        )


@event.listens_for(MetalRate, "before_update", propagate=True)
def _block_update(mapper: Mapper, connection, target: MetalRate) -> None:
    raise AppendOnlyViolation(
        "metal_rates is append-only: insert a new rate row instead of updating "
        f"{target.metal} {target.purity}."
    )


@event.listens_for(MetalRate, "before_delete", propagate=True)
def _block_delete(mapper: Mapper, connection, target: MetalRate) -> None:
    raise AppendOnlyViolation(
        "metal_rates is append-only: rate history must stay intact so past "
        "sales remain provable."
    )
