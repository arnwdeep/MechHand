"""Catalogue endpoints. Every price here is computed live, never read from a column."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from api.deps import get_session
from api.schemas import PriceResultOut, ProductListOut, ProductOut
from models import Product
from services import rates as rates_service
from services.pricing_service import price_for

router = APIRouter(tags=["products"])


def _to_out(product: Product, rates) -> ProductOut:
    result = price_for(product, rates)
    out = ProductOut.model_validate(product)
    # Stale-rate rule: no rate today means price is null and buying is off.
    out.price = PriceResultOut.from_result(result) if result.rate_available else None
    out.is_buyable = product.is_buyable and product.in_stock and result.rate_available
    return out


@router.get("/products", response_model=ProductListOut)
def list_products(
    category: str | None = None,
    metal: str | None = None,
    occasion: str | None = None,
    in_stock: bool | None = None,
    type: str | None = None,
    limit: int = Query(default=24, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> ProductListOut:
    filters = []
    if category:
        filters.append(Product.category == category)
    if metal:
        filters.append(Product.metal == metal.strip().lower())
    if occasion:
        filters.append(Product.occasion.any(occasion))
    if in_stock is not None:
        filters.append(Product.in_stock.is_(in_stock))
    if type:
        # catalogue | made_to_order | diamond — drives which buying path the
        # storefront offers, so it is a filter customers actually want.
        filters.append(Product.type == type.strip().lower())

    total = session.scalar(select(func.count()).select_from(Product).where(*filters)) or 0
    products = session.scalars(
        select(Product)
        .where(*filters)
        .order_by(Product.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    # One rate lookup for the whole page, not one per product.
    rates = rates_service.get_rate_table(session)
    items = [_to_out(product, rates) for product in products]

    return ProductListOut(
        items=items,
        total=total,
        has_unpriced_items=any(item.price is None for item in items),
    )


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, session: Session = Depends(get_session)) -> ProductOut:
    product = session.scalar(select(Product).where(Product.slug == slug))
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return _to_out(product, rates_service.get_rate_table(session))
