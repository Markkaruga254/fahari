"use client";

import { useEffect, useState } from "react";
import { DAY_OPTIONS, percent, type Components, type PrioritiesResponse } from "../../lib/api";

// Live dashboard view. First paint uses server-rendered `initial` data; this
// component then polls the same-origin proxy (/api/priorities, which holds
// the dashboard key server-side) every 8 seconds and updates in place.
// Polling pauses while the tab is hidden.
const POLL_MS = 8000;

const CATEGORY_COLORS: Record<string, string> = {
  water: "#F2A900",
  roads: "#2F6B4F",
  health: "#C4572E",
  education: "#D4A373",
  other: "#8C887B",
};

const COMPONENT_LABELS: { key: keyof Components; label: string }[] = [
  { key: "voice", label: "Voice" },
  { key: "ward_share", label: "Ward share" },
  { key: "persistence", label: "Persistence" },
  { key: "spread", label: "Spread" },
];

function formatUpdated(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Nairobi",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function DashboardLive({
  initial,
  days,
  ward,
  initialCategory,
}: {
  initial: PrioritiesResponse;
  days: number;
  ward: string;
  initialCategory: string;
}) {
  const [data, setData] = useState(initial);
  const [category, setCategory] = useState(initialCategory);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const poll = async () => {
      if (document.hidden) return;
      try {
        const q = new URLSearchParams({ days: String(days), limit: "50" });
        if (ward) q.set("ward", ward);
        const res = await fetch(`/api/priorities?${q.toString()}`, { cache: "no-store" });
        const body = (await res.json()) as
          | { ok: true; data: PrioritiesResponse }
          | { ok: false; message: string };
        if (body.ok) {
          setData(body.data);
          setLiveError(null);
        } else {
          setLiveError(body.message);
        }
      } catch {
        setLiveError("Live update failed. Showing the last received data.");
      }
    };

    const timer = setInterval(poll, POLL_MS);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [days, ward]);

  const items = category ? data.items.filter((item) => item.category === category) : data.items;
  const wards = new Set(data.items.map((item) => item.ward)).size;
  const categories = Array.from(new Set(data.items.map((item) => item.category))).sort();
  const weights = data.method.weights as Components;

  const totalReports = data.items.reduce((sum, item) => sum + item.reports, 0);
  const breakdown = categories.map((name) => {
    const rows = data.items.filter((item) => item.category === name);
    return {
      name,
      reports: rows.reduce((sum, item) => sum + item.reports, 0),
      reporters: rows.reduce((sum, item) => sum + item.reporters, 0),
    };
  });
  const CIRCLE = 2 * Math.PI * 38;
  let offset = 0;
  const segments = breakdown.map((row) => {
    const share = totalReports > 0 ? row.reports / totalReports : 0;
    const seg = { ...row, share, dash: share * CIRCLE, offset };
    offset -= share * CIRCLE;
    return seg;
  });
  const top = segments.length > 0 ? segments.reduce((a, b) => (b.share > a.share ? b : a)) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-border-subtle font-mono text-[11px] uppercase text-savanna-amber tracking-wider">
              <span className="w-2 h-2 rounded-full bg-savanna-amber"></span>
              Planner dashboard
            </span>
            {data.contains_synthetic_data && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-terracotta/15 border border-terracotta/30 text-terracotta font-mono text-[9px] tracking-widest uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse"></span>
                Synthetic demo data
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-sand-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-baobab-green animate-pulse"></span>
              {hidden ? "Paused (tab hidden)" : "Live · updates every 8s"}
            </span>
            <span>Updated {formatUpdated(data.generated_at)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
            Constituency priorities, ranked by{" "}
            <span className="font-editorial italic font-normal text-savanna-amber">
              community voice
            </span>
            .
          </h1>
          <form className="flex flex-wrap items-end gap-3" method="get">
            <label className="grid gap-1.5 text-xs font-bold">
              Window
              <select
                name="days"
                defaultValue={String(days)}
                className="px-3 py-2 rounded-lg border border-border-strong bg-surface-card font-mono text-xs"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-bold">
              Ward
              <input
                name="ward"
                defaultValue={ward}
                maxLength={120}
                placeholder="All wards"
                className="px-3 py-2 rounded-lg border border-border-strong bg-surface-card font-mono text-xs"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-bold">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border-strong bg-surface-card font-mono text-xs"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-savanna-amber hover:bg-[#e09b00] text-obsidian font-display text-xs font-bold transition-all active:scale-[0.98]"
            >
              Apply filters
            </button>
          </form>
        </div>
      </header>

      {liveError && (
        <div className="px-4 py-3 rounded-xl border border-terracotta/30 bg-terracotta/10 font-mono text-xs text-terracotta">
          {liveError}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-surface-card rounded-xl p-5 border border-border-strong flex flex-col gap-2">
          <span className="font-mono text-[10px] text-sand-muted uppercase tracking-wider">
            // Reports considered
          </span>
          <span className="font-display text-3xl font-bold text-sand">{data.reports_considered}</span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">
            {data.synthetic_reports} synthetic
          </span>
        </div>
        <div className="bg-surface-card rounded-xl p-5 border border-border-strong flex flex-col gap-2">
          <span className="font-mono text-[10px] text-sand-muted uppercase tracking-wider">
            // Priorities ranked
          </span>
          <span className="font-display text-3xl font-bold text-savanna-amber">
            {data.items.length}
          </span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">ward / need pairs</span>
        </div>
        <div className="bg-surface-card rounded-xl p-5 border border-border-strong flex flex-col gap-2">
          <span className="font-mono text-[10px] text-sand-muted uppercase tracking-wider">
            // Wards covered
          </span>
          <span className="font-display text-3xl font-bold text-baobab-green">{wards}</span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">distinct wards</span>
        </div>
        <div className="bg-surface-card rounded-xl p-5 border border-border-strong flex flex-col gap-2">
          <span className="font-mono text-[10px] text-sand-muted uppercase tracking-wider">
            // Window
          </span>
          <span className="font-display text-3xl font-bold text-sand">{data.window_days}</span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">days</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 bg-surface-card rounded-xl p-5 border border-border-strong flex flex-col gap-4">
          <div>
            <span className="font-mono text-[11px] text-savanna-amber uppercase tracking-wider">
              // Algorithmic citizen ranking
            </span>
            <h2 className="font-display text-xl font-bold text-sand mt-1">Verified Priority Clusters</h2>
          </div>
          {items.length === 0 ? (
            <p className="font-body text-sm text-sand-muted py-8 text-center">
              No priorities match these filters yet. Try a wider window or clear the ward and
              category filters.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={`${item.rank}-${item.ward}-${item.category}`}
                  className="bg-surface-elevated hover:bg-surface-elevated rounded-xl p-4 border border-border-subtle transition-all flex flex-col gap-3"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === item.rank ? null : item.rank)}
                    aria-expanded={expanded === item.rank}
                    className="flex flex-col gap-3 text-left w-full"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[11px] px-2.5 py-1 rounded font-bold ${
                            item.rank === 1
                              ? "bg-savanna-amber text-obsidian"
                              : "bg-surface-elevated border border-border-strong text-sand"
                          }`}
                        >
                          #{String(item.rank).padStart(2, "0")}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-savanna-amber/15 text-savanna-amber font-mono text-[10px] uppercase">
                          {item.category}
                        </span>
                        <span className="font-mono text-xs text-sand-muted">{item.ward}</span>
                      </div>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-[10px] text-sand-muted uppercase">Score</span>
                        <span className="text-lg font-bold text-savanna-amber">{item.score}</span>
                        <span className="text-[10px] text-sand-muted">/100</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden border border-border-subtle">
                      <div
                        className="bg-savanna-amber h-full rounded-full"
                        style={{ width: `${percent(item.score)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-sand-muted">
                      <span>
                        {item.reporters} residents · {item.reports} reports · {item.active_days}{" "}
                        active days
                      </span>
                      <span className="text-savanna-amber">
                        {expanded === item.rank ? "Hide receipts −" : "Inspect receipts +"}
                      </span>
                    </div>
                  </button>
                  {expanded === item.rank && (
                    <div className="pt-3 border-t border-border-subtle flex flex-col gap-2.5">
                      {COMPONENT_LABELS.map(({ key, label }) => (
                        <div key={key} className="flex flex-col gap-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-sand">{label}</span>
                            <span className="text-sand-muted">
                              {percent(item.components[key])}% · weight{" "}
                              {Math.round(weights[key] * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle">
                            <div
                              className="bg-baobab-green h-full rounded-full"
                              style={{ width: `${percent(item.components[key])}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      <p className="font-mono text-[10px] text-sand-muted">
                        {item.ward_reporters} reporters in ward · {item.wards_with_category} of{" "}
                        {item.total_wards} wards report {item.category}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="font-mono text-[11px] text-sand-muted">
            Showing {items.length} of {data.items.length} ranked needs · ranks are
            constituency-wide even when filtered.
          </p>
        </section>

        <section className="lg:col-span-4 bg-surface-card rounded-xl p-5 border border-border-strong flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-sand-muted uppercase tracking-wider">
              // Category breakdown
            </span>
            <span className="font-mono text-[11px] text-savanna-amber">
              N={data.reports_considered}
            </span>
          </div>
          {totalReports > 0 && top && (
            <div className="flex flex-col items-center py-2 relative">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Reports by category, top category ${top.name}`}>
                <circle cx="50" cy="50" fill="none" r="38" stroke="#232620" strokeWidth="12" />
                {segments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke={CATEGORY_COLORS[seg.name] ?? "#8C887B"}
                    strokeDasharray={`${seg.dash} ${CIRCLE}`}
                    strokeDashoffset={seg.offset}
                    strokeWidth="12"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-2xl font-bold text-sand">
                  {Math.round(top.share * 100)}%
                </span>
                <span className="font-mono text-[10px] text-savanna-amber tracking-widest uppercase">
                  {top.name} dominant
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 font-body text-sm">
            {breakdown.map((row) => (
              <div key={row.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ background: CATEGORY_COLORS[row.name] ?? "#8C887B" }}
                  ></span>
                  <span className="text-sand capitalize">{row.name}</span>
                </div>
                <span className="font-mono text-xs text-sand font-bold">
                  {totalReports > 0 ? Math.round((row.reports / totalReports) * 100) : 0}%{" "}
                  <span className="text-sand-muted font-normal">({row.reports})</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="font-mono text-[11px] text-sand-muted border border-border-subtle rounded-xl px-4 py-3">
        Roadmap — not live data: ward map, live report feed, urgency and sentiment, project status
        and budget tracking, engineer dispatch.
      </p>
    </div>
  );
}
