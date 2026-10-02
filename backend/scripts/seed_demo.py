"""Seed a few diamond pieces and today's rates so the API has something to serve.

    python -m scripts.seed_demo              products + today's rates
    python -m scripts.seed_demo --no-rates   products only

``--no-rates`` leaves the catalogue in the state it is in every morning before
the owner sets the day's rate: prices hidden, buying disabled, a loud warning on
the owner screen. Useful for demonstrating the stale-rate rule, which is
otherwise hard to reach on demand because rates can never be un-set.

Safe to re-run: products are upserted by slug, and rates are inserted (never
updated) because metal_rates is append-only.
"""

from __future__ import annotations

import sys
import uuid
from decimal import Decimal

from sqlalchemy import select

from core.db import SessionLocal
from models import Product
from services import rates as rates_service

PRODUCTS = [
    {
        "name": "Diamond Solitaire Ring",
        "slug": "diamond-solitaire-ring",
        "type": "diamond",
        "metal": "gold",
        "purity": "18K",
        "net_weight_grams": Decimal("3.000"),
        "gross_weight_grams": Decimal("3.500"),
        "diamond_value": Decimal("13800"),
        "category": "rings",
        "occasion": ["wedding", "engagement"],
        "description": "0.230ct solitaire set in 18K gold.",
    },
    {
        "name": "Diamond Stud Earrings",
        "slug": "diamond-stud-earrings",
        "type": "catalogue",
        "metal": "gold",
        "purity": "14K",
        "net_weight_grams": Decimal("2.200"),
        "gross_weight_grams": Decimal("2.600"),
        "diamond_value": Decimal("22000"),
        "category": "earrings",
        "occasion": ["daily", "gifting"],
    },
    {
        "name": "Silver Diamond Pendant",
        "slug": "silver-diamond-pendant",
        "type": "diamond",
        "metal": "silver",
        "purity": "925",
        "net_weight_grams": Decimal("10.000"),
        "gross_weight_grams": Decimal("11.000"),
        "diamond_value": Decimal("5000"),
        "category": "pendants",
        "occasion": ["gifting"],
    },
    {
        "name": "Diamond Jhumka Earrings",
        "slug": "diamond-jhumka-earrings",
        "type": "diamond",
        "metal": "gold",
        "purity": "22K",
        "net_weight_grams": Decimal("8.400"),
        "gross_weight_grams": Decimal("9.100"),
        "diamond_value": Decimal("34000"),
        "category": "jhumkas",
        "occasion": ["wedding", "festive"],
        "description": "Traditional jhumkas in 22K gold with a diamond halo.",
    },
    {
        "name": "Diamond Maang Tikka",
        "slug": "diamond-maang-tikka",
        "type": "diamond",
        "metal": "gold",
        "purity": "18K",
        "net_weight_grams": Decimal("4.600"),
        "gross_weight_grams": Decimal("5.200"),
        "diamond_value": Decimal("28000"),
        "category": "maang-tikka",
        "occasion": ["bridal", "wedding"],
        "description": "Hinged so it follows the head, weighted to sit still on the parting.",
    },
    {
        "name": "Diamond Bangle Pair",
        "slug": "diamond-bangle-pair",
        "type": "catalogue",
        "metal": "gold",
        "purity": "18K",
        "net_weight_grams": Decimal("16.400"),
        "gross_weight_grams": Decimal("17.800"),
        "diamond_value": Decimal("62000"),
        "category": "bangles",
        "occasion": ["daily", "festive"],
        "description": "Sized as a pair so the stack sits even on the wrist.",
    },
    {
        "name": "Bridal Diamond Kamarbandh",
        "slug": "bridal-diamond-kamarbandh",
        "type": "made_to_order",
        "metal": "gold",
        "purity": "22K",
        "net_weight_grams": Decimal("38.000"),
        "gross_weight_grams": Decimal("42.500"),
        "diamond_value": Decimal("210000"),
        "making_rate": Decimal("1500"),
        "category": "kamarbandh",
        "occasion": ["bridal"],
        "description": "Built to hold a drape without pulling it out of line.",
    },
    {
        "name": "Silver Diamond Payal",
        "slug": "silver-diamond-payal",
        "type": "diamond",
        "metal": "silver",
        "purity": "925",
        "net_weight_grams": Decimal("24.000"),
        "gross_weight_grams": Decimal("25.500"),
        "diamond_value": Decimal("8500"),
        "category": "anklets",
        "occasion": ["bridal", "festive"],
        "description": "Silver by tradition — heard before it is seen.",
    },
    {
        "name": "Bespoke Diamond Necklace",
        "slug": "bespoke-diamond-necklace",
        "type": "made_to_order",
        "metal": "gold",
        "purity": "18K",
        "net_weight_grams": Decimal("24.000"),
        "gross_weight_grams": Decimal("28.500"),
        "diamond_value": Decimal("450000"),
        "making_rate": Decimal("1500"),
        "category": "necklaces",
        "occasion": ["bridal"],
    },
]

# Seeded as per-purity rows, the way the owner's screen saves them. These
# happen to be consistent with a pure-gold rate of Rs 8,000/g.
RATES = [
    ("gold", "22K", Decimal("7333.33")),
    ("gold", "18K", Decimal("6000")),
    ("gold", "14K", Decimal("4666.67")),
    ("silver", "925", Decimal("90")),
]


def main() -> None:
    seed_rates = "--no-rates" not in sys.argv

    with SessionLocal() as session:
        for spec in PRODUCTS:
            existing = session.scalar(select(Product).where(Product.slug == spec["slug"]))
            if existing:
                for key, value in spec.items():
                    setattr(existing, key, value)
                print(f"updated  {spec['slug']}")
            else:
                session.add(
                    Product(id=uuid.uuid4(), images=[], videos=[], quantity=1, **spec)
                )
                print(f"created  {spec['slug']}")

        if seed_rates:
            for metal, purity, rate in RATES:
                rates_service.set_rate(
                    session, metal=metal, purity=purity, rate_per_gram=rate
                )
                print(f"rate     {metal} {purity} = Rs {rate}/g")
        else:
            print("rates    skipped — catalogue starts in the no-rate state")

        session.commit()

    if seed_rates:
        print("\nDone. Try: curl localhost:8000/products | python -m json.tool")
    else:
        print("\nDone. Every piece now shows 'price on request'. Set a rate at")
        print("http://localhost:3000/admin/rates to watch the catalogue come alive.")


if __name__ == "__main__":
    main()
