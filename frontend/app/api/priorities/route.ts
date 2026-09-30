import { NextResponse } from "next/server";

// Server-side proxy: the browser polls this route, and this route calls the
// backend with the dashboard key. DASHBOARD_API_KEY never reaches the client.
export async function GET(request: Request) {
  const backend = process.env.BACKEND_URL;
  const key = process.env.DASHBOARD_API_KEY;
  if (!backend || !key) {
    return NextResponse.json(
      { ok: false, message: "Dashboard is not configured. Set BACKEND_URL and DASHBOARD_API_KEY." },
      { status: 503 },
    );
  }

  const incoming = new URL(request.url);
  const target = new URL("/priorities", backend.replace(/\/+$/, ""));
  target.searchParams.set("days", incoming.searchParams.get("days") ?? "90");
  target.searchParams.set("limit", "50");
  const ward = incoming.searchParams.get("ward") ?? "";
  if (ward) target.searchParams.set("ward", ward);

  try {
    const res = await fetch(target, {
      headers: { "X-API-Key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401) {
      return NextResponse.json(
        { ok: false, message: "The API rejected the dashboard key." },
        { status: 502 },
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, message: `The API returned HTTP ${res.status}.` },
        { status: 502 },
      );
    }
    const data = await res.json();
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, message: "Could not reach the API." }, { status: 502 });
  }
}
