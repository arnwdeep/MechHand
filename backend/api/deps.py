"""Shared FastAPI dependencies."""

from __future__ import annotations

import secrets

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from core.config import Settings, get_settings
from core.db import get_session

__all__ = ["get_session", "require_admin", "Settings", "Session", "Depends"]


def require_admin(
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
    settings: Settings = Depends(get_settings),
) -> None:
    """Interim admin gate for the daily-rate screen.

    P3 replaces this with the real OTP/Google session + an is_admin check. Until
    then a shared key in the environment keeps rate-setting off the open web.
    """
    configured = settings.admin_api_key
    if not configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ADMIN_API_KEY is not configured; admin endpoints are disabled.",
        )
    # Constant-time compare so the key can't be recovered by timing.
    if not x_admin_key or not secrets.compare_digest(x_admin_key, configured):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing admin key."
        )
