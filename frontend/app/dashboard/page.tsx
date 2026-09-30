import DashboardLive from "../../components/dashboard/DashboardLive";
import { fetchPriorities, parseFilters } from "../../lib/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return (v ?? "").slice(0, 40);
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const result = await fetchPriorities(filters, {
    BACKEND_URL: process.env.BACKEND_URL,
    DASHBOARD_API_KEY: process.env.DASHBOARD_API_KEY,
  });

  if (!result.ok) {
    return (
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <h1 className="font-display text-3xl text-sand font-bold">Planner dashboard</h1>
        <p className="font-body text-sm text-sand-muted mt-2">
          Explainable development priorities from resident reports.
        </p>
        <div className="mt-6 px-4 py-3 rounded-xl border border-terracotta/30 bg-terracotta/10 font-mono text-xs text-terracotta">
          {result.message}
        </div>
      </main>
    );
  }

  return (
    <DashboardLive
      initial={result.data}
      days={filters.days}
      ward={filters.ward}
      initialCategory={first(params.category)}
    />
  );
}
