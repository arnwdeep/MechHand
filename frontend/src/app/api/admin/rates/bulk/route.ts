import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/** Save several reviewed per-purity rates at once. All or nothing. */
export async function POST(request: Request) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { detail: "ADMIN_API_KEY is not set in the frontend environment." },
      { status: 503 },
    );
  }

  const body = await request.json();

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/admin/rates/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable." }, { status: 502 });
  }

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
