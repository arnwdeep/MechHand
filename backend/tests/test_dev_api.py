"""The /dev price calculator.

These need no database — the endpoint calls the engine directly — so unlike the
rest of tests/ they run everywhere, including CI's lint-only path.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def dev_client() -> TestClient:
    import main

    return TestClient(main.app)


def preview(client: TestClient, **overrides):
    body = {
        "metal": "gold",
        "purity": "18K",
        "net_weight_grams": "3.000",
        "gross_weight_grams": "3.500",
        "diamond_value": "13800",
        "rate_per_gram": "6000",
    }
    body.update(overrides)
    return client.post("/dev/price-preview", json=body)


def test_case_a_through_the_calculator(dev_client):
    body = preview(dev_client).json()
    assert body["total"] == 36719.50
    assert [line["label"] for line in body["breakup"]] == [
        "Gold value",
        "Diamond value",
        "Making",
        "GST 3%",
    ]


def test_case_b_silver(dev_client):
    body = preview(
        dev_client,
        metal="silver",
        purity="925",
        net_weight_grams="10.0",
        gross_weight_grams="11.0",
        diamond_value="5000",
        rate_per_gram="90",
    ).json()
    assert body["total"] == 18540.00


def test_case_c_blank_rate_is_the_unavailable_state(dev_client):
    """A blank rate field must reproduce the stale-rate state, not error."""
    body = preview(dev_client, rate_per_gram=None).json()
    assert body["rate_available"] is False
    assert body["total"] is None
    assert body["breakup"] == []


def test_case_d_custom_making_rate(dev_client):
    assert preview(dev_client, making_rate="1500").json()["total"] == 38161.50


def test_case_e_no_diamond(dev_client):
    body = preview(dev_client, diamond_value="0").json()
    assert body["total"] == 22505.50
    assert "Diamond value" not in [line["label"] for line in body["breakup"]]


def test_nearest_rupee_can_be_previewed_without_changing_config(dev_client):
    """Lets the client see the rounding decision before we commit to it."""
    body = preview(dev_client, rounding="nearest_rupee").json()
    assert body["total"] == 36720

    lines = sum(line["amount"] for line in body["breakup"])
    assert lines != body["total"], (
        "nearest-rupee makes the breakup stop summing to the total — "
        "this is the discrepancy to raise with the client"
    )


def test_making_rate_zero_is_not_treated_as_blank(dev_client):
    """0 must mean 'waived', not 'fall back to 1100'."""
    body = preview(dev_client, making_rate="0").json()
    amounts = {line["label"]: line["amount"] for line in body["breakup"]}
    assert amounts["Making"] == 0.0


def test_invalid_weights_are_rejected_with_the_guardrail_message(dev_client):
    response = preview(dev_client, net_weight_grams="5", gross_weight_grams="3")
    assert response.status_code == 422
    assert "cannot exceed" in response.json()["detail"]


def test_zero_weight_rejected(dev_client):
    response = preview(dev_client, net_weight_grams="0")
    assert response.status_code == 422
    assert "net_weight_grams" in response.json()["detail"]


def test_calculator_page_is_served(dev_client):
    response = dev_client.get("/dev/calculator")
    assert response.status_code == 200
    assert "Pricing Engine Check" in response.text


def test_dev_router_is_absent_in_production(monkeypatch):
    """The calculator must not be reachable on the live site."""
    import importlib

    import core.config

    monkeypatch.setenv("APP_ENV", "production")
    core.config.get_settings.cache_clear()

    import main

    reloaded = importlib.reload(main)
    paths = reloaded.app.openapi()["paths"]
    assert not any(p.startswith("/dev") for p in paths)

    # Restore for any later module-scoped client.
    monkeypatch.undo()
    core.config.get_settings.cache_clear()
    importlib.reload(main)
