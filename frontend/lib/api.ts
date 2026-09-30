export type Components = {
  voice: number;
  ward_share: number;
  persistence: number;
  spread: number;
};

export type PriorityItem = {
  rank: number;
  ward: string;
  category: string;
  score: number;
  reporters: number;
  reports: number;
  active_days: number;
  ward_reporters: number;
  wards_with_category: number;
  total_wards: number;
  components: Components;
};

export type PrioritiesResponse = {
  generated_at: string;
  window_days: number;
  reports_considered: number;
  synthetic_reports: number;
  contains_synthetic_data: boolean;
  method: {
    weights: Components;
    [key: string]: unknown;
  };
  items: PriorityItem[];
};

export type Filters = { days: number; ward: string };
export type Result =
  | { ok: true; data: PrioritiesResponse }
  | { ok: false; message: string };
export type Env = { BACKEND_URL?: string; DASHBOARD_API_KEY?: string };

export const DAY_OPTIONS = [7, 30, 90, 365] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): Filters {
  const rawDays = Number(first(searchParams.days));
  const days = DAY_OPTIONS.includes(rawDays as (typeof DAY_OPTIONS)[number]) ? rawDays : 90;
  const ward = (first(searchParams.ward) ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  return { days, ward };
}

export function buildQuery(filters: Filters): string {
  const q = new URLSearchParams({ days: String(filters.days), limit: "50" });
  if (filters.ward) q.set("ward", filters.ward);
  return q.toString();
}

export async function fetchPriorities(filters: Filters, env: Env): Promise<Result> {
  if (!env.BACKEND_URL || !env.DASHBOARD_API_KEY) {
    return { ok: false, message: "Dashboard is not configured. Set BACKEND_URL and DASHBOARD_API_KEY." };
  }

  const base = env.BACKEND_URL.replace(/\/+$/, "");
  try {
    const response = await fetch(`${base}/priorities?${buildQuery(filters)}`, {
      headers: { "X-API-Key": env.DASHBOARD_API_KEY },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (response.status === 401) return { ok: false, message: "The API rejected the dashboard key." };
    if (!response.ok) return { ok: false, message: `The API returned HTTP ${response.status}.` };

    const data = (await response.json()) as PrioritiesResponse;
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Could not reach the API." };
  }
}

export function percent(value: number): number {
  const bounded = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return Math.round(bounded * 100);
}
