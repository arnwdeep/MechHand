"""Fixtures for DB-backed tests.

These need a real PostgreSQL — the schema uses JSONB, ARRAY and a plpgsql
trigger, none of which SQLite can stand in for, and the append-only guarantee
is only meaningful when tested against the database that enforces it.

Run them by pointing TEST_DATABASE_URL at a throwaway database:

    createdb shree_rani_gehna_test
    TEST_DATABASE_URL=postgresql+psycopg://localhost/shree_rani_gehna_test \\
        .venv/bin/python -m pytest tests

Without that variable they skip, so `pytest` stays green offline. CI always
sets it, so they always run there.
"""

from __future__ import annotations

import os
import uuid
from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
ADMIN_KEY = "test-admin-key"

pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL, reason="TEST_DATABASE_URL not set; skipping DB-backed tests"
)


@pytest.fixture(scope="session")
def engine():
    if not TEST_DATABASE_URL:
        pytest.skip("TEST_DATABASE_URL not set")

    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    os.environ["ADMIN_API_KEY"] = ADMIN_KEY

    from core.config import get_settings

    get_settings.cache_clear()  # settings are lru_cached; pick up the test env

    eng = create_engine(TEST_DATABASE_URL)
    from alembic.config import Config

    from alembic import command

    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    command.downgrade(alembic_cfg, "base")
    command.upgrade(alembic_cfg, "head")

    yield eng
    eng.dispose()


@pytest.fixture
def session(engine) -> Session:
    """A clean database per test."""
    with engine.begin() as conn:
        conn.execute(
            text(
                "TRUNCATE order_items, orders, reviews, consultations, "
                "products, metal_rates, users RESTART IDENTITY CASCADE"
            )
        )
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with factory() as s:
        yield s


@pytest.fixture
def client(engine, session) -> TestClient:
    import main
    from core.db import get_session

    def override_session():
        yield session

    main.app.dependency_overrides[get_session] = override_session
    with TestClient(main.app) as c:
        yield c
    main.app.dependency_overrides.clear()


@pytest.fixture
def admin_headers() -> dict[str, str]:
    return {"X-Admin-Key": ADMIN_KEY}


@pytest.fixture
def gold_ring(session):
    """Test case A as a real catalogue row."""
    from models import Product

    product = Product(
        id=uuid.uuid4(),
        name="Diamond Solitaire Ring",
        slug="diamond-solitaire-ring",
        type="diamond",
        metal="gold",
        purity="18K",
        net_weight_grams=Decimal("3.000"),
        gross_weight_grams=Decimal("3.500"),
        diamond_value=Decimal("13800"),
        category="rings",
        occasion=["wedding"],
        images=[],
        videos=[],
        in_stock=True,
        quantity=1,
    )
    session.add(product)
    session.commit()
    return product


@pytest.fixture
def todays_gold_rate(session):
    from services import rates as rates_service

    rate = rates_service.set_rate(
        session, metal="gold", purity="18K", rate_per_gram=Decimal("6000")
    )
    session.commit()
    return rate


@pytest.fixture
def yesterday() -> date:
    from datetime import timedelta

    from core.time import today_ist

    return today_ist() - timedelta(days=1)
