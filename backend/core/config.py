"""Environment-driven settings. No secret is ever hardcoded or committed."""

from __future__ import annotations

from decimal import Decimal
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from pricing import PricingConfig, Rounding

#: Anchored to the backend directory, not the process working directory, so
#: `uvicorn`, alembic and scripts all load the same .env no matter where they
#: are launched from.
BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_env: str = "development"
    debug: bool = False
    #: Mounts /dev/calculator and /dev/price-preview. Ignored when
    #: app_env == "production".
    enable_dev_tools: bool = True

    # Infrastructure
    database_url: str = "postgresql+psycopg://localhost/shree_rani_gehna"
    redis_url: str = "redis://localhost:6379/0"

    # Pricing — the one place the formula's tunables live.
    gst_rate: Decimal = Decimal("0.03")
    default_making_rate: Decimal = Decimal("1100")
    # Open item: client has not confirmed nearest-rupee. Flip this single value
    # to "nearest_rupee" when they do.
    rounding: Rounding = Rounding.TWO_DECIMALS

    # Price-lock / reservation TTL, seconds (P3).
    price_lock_ttl_seconds: int = 900
    stock_reservation_ttl_seconds: int = 900

    # Interim admin auth until P3 replaces it with real sessions.
    admin_api_key: str = Field(default="", repr=False)

    # Third-party — populated in P3/P4.
    razorpay_key_id: str = Field(default="", repr=False)
    razorpay_key_secret: str = Field(default="", repr=False)
    razorpay_webhook_secret: str = Field(default="", repr=False)
    r2_account_id: str = Field(default="", repr=False)
    r2_access_key_id: str = Field(default="", repr=False)
    r2_secret_access_key: str = Field(default="", repr=False)
    r2_bucket: str = ""
    r2_public_base_url: str = ""
    whatsapp_token: str = Field(default="", repr=False)
    whatsapp_phone_number_id: str = Field(default="", repr=False)

    cors_origins: list[str] = ["http://localhost:3000"]

    def pricing_config(self) -> PricingConfig:
        """Build the engine's config. The engine never reads settings itself."""
        return PricingConfig(
            gst_rate=self.gst_rate,
            default_making_rate=self.default_making_rate,
            rounding=self.rounding,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
