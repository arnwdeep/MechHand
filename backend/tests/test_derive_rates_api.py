"""Deriving per-purity rates from a pure-metal rate, through the API."""

from __future__ import annotations

import os
import uuid
from decimal import Decimal

import pytest

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL not set"
)


def test_preview_derives_every_standard_gold_purity(client, admin_headers):
    body = client.get(
        "/admin/rates/derive",
        params={"pure_rate_per_gram": 10000, "metal": "gold"},
        headers=admin_headers,
    ).json()

    assert body["pure_purity"] == "24K"
    by_purity = {d["purity"]: d["rate_per_gram"] for d in body["derived"]}
    assert by_purity["24K"] == 10000.00
    assert by_purity["22K"] == 9166.67
    assert by_purity["18K"] == 7500.00
    assert by_purity["14K"] == 5833.33


def test_preview_saves_nothing(client, admin_headers, session):
    from models import MetalRate

    client.get(
        "/admin/rates/derive",
        params={"pure_rate_per_gram": 10000},
        headers=admin_headers,
    )
    assert session.query(MetalRate).count() == 0, "preview must not write rates"


def test_preview_reports_how_many_pieces_each_purity_moves(
    client, admin_headers, gold_ring
):
    """'Which product has which' — the owner sees the blast radius."""
    body = client.get(
        "/admin/rates/derive",
        params={"pure_rate_per_gram": 8000},
        headers=admin_headers,
    ).json()
    counts = {d["purity"]: d["product_count"] for d in body["derived"]}
    assert counts["18K"] == 1
    assert counts["22K"] == 0


def test_preview_requires_admin(client):
    assert client.get("/admin/rates/derive", params={"pure_rate_per_gram": 8000}).status_code == 401


def test_preview_rejects_non_positive_pure_rate(client, admin_headers):
    response = client.get(
        "/admin/rates/derive", params={"pure_rate_per_gram": 0}, headers=admin_headers
    )
    assert response.status_code == 422


def test_preview_rejects_unknown_metal(client, admin_headers):
    response = client.get(
        "/admin/rates/derive",
        params={"pure_rate_per_gram": 8000, "metal": "platinum"},
        headers=admin_headers,
    )
    assert response.status_code == 422


def test_bulk_save_inserts_every_rate(client, admin_headers, session):
    from models import MetalRate

    response = client.post(
        "/admin/rates/bulk",
        json={
            "rates": [
                {"metal": "gold", "purity": "22K", "rate_per_gram": "9166.67"},
                {"metal": "gold", "purity": "18K", "rate_per_gram": "7500"},
            ]
        },
        headers=admin_headers,
    )
    assert response.status_code == 201
    assert len(response.json()) == 2
    assert session.query(MetalRate).count() == 2


def test_bulk_save_is_all_or_nothing(client, admin_headers, session):
    """A half-applied update would leave part of the catalogue on yesterday."""
    from models import MetalRate

    response = client.post(
        "/admin/rates/bulk",
        json={
            "rates": [
                {"metal": "gold", "purity": "22K", "rate_per_gram": "9166.67"},
                {"metal": "gold", "purity": "18K", "rate_per_gram": "-5"},
            ]
        },
        headers=admin_headers,
    )
    assert response.status_code == 422
    assert session.query(MetalRate).count() == 0, "no rate should have survived"


def test_bulk_save_requires_admin(client):
    response = client.post(
        "/admin/rates/bulk",
        json={"rates": [{"metal": "gold", "purity": "18K", "rate_per_gram": "7500"}]},
    )
    assert response.status_code == 401


def test_derived_rates_then_price_a_product(client, admin_headers, gold_ring):
    """End to end: one pure rate in, a real per-purity price out."""
    preview = client.get(
        "/admin/rates/derive",
        params={"pure_rate_per_gram": 8000},
        headers=admin_headers,
    ).json()
    eighteen = next(d for d in preview["derived"] if d["purity"] == "18K")
    assert eighteen["rate_per_gram"] == 6000.00

    client.post(
        "/admin/rates/bulk",
        json={
            "rates": [
                {
                    "metal": "gold",
                    "purity": "18K",
                    "rate_per_gram": str(eighteen["rate_per_gram"]),
                }
            ]
        },
        headers=admin_headers,
    )

    # Pure 8,000/g → 18K 6,000/g → spec case A exactly.
    price = client.get(f"/products/{gold_ring.slug}").json()["price"]
    assert price["total"] == 36719.50


def test_owner_can_override_a_derived_rate_before_saving(client, admin_headers, gold_ring):
    """The trade does not always sell at the metallurgical ratio."""
    client.post(
        "/admin/rates/bulk",
        json={"rates": [{"metal": "gold", "purity": "18K", "rate_per_gram": "6100"}]},
        headers=admin_headers,
    )
    price = client.get(f"/products/{gold_ring.slug}").json()["price"]
    assert price["rate_per_gram"] == 6100.0


def test_rates_today_lists_purities_with_product_counts(client, session, gold_ring):
    from models import Product

    session.add(
        Product(
            id=uuid.uuid4(),
            name="Jhumkas",
            slug="jhumkas",
            type="diamond",
            metal="gold",
            purity="22K",
            net_weight_grams=Decimal("8.400"),
            gross_weight_grams=Decimal("9.100"),
            diamond_value=Decimal("34000"),
            occasion=[],
            images=[],
            videos=[],
        )
    )
    session.commit()

    purities = client.get("/rates/today").json()["purities"]
    by_key = {(p["metal"], p["purity"]): p for p in purities}

    assert by_key[("gold", "18K")]["product_count"] == 1
    assert by_key[("gold", "22K")]["product_count"] == 1
    assert by_key[("gold", "18K")]["fineness"] == 0.75
    assert by_key[("gold", "22K")]["rate_per_gram"] is None


def test_known_purities_endpoint(client, admin_headers):
    gold = client.get("/admin/purities", params={"metal": "gold"}, headers=admin_headers).json()
    assert gold[0] == "24K"
    assert "22K" in gold and "18K" in gold
