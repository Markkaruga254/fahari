"use client";

import Link from "next/link";
import { USSD_CODE } from "../../lib/config";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch planner-console preview section. Client component for
// useReveal; the mockup itself is static markup.
export default function DashboardPreview() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28"
      id="dashboard-preview"
    >
      <div className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-savanna-amber uppercase tracking-wider">
          // 05 THE PLANNER CONSOLE
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          What does the planner{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">see</span>?
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          Sub-county administrators and ward secretaries replace guesswork with a live command
          cockpit connecting real citizen signals directly to gazetted CDF pipelines.
        </p>
      </div>
      <div className="bg-surface-card rounded-card border border-border-strong overflow-hidden shadow-2xl relative">
        <div className="h-10 bg-surface-elevated border-b border-border-subtle px-4 flex items-center justify-between font-mono text-xs text-sand-muted">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-border-strong"></span>
            <span className="w-3 h-3 rounded-full bg-border-strong"></span>
            <span className="w-3 h-3 rounded-full bg-border-strong"></span>
            <span className="ml-2 text-sand text-[11px]">planner.peoplespriorities.ke/miritini-ward</span>
          </div>
          <span className="text-baobab-green text-[10px]">● 24H INTAKE ACTIVE</span>
        </div>
        <div className="p-6 lg:p-8 relative bg-obsidian">
          <div className="hidden md:flex absolute top-8 right-8 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/95 border border-savanna-amber shadow-lg font-mono text-[11px] text-savanna-amber">
            <span className="w-2 h-2 rounded-full bg-savanna-amber animate-ping"></span>
            <span>1. Real-time multi-channel feed</span>
          </div>
          <div className="hidden md:flex absolute top-48 left-12 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/95 border border-baobab-green shadow-lg font-mono text-[11px] text-baobab-green">
            <span className="w-2 h-2 rounded-full bg-baobab-green"></span>
            <span>2. Algorithmic four-factor score</span>
          </div>
          <div className="hidden md:flex absolute bottom-8 right-12 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/95 border border-terracotta shadow-lg font-mono text-[11px] text-terracotta">
            <span className="w-2 h-2 rounded-full bg-terracotta"></span>
            <span>3. CDF lifecycle project tracker</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 opacity-95">
            <div className="lg:col-span-7 bg-surface-card rounded-xl p-5 border border-border-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="font-mono text-xs text-savanna-amber font-bold">
                  VERIFIED PRIORITY CLUSTERS
                </span>
                <span className="font-mono text-[10px] text-sand-muted">Mombasa Ward #04</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-savanna-amber text-obsidian font-mono text-[10px] font-bold">
                      #01
                    </span>
                    <span className="text-xs font-bold text-sand">Borehole #3 Motor Burnout</span>
                  </div>
                  <span className="text-[11px] text-sand-muted font-body">
                    Miritini Central · 48 citizen reports
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-savanna-amber font-bold text-sm">91.4</span>
                  <span className="block text-[9px] text-baobab-green">Engineer Assigned</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-sand font-mono text-[10px] font-bold">
                      #02
                    </span>
                    <span className="text-xs font-bold text-sand">Mwamlamba Feeder Culvert Erosion</span>
                  </div>
                  <span className="text-[11px] text-sand-muted font-body">
                    Jomvu Kuu · 37 citizen reports
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sand font-bold text-sm">87.2</span>
                  <span className="block text-[9px] text-sand-muted">KeRRA Review</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-sand font-mono text-[10px] font-bold">
                      #03
                    </span>
                    <span className="text-xs font-bold text-sand">Chaani Clinic Solar Inverter Failure</span>
                  </div>
                  <span className="text-[11px] text-sand-muted font-body">
                    Chaani Sub-ward · 29 citizen reports
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sand font-bold text-sm">84.8</span>
                  <span className="block text-[9px] text-terracotta">High Hazard</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-surface-card rounded-xl p-5 border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-baobab-green font-bold">
                    REAL-TIME INCOMING SIGNALS
                  </span>
                  <span className="font-mono text-[10px] text-sand-muted">Just now</span>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                    <span className="text-savanna-amber text-[9px]">VOICE (SWAHILI) · 12s ago</span>
                    <p className="text-sand italic text-[11px] truncate">
                      “Maji hayajatoka Miritini Sokoni siku tatu...”
                    </p>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                    <span className="text-baobab-green text-[9px]">USSD {USSD_CODE} · 1m ago</span>
                    <p className="text-sand italic text-[11px] truncate">
                      “Barabara ya Mwamlamba imeharibika baada ya mvua...”
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-card rounded-xl p-4 border border-border-subtle flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-sand-muted uppercase block">
                    Direct Action
                  </span>
                  <span className="font-display text-sm font-bold text-sand">
                    Ready to audit live data?
                  </span>
                </div>
                <Link
                  className="px-4 py-2 rounded-full bg-savanna-amber text-obsidian font-display text-xs font-bold hover:bg-[#e09b00] transition-colors"
                  data-path="planner-dashboard"
                  href="/dashboard"
                >
                  Launch Console ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-14 flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#status-pipeline"
        >
          <span>Next: from priority to gazetted budget</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
