import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/**
 * Proxy for setting the day's rate.
 *
 * Exists so the admin key stays on the server. The browser posts here with no
 * credentials; this route attaches X-Admin-Key from the server environment and
 * forwards to FastAPI. The key is never shipped to the client bundle.
 */
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
    response = await fetch(`${API_BASE}/admin/rates`, {
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
