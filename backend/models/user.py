"""users — phone OTP or Google sign-in."""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin, uuid_pk


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk()
    #: E.164, e.g. +919876543210. Primary identity for OTP sign-in.
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    google_id: Mapped[str | None] = mapped_column(
        String(64), nullable=True, unique=True, index=True
    )
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:
        return f"<User {self.phone or self.email}>"
