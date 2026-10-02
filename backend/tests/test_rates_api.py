"""Rate endpoints and the append-only guarantee."""

from __future__ import annotations

import os
from decimal import Decimal

import pytest
from sqlalchemy.exc import DBAPIError

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL not set"
)


def test_set_rate_inserts_a_new_row(client, admin_headers, session):
    response = client.post(
        "/admin/rates",
        json={"metal": "gold", "purity": "18K", "rate_per_gram": "6000"},
        headers=admin_headers,
    )
    assert response.status_code == 201
    assert response.json()["rate_per_gram"] == 6000.0
    assert response.json()["purity"] == "18K"


def test_correcting_a_rate_adds_a_row_and_keeps_the_old_one(client, admin_headers, session):
    """The owner fat-fingers 6000, fixes it to 6200. Both must survive."""
    from models import MetalRate

    for rate in ("6000", "6200"):
        client.post(
            "/admin/rates",
            json={"metal": "gold", "purity": "18K", "rate_per_gram": rate},
            headers=admin_headers,
        )

    rows = session.query(MetalRate).all()
    assert len(rows) == 2, "correcting a rate must insert, never overwrite"

    today = client.get("/rates/today").json()
    assert len(today["rates"]) == 1
    assert today["rates"][0]["rate_per_gram"] == 6200.0, "latest insert wins"


def test_database_trigger_blocks_updating_a_rate(session, todays_gold_rate):
    """The ORM guard can be bypassed with raw SQL; the trigger cannot."""
    from sqlalchemy import text

    with pytest.raises(DBAPIError, match="append-only"):
        session.execute(text("UPDATE metal_rates SET rate_per_gram = 1"))
        session.flush()
    session.rollback()


def test_database_trigger_blocks_deleting_a_rate(session, todays_gold_rate):
    from sqlalchemy import text

    with pytest.raises(DBAPIError, match="append-only"):
        session.execute(text("DELETE FROM metal_rates"))
        session.flush()
    session.rollback()


def test_orm_guard_blocks_updating_a_rate(session, todays_gold_rate):
    from models import AppendOnlyViolation

    todays_gold_rate.rate_per_gram = Decimal("1")
    with pytest.raises(AppendOnlyViolation):
        session.flush()
    session.rollback()


def test_setting_a_rate_requires_admin_key(client):
    response = client.post(
        "/admin/rates", json={"metal": "gold", "purity": "18K", "rate_per_gram": "6000"}
    )
    assert response.status_code == 401


def test_wrong_admin_key_rejected(client):
    response = client.post(
        "/admin/rates",
        json={"metal": "gold", "purity": "18K", "rate_per_gram": "6000"},
        headers={"X-Admin-Key": "wrong"},
    )
    assert response.status_code == 401


@pytest.mark.parametrize("bad_rate", ["0", "-100"])
def test_non_positive_rate_rejected(client, admin_headers, bad_rate):
    response = client.post(
        "/admin/rates",
        json={"metal": "gold", "purity": "18K", "rate_per_gram": bad_rate},
        headers=admin_headers,
    )
    assert response.status_code == 422


def test_rates_today_reports_missing_purities_for_live_products(client, gold_ring):
    """The admin warning must name what's missing, not just say 'no rates'."""
    body = client.get("/rates/today").json()
    assert body["all_rates_set"] is False
    assert {"metal": "gold", "purity": "18K"} in body["missing"]


def test_rates_today_is_clear_once_every_needed_rate_is_set(
    client, gold_ring, todays_gold_rate
):
    body = client.get("/rates/today").json()
    assert body["all_rates_set"] is True
    assert body["missing"] == []


def test_yesterdays_rate_does_not_count_as_today(client, session, gold_ring, yesterday):
    """Stale-rate rule: an old rate must never stand in for today's."""
    from services import rates as rates_service

    rates_service.set_rate(
        session,
        metal="gold",
        purity="18K",
        rate_per_gram=Decimal("6000"),
        effective_date=yesterday,
    )
    session.commit()

    body = client.get("/rates/today").json()
    assert body["rates"] == []
    assert body["all_rates_set"] is False


def test_rate_history_returns_every_insert(client, admin_headers, session):
    for rate in ("6000", "6100", "6200"):
        client.post(
            "/admin/rates",
            json={"metal": "gold", "purity": "18K", "rate_per_gram": rate},
            headers=admin_headers,
        )

    history = client.get(
        "/admin/rates/history", params={"metal": "gold", "purity": "18K"}, headers=admin_headers
    ).json()
    assert [row["rate_per_gram"] for row in history] == [6200.0, 6100.0, 6000.0]


def test_rate_lookup_normalizes_purity_case(client, admin_headers, gold_ring):
    """'18k' typed by the owner must satisfy the 18K products."""
    client.post(
        "/admin/rates",
        json={"metal": "Gold", "purity": "18k", "rate_per_gram": "6000"},
        headers=admin_headers,
    )
    body = client.get("/rates/today").json()
    assert body["all_rates_set"] is True


def test_backdated_rate_can_be_set_explicitly(client, admin_headers, yesterday):
    """Useful for reconstructing history; must not affect today."""
    response = client.post(
        "/admin/rates",
        json={
            "metal": "gold",
            "purity": "18K",
            "rate_per_gram": "5900",
            "effective_date": yesterday.isoformat(),
        },
        headers=admin_headers,
    )
    assert response.status_code == 201
    assert client.get("/rates/today").json()["rates"] == []

    backdated = client.get("/rates/today", params={"date": yesterday.isoformat()}).json()
    assert len(backdated["rates"]) == 1
