import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/**
 * Preview per-purity rates derived from one pure-metal rate.
 *
 * Proxied rather than computed here: the derivation is money arithmetic, and
 * money arithmetic lives on the server. This route only carries the admin key.
 */
export async function GET(request: Request) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { detail: "ADMIN_API_KEY is not set in the frontend environment." },
      { status: 503 },
    );
  }

  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams({
    pure_rate_per_gram: incoming.get("pure_rate_per_gram") ?? "",
    metal: incoming.get("metal") ?? "gold",
  });

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/admin/rates/derive?${query}`, {
      headers: { "X-Admin-Key": adminKey },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
