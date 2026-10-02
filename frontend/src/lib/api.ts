import type { Product, ProductList, RatesToday } from "./types";

export const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8000";

/** Thrown when the FastAPI backend is unreachable, so pages can say so plainly. */
export class BackendUnreachable extends Error {
  constructor(public readonly cause?: unknown) {
    super("Backend unreachable");
  }
}

/**
 * Prices are live and must never be cached — the owner can change the day's
 * rate at any moment and the whole catalogue re-prices.
 */
async function get<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  } catch (error) {
    throw new BackendUnreachable(error);
  }
  if (response.status === 404) {
    return null as T;
  }
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getProducts(params: Record<string, string | undefined> = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const suffix = query.toString() ? `?${query}` : "";
  return get<ProductList>(`/products${suffix}`);
}

export function getProduct(slug: string) {
  return get<Product | null>(`/products/${encodeURIComponent(slug)}`);
}

export function getRatesToday() {
  return get<RatesToday>("/rates/today");
}
