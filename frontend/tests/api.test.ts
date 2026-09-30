import test from "node:test";
import assert from "node:assert/strict";
import { buildQuery, fetchPriorities, parseFilters, percent } from "../lib/api.ts";

test("parseFilters clamps days and normalizes ward", () => {
  assert.deepEqual(parseFilters({ days: "7", ward: "  Likoni   Ward " }), { days: 7, ward: "Likoni Ward" });
  assert.deepEqual(parseFilters({ days: "8", ward: ["A", "B"] }), { days: 90, ward: "A" });
});

test("buildQuery encodes ward", () => {
  const q = buildQuery({ days: 30, ward: "Likoni Ward" });
  assert.match(q, /days=30/);
  assert.match(q, /limit=50/);
  assert.match(q, /ward=Likoni\+Ward/);
});

test("API key is sent in header, never URL", async () => {
  let seen: Request | undefined;
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    seen = new Request(input, init);
    return new Response(JSON.stringify({
      generated_at: "2026-09-30T00:00:00Z", window_days: 30, reports_considered: 0,
      synthetic_reports: 0, contains_synthetic_data: true,
      method: { weights: { voice: 0.25, ward_share: 0.25, persistence: 0.25, spread: 0.25 } },
      items: []
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const result = await fetchPriorities({ days: 30, ward: "" }, { BACKEND_URL: "http://api", DASHBOARD_API_KEY: "SECRET-KEY-123" });
  globalThis.fetch = oldFetch;
  assert.equal(result.ok, true);
  assert.equal(seen?.headers.get("X-API-Key"), "SECRET-KEY-123");
  assert.equal(seen?.url.includes("SECRET-KEY-123"), false);
});

test("errors never leak API key", async () => {
  const oldFetch = globalThis.fetch;
  for (const response of [new Response("", { status: 401 }), new Response("", { status: 500 })]) {
    globalThis.fetch = async () => response;
    const result = await fetchPriorities({ days: 30, ward: "" }, { BACKEND_URL: "http://api", DASHBOARD_API_KEY: "SECRET-KEY-123" });
    assert.equal(result.ok, false);
    assert.equal(JSON.stringify(result).includes("SECRET-KEY-123"), false);
  }
  globalThis.fetch = async () => { throw new Error("network SECRET-KEY-123"); };
  const result = await fetchPriorities({ days: 30, ward: "" }, { BACKEND_URL: "http://api", DASHBOARD_API_KEY: "SECRET-KEY-123" });
  globalThis.fetch = oldFetch;
  assert.equal(result.ok, false);
  assert.equal(JSON.stringify(result).includes("SECRET-KEY-123"), false);
});

test("missing environment is a friendly config error", async () => {
  const result = await fetchPriorities({ days: 30, ward: "" }, {});
  assert.deepEqual(result, { ok: false, message: "Dashboard is not configured. Set BACKEND_URL and DASHBOARD_API_KEY." });
});

test("percent is bounded", () => {
  assert.equal(percent(-1), 0);
  assert.equal(percent(0.123), 12);
  assert.equal(percent(2), 100);
});
