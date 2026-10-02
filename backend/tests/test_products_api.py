"""Catalogue endpoints — live pricing end to end, and the stale-rate rule."""

from __future__ import annotations

import os
import uuid
from decimal import Decimal

import pytest

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL not set"
)


def test_pdp_returns_the_full_live_breakup(client, gold_ring, todays_gold_rate):
    """Case A, all the way through the API."""
    body = client.get(f"/products/{gold_ring.slug}").json()

    assert body["price"]["rate_available"] is True
    assert body["price"]["total"] == 36719.50
    assert body["price"]["currency"] == "INR"
    assert [(line["label"], line["amount"]) for line in body["price"]["breakup"]] == [
        ("Gold value", 18000.00),
        ("Diamond value", 13800.00),
        ("Making", 3850.00),
        ("GST 3%", 1069.50),
    ]
    assert body["is_buyable"] is True


def test_no_rate_today_hides_price_and_disables_buying(client, gold_ring):
    """Stale-rate rule: price null, buying off. Never a stale or zero price."""
    body = client.get(f"/products/{gold_ring.slug}").json()

    assert body["price"] is None
    assert body["is_buyable"] is False


def test_changing_the_rate_reprices_the_catalogue(client, admin_headers, gold_ring, session):
    """No price is stored, so one rate insert moves every product."""
    client.post(
        "/admin/rates",
        json={"metal": "gold", "purity": "18K", "rate_per_gram": "6000"},
        headers=admin_headers,
    )
    first = client.get(f"/products/{gold_ring.slug}").json()["price"]["total"]

    client.post(
        "/admin/rates",
        json={"metal": "gold", "purity": "18K", "rate_per_gram": "6500"},
        headers=admin_headers,
    )
    second = client.get(f"/products/{gold_ring.slug}").json()["price"]["total"]

    # +500/g on 3.000g net = +1500 subtotal, +45 GST
    assert second == pytest.approx(first + 1545.00)


def test_product_never_stores_a_computed_price(session, gold_ring):
    from models import Product

    assert not hasattr(Product, "price")
    assert not hasattr(Product, "total")


def test_list_flags_when_some_items_have_no_price(client, session, gold_ring, todays_gold_rate):
    """A silver piece with no silver rate must not blank out the gold ones."""
    from models import Product

    session.add(
        Product(
            id=uuid.uuid4(),
            name="Silver Diamond Pendant",
            slug="silver-diamond-pendant",
            type="diamond",
            metal="silver",
            purity="925",
            net_weight_grams=Decimal("10.000"),
            gross_weight_grams=Decimal("11.000"),
            diamond_value=Decimal("5000"),
            occasion=[],
            images=[],
            videos=[],
        )
    )
    session.commit()

    body = client.get("/products").json()
    assert body["total"] == 2
    assert body["has_unpriced_items"] is True

    by_slug = {item["slug"]: item for item in body["items"]}
    assert by_slug["diamond-solitaire-ring"]["price"]["total"] == 36719.50
    assert by_slug["silver-diamond-pendant"]["price"] is None


def test_silver_piece_prices_against_the_silver_rate(client, session, admin_headers):
    """Test case B through the API."""
    from models import Product

    session.add(
        Product(
            id=uuid.uuid4(),
            name="Silver Diamond Pendant",
            slug="silver-diamond-pendant",
            type="diamond",
            metal="silver",
            purity="925",
            net_weight_grams=Decimal("10.000"),
            gross_weight_grams=Decimal("11.000"),
            diamond_value=Decimal("5000"),
            occasion=[],
            images=[],
            videos=[],
        )
    )
    session.commit()

    client.post(
        "/admin/rates",
        json={"metal": "silver", "purity": "925", "rate_per_gram": "90"},
        headers=admin_headers,
    )

    price = client.get("/products/silver-diamond-pendant").json()["price"]
    assert price["total"] == 18540.00
    assert price["breakup"][0]["label"] == "Silver value"


def test_made_to_order_is_never_directly_buyable(client, session, todays_gold_rate):
    from models import Product

    session.add(
        Product(
            id=uuid.uuid4(),
            name="Bespoke Necklace",
            slug="bespoke-necklace",
            type="made_to_order",
            metal="gold",
            purity="18K",
            net_weight_grams=Decimal("20.000"),
            gross_weight_grams=Decimal("22.000"),
            diamond_value=Decimal("150000"),
            occasion=[],
            images=[],
            videos=[],
        )
    )
    session.commit()

    body = client.get("/products/bespoke-necklace").json()
    assert body["price"]["rate_available"] is True, "still shows an indicative price"
    assert body["is_buyable"] is False, "routes to consultation, not cart"


def test_out_of_stock_is_not_buyable(client, session, gold_ring, todays_gold_rate):
    gold_ring.in_stock = False
    session.commit()

    body = client.get(f"/products/{gold_ring.slug}").json()
    assert body["is_buyable"] is False


def test_unknown_slug_returns_404(client):
    assert client.get("/products/does-not-exist").status_code == 404


def test_price_snapshot_records_the_rate_it_was_built_from(session, gold_ring, todays_gold_rate):
    """The snapshot is what P3's Razorpay order and the invoice are built from."""
    from services import rates as rates_service
    from services.pricing_service import build_price_snapshot, price_for, snapshot_total

    rates = rates_service.get_rate_table(session)
    result = price_for(gold_ring, rates)
    snapshot = build_price_snapshot(gold_ring, result)

    assert snapshot["total"] == "36719.50"
    assert snapshot["rate"] == {"metal": "gold", "purity": "18K", "rate_per_gram": "6000.00"}
    assert snapshot["weights"] == {"net_grams": "3.000", "gross_grams": "3.500"}
    assert snapshot_total(snapshot) == Decimal("36719.50")
    # Money in the snapshot is stringified — no float round-trip can shift a paise.
    assert all(isinstance(line["amount"], str) for line in snapshot["breakup"])


def test_snapshot_spelling_is_identical_in_memory_and_from_the_db(
    session, gold_ring, todays_gold_rate
):
    """A Decimal carries its own scale, so an unquantized snapshot would spell
    the same rate "6000" before a DB round-trip and "6000.00" after."""
    from services import rates as rates_service
    from services.pricing_service import build_price_snapshot, price_for

    rates = rates_service.get_rate_table(session)
    in_memory = build_price_snapshot(gold_ring, price_for(gold_ring, rates))

    session.expire_all()  # force a reload through the Numeric columns
    session.refresh(gold_ring)
    from_db = build_price_snapshot(gold_ring, price_for(gold_ring, rates))

    assert in_memory["rate"] == from_db["rate"]
    assert in_memory["weights"] == from_db["weights"]
    assert in_memory["total"] == from_db["total"]


def test_snapshot_refuses_to_record_an_unavailable_price(session, gold_ring):
    from services import rates as rates_service
    from services.pricing_service import build_price_snapshot, price_for

    result = price_for(gold_ring, rates_service.get_rate_table(session))
    with pytest.raises(ValueError, match="unavailable"):
        build_price_snapshot(gold_ring, result)


def test_database_rejects_net_weight_above_gross(session):
    """The engine rejects it; the DB must too, so bad rows can't be created."""
    from sqlalchemy.exc import IntegrityError

    from models import Product

    session.add(
        Product(
            id=uuid.uuid4(),
            name="Bad Weights",
            slug="bad-weights",
            type="diamond",
            metal="gold",
            purity="18K",
            net_weight_grams=Decimal("5.000"),
            gross_weight_grams=Decimal("3.000"),
            occasion=[],
            images=[],
            videos=[],
        )
    )
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()
