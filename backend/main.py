"""FastAPI application entrypoint.

Run locally:  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import products, rates
from core.config import get_settings

logging.basicConfig(level=logging.INFO)

settings = get_settings()

app = FastAPI(
    title="Shree Rani Gehna API",
    version="0.1.0",
    description="Live rate-based jewellery commerce. All money math is server-side.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rates.router)
app.include_router(products.router)

# The price calculator is a build-time aid, not a product surface. Both
# conditions must hold, so a deploy that forgets APP_ENV=production still has
# to have dev tools explicitly left on to expose it.
if settings.enable_dev_tools and settings.app_env != "production":
    from api import dev

    app.include_router(dev.router)
    logging.getLogger(__name__).info(
        "Dev tools on: pricing calculator at /dev/calculator"
    )


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
