/**
 * Shapes shared with the backend.
 *
 * These mirror `backend/api/schemas.py`, which is the source of truth. Nothing
 * here computes anything — the frontend only ever *displays* a PriceResult the
 * server built. If you find yourself wanting arithmetic in this app, it belongs
 * in the pricing engine instead.
 */

export type BreakupLine = {
  label: string;
  amount: number;
};

export type PriceResult = {
  total: number | null;
  currency: "INR";
  breakup: BreakupLine[];
  /** False when no rate is set today: hide the price and disable buying. */
  rate_available: boolean;
  rate_per_gram: number | null;
};

export type ProductType = "catalogue" | "made_to_order" | "diamond";

export type ProductImage = { url?: string; alt?: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  metal: string;
  purity: string;
  net_weight_grams: number;
  gross_weight_grams: number;
  category: string | null;
  occasion: string[];
  images: ProductImage[];
  videos: unknown[];
  description: string | null;
  in_stock: boolean;
  quantity: number;
  /** null when today's rate for this (metal, purity) is missing. */
  price: PriceResult | null;
  is_buyable: boolean;
};

export type ProductList = {
  items: Product[];
  total: number;
  has_unpriced_items: boolean;
};

export type Rate = {
  id: string;
  metal: string;
  purity: string;
  rate_per_gram: number;
  effective_date: string;
  created_at: string;
};

/** One (metal, purity) line on the owner's screen: the rate, and what it moves. */
export type PuritySummary = {
  metal: string;
  purity: string;
  rate_per_gram: number | null;
  /** Live pieces carrying this exact purity. */
  product_count: number;
  /** Fraction of pure metal, e.g. 0.75 for 18K. Null if non-standard. */
  fineness: number | null;
};

export type RatesToday = {
  date: string;
  rates: Rate[];
  /** (metal, purity) pairs live products need but today has no rate for. */
  missing: { metal: string; purity: string }[];
  all_rates_set: boolean;
  purities: PuritySummary[];
};

/** A rate suggested from the pure-metal rate. Not saved until confirmed. */
export type DerivedRate = {
  metal: string;
  purity: string;
  fineness: number;
  rate_per_gram: number;
  product_count: number;
};

export type DeriveRatesResponse = {
  metal: string;
  /** The purity the base rate refers to: "24K" for gold, "999" for silver. */
  pure_purity: string;
  pure_rate_per_gram: number;
  derived: DerivedRate[];
};
