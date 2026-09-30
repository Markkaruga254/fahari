"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch score section: big audited score, five factor bars
// that fill on entering the viewport, and the four metric counters.
const FACTORS = [
  { label: "Frequency & Household Volume (25%)", points: "23.8 / 25 pts", pointsClass: "text-savanna-amber", barClass: "bg-savanna-amber", width: 95 },
  { label: "Severity & Water Health Hazard (25%)", points: "24.2 / 25 pts", pointsClass: "text-terracotta", barClass: "bg-terracotta", width: 97 },
  { label: "Geographic Spread across 3 Sub-locations (20%)", points: "18.5 / 20 pts", pointsClass: "text-baobab-green", barClass: "bg-baobab-green", width: 92 },
  { label: "Persistence Metric (Unresolved > 90 Days) (15%)", points: "12.9 / 15 pts", pointsClass: "text-savanna-amber", barClass: "bg-savanna-amber", width: 86 },
  { label: "Proximity to Maternal Clinic & Schools (15%)", points: "12.0 / 15 pts", pointsClass: "text-baobab-green", barClass: "bg-baobab-green", width: 80 },
];

function ScoreBar({ width, barClass }: { width: number; barClass: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fill, setFill] = useState(`${width}%`);

  useEffect(() => {
    const node = ref.current;
    // SSR and no-JS render the final width; only animate with JS running
    // and no reduced-motion preference.
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setFill("0%");
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          setFill(`${width}%`);
        });
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [width]);

  return (
    <div className="w-full h-2.5 rounded-full bg-surface-elevated overflow-hidden">
      <div
        ref={ref}
        className={`h-full rounded-full ${barClass}`}
        style={{ width: fill, transition: "width 1.1s cubic-bezier(.2,.7,.2,1)" }}
      ></div>
    </div>
  );
}

export default function Score() {
  const sectionRef = useReveal<HTMLElement>();
  const factors = useCountUp(4, 0, " Factors");
  const explainable = useCountUp(100, 0, "%");

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28"
      id="the-score"
    >
      <div className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-savanna-amber uppercase tracking-wider">
          // 04 OPEN FORMULA
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          Why does this ward rank{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">first</span>?
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          No black boxes. A 4-factor priority formula balancing frequency, public health severity,
          and anti-urban bias.
        </p>
      </div>
      <div className="bg-surface-card rounded-card p-6 lg:p-8 border border-border-strong relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-terracotta/20 text-terracotta font-mono text-[10px] uppercase font-bold border border-terracotta/30">
                  CRITICAL PRIORITY #01
                </span>
                <span className="font-mono text-[10px] text-sand-muted">TICKET #MRT-B3-882</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-sand">
                Miritini Central · Borehole #3 Motor Burnout &amp; Salinity
              </h3>
              <p className="font-body text-xs text-sand-muted mt-2 leading-relaxed">
                4,200 residents affected. Saltwater intrusion detected in secondary wellhead. Acute
                queue congestion escalating near primary schools.
              </p>
            </div>
            <div className="bg-surface-elevated p-5 rounded-card border border-border-subtle flex items-end justify-between">
              <div>
                <span className="font-mono text-[10px] text-sand-muted uppercase block">
                  Computed Priority Index
                </span>
                <span className="font-display text-4xl sm:text-5xl font-bold text-savanna-amber">91.4</span>
                <span className="text-sand-muted font-mono text-sm"> / 100</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-baobab-green font-mono text-xs">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Audited
                </span>
                <span className="block text-[11px] text-sand-muted font-mono mt-0.5">
                  Top of Jomvu Sub-County
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border-subtle space-y-1">
              <span className="font-mono text-[10px] text-baobab-green uppercase font-bold tracking-wider">
                // ANTI-BIAS SAFEGUARD
              </span>
              <p className="font-body text-xs text-sand">
                <strong>Small ward vs Large ward:</strong> Dense urban zones cannot drown out rural
                coastal fishing settlements. The formula normalizes volume against geographic spread
                and water vulnerability.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {FACTORS.map((factor) => (
              <div key={factor.label} className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-sand">{factor.label}</span>
                  <span className={`${factor.pointsClass} font-bold`}>{factor.points}</span>
                </div>
                <ScoreBar width={factor.width} barClass={factor.barClass} />
              </div>
            ))}
            <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <span className="text-sand-muted">
                Evidence ledger: <strong>48 SMS, 19 Voice calls</strong>
              </span>
              <span className="text-savanna-amber">SHA-256 Hash: 8f3c44e9...b29a ↗</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-card p-4 rounded-xl border border-border-strong text-center">
          <span ref={factors.ref} className="font-display text-2xl font-bold text-savanna-amber block">
            {factors.text}
          </span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">Formula Weights</span>
        </div>
        <div className="bg-surface-card p-4 rounded-xl border border-border-strong text-center">
          <span className="font-display text-2xl font-bold text-baobab-green block">0 Black Boxes</span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">Open Source Math</span>
        </div>
        <div className="bg-surface-card p-4 rounded-xl border border-border-strong text-center">
          <span ref={explainable.ref} className="font-display text-2xl font-bold text-sand block">
            {explainable.text}
          </span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">Explainable Receipts</span>
        </div>
        <div className="bg-surface-card p-4 rounded-xl border border-border-strong text-center">
          <span className="font-display text-2xl font-bold text-terracotta block">1 Vote</span>
          <span className="font-mono text-[10px] text-sand-muted uppercase">Per Resident</span>
        </div>
      </div>
      <div className="mt-14 flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#dashboard-preview"
        >
          <span>Next: how planners turn scores into work</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
