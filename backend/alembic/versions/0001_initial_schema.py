"""Initial schema: users, metal_rates, products, orders, order_items, reviews, consultations.

Revision ID: 0001_initial
Revises:
"""

from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

MONEY = sa.Numeric(12, 2)
WEIGHT = sa.Numeric(10, 3)


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    UUID_TYPE = postgresql.UUID(as_uuid=True) if is_postgres else sa.Uuid(as_uuid=True)
    ARRAY_TEXT_TYPE = postgresql.ARRAY(sa.Text()) if is_postgres else sa.JSON()
    JSON_TYPE = postgresql.JSONB() if is_postgres else sa.JSON()
    ARRAY_DEFAULT = sa.text("'{}'::text[]") if is_postgres else sa.text("'[]'")
    JSON_DEFAULT = sa.text("'[]'::jsonb") if is_postgres else sa.text("'[]'")

    op.create_table(
        "users",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("phone", sa.String(20), nullable=True, unique=True),
        sa.Column("email", sa.String(255), nullable=True, unique=True),
        sa.Column("name", sa.String(160), nullable=True),
        sa.Column("google_id", sa.String(64), nullable=True, unique=True),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_phone", "users", ["phone"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_google_id", "users", ["google_id"])

    op.create_table(
        "metal_rates",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("metal", sa.String(16), nullable=False),
        sa.Column("purity", sa.String(16), nullable=False),
        sa.Column("rate_per_gram", MONEY, nullable=False),
        sa.Column("effective_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("rate_per_gram > 0", name="ck_metal_rates_rate_positive"),
    )
    op.create_index(
        "ix_metal_rates_lookup",
        "metal_rates",
        ["metal", "purity", "effective_date", "created_at"],
    )

    if is_postgres:
        op.execute(
            """
            CREATE OR REPLACE FUNCTION metal_rates_append_only() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION
                    'metal_rates is append-only: % is not permitted. Insert a new rate row instead.',
                    TG_OP;
            END;
            $$ LANGUAGE plpgsql;
            """
        )
        op.execute(
            """
            CREATE TRIGGER trg_metal_rates_append_only
            BEFORE UPDATE OR DELETE ON metal_rates
            FOR EACH ROW EXECUTE FUNCTION metal_rates_append_only();
            """
        )

    op.create_table(
        "products",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False, unique=True),
        sa.Column("type", sa.String(20), nullable=False, server_default="diamond"),
        sa.Column("metal", sa.String(16), nullable=False),
        sa.Column("purity", sa.String(16), nullable=False),
        sa.Column("net_weight_grams", WEIGHT, nullable=False),
        sa.Column("gross_weight_grams", WEIGHT, nullable=False),
        sa.Column("diamond_value", MONEY, nullable=True),
        sa.Column("making_rate", MONEY, nullable=True),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column(
            "occasion",
            ARRAY_TEXT_TYPE,
            nullable=False,
            server_default=ARRAY_DEFAULT,
        ),
        sa.Column(
            "images", JSON_TYPE, nullable=False, server_default=JSON_DEFAULT
        ),
        sa.Column(
            "videos", JSON_TYPE, nullable=False, server_default=JSON_DEFAULT
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("in_stock", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("net_weight_grams > 0", name="ck_products_net_weight_positive"),
        sa.CheckConstraint("gross_weight_grams > 0", name="ck_products_gross_weight_positive"),
        sa.CheckConstraint(
            "net_weight_grams <= gross_weight_grams", name="ck_products_net_not_above_gross"
        ),
        sa.CheckConstraint(
            "diamond_value IS NULL OR diamond_value >= 0", name="ck_products_diamond_value_positive"
        ),
        sa.CheckConstraint(
            "making_rate IS NULL OR making_rate >= 0", name="ck_products_making_rate_positive"
        ),
        sa.CheckConstraint("quantity >= 0", name="ck_products_quantity_positive"),
        sa.CheckConstraint(
            "type IN ('catalogue', 'made_to_order', 'diamond')", name="ck_products_type_valid"
        ),
    )
    op.create_index("ix_products_slug", "products", ["slug"])
    op.create_index("ix_products_category", "products", ["category"])
    op.create_index("ix_products_metal_purity", "products", ["metal", "purity"])

    op.create_table(
        "orders",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column(
            "user_id", UUID_TYPE, sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("total", MONEY, nullable=False),
        sa.Column("price_snapshot", JSON_TYPE, nullable=False),
        sa.Column("razorpay_order_id", sa.String(64), nullable=True, unique=True),
        sa.Column("razorpay_payment_id", sa.String(64), nullable=True),
        sa.Column("payment_status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("invoice_url", sa.Text(), nullable=True),
        sa.Column("shipping_address", JSON_TYPE, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("total >= 0", name="ck_orders_total_positive"),
    )
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_razorpay_order_id", "orders", ["razorpay_order_id"])
    op.create_index("ix_orders_razorpay_payment_id", "orders", ["razorpay_payment_id"])

    op.create_table(
        "order_items",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column(
            "order_id",
            UUID_TYPE,
            sa.ForeignKey("orders.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            UUID_TYPE,
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column("price_snapshot", JSON_TYPE, nullable=False),
        sa.Column("qty", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("qty > 0", name="ck_order_items_qty_positive"),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"])

    op.create_table(
        "reviews",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column(
            "product_id",
            UUID_TYPE,
            sa.ForeignKey("products.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id", UUID_TYPE, sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=True),
        sa.Column("approved", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating_range"),
    )
    op.create_index("ix_reviews_product_id", "reviews", ["product_id"])
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"])
    op.create_index("ix_reviews_approved", "reviews", ["approved"])

    op.create_table(
        "consultations",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column(
            "product_id",
            UUID_TYPE,
            sa.ForeignKey("products.id"),
            nullable=True,
        ),
        sa.Column("preferred_datetime", sa.DateTime(timezone=True), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="new"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_consultations_phone", "consultations", ["phone"])
    op.create_index("ix_consultations_product_id", "consultations", ["product_id"])
    op.create_index("ix_consultations_status", "consultations", ["status"])


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    op.drop_table("consultations")
    op.drop_table("reviews")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("products")
    if is_postgres:
        op.execute("DROP TRIGGER IF EXISTS trg_metal_rates_append_only ON metal_rates;")
        op.execute("DROP FUNCTION IF EXISTS metal_rates_append_only();")
    op.drop_table("metal_rates")
    op.drop_table("users")

