"use client";

import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch lifecycle pipeline section: 7-stage stepper plus the
// pinned funded-project card. The Gazette button is a demo element with no
// destination in the Stitch HTML, so it stays a plain button.
const DONE_STEPS = ["Reported", "Clustered", "Prioritised", "Planned"];

export default function StatusPipeline() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28"
      id="status-pipeline"
    >
      <div className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-baobab-green uppercase tracking-wider">
          // 06 LIFECYCLE
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          From priority to gazetted{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">budget</span>.
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          A transparent 7-stage pipeline where citizens track funding gazettement and engineer field
          dispatches directly on their mobile phones.
        </p>
      </div>
      <div className="bg-surface-card rounded-card p-6 border border-border-strong overflow-x-auto">
        <div className="flex items-center min-w-[720px] justify-between relative">
          {DONE_STEPS.map((label) => (
            <div key={label} className="contents">
              <div className="flex flex-col items-center text-center space-y-2 z-10">
                <span className="w-8 h-8 rounded-full bg-baobab-green text-sand font-mono text-xs font-bold flex items-center justify-center">
                  ✓
                </span>
                <span className="font-mono text-xs text-sand">{label}</span>
              </div>
              <div className="h-0.5 flex-1 bg-baobab-green"></div>
            </div>
          ))}
          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <span className="w-10 h-10 rounded-full bg-savanna-amber text-obsidian font-mono text-xs font-bold flex items-center justify-center ring-4 ring-savanna-amber/30 animate-pulse">
              05
            </span>
            <span className="font-mono text-xs font-bold text-savanna-amber">Funded</span>
          </div>
          <div className="h-0.5 flex-1 bg-border-strong"></div>
          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <span className="w-8 h-8 rounded-full bg-surface-elevated border border-border-strong text-sand-muted font-mono text-xs flex items-center justify-center">
              06
            </span>
            <span className="font-mono text-xs text-sand-muted">In Progress</span>
          </div>
          <div className="h-0.5 flex-1 bg-border-strong"></div>
          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <span className="w-8 h-8 rounded-full bg-surface-elevated border border-border-strong text-sand-muted font-mono text-xs flex items-center justify-center">
              07
            </span>
            <span className="font-mono text-xs text-sand-muted">Done</span>
          </div>
        </div>
        <div className="mt-8 p-6 bg-surface-elevated rounded-xl border border-savanna-amber/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-savanna-amber/20 text-savanna-amber font-mono text-[10px] font-bold">
                CURRENT STAGE: FUNDED
              </span>
              <span className="font-mono text-xs text-sand-muted">Vote Head: CDF-JMV-2025-W08</span>
            </div>
            <h4 className="font-display text-xl font-bold text-sand">
              Miritini Borehole #3 Motor Replacement &amp; Desalination Membrane
            </h4>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-sand-muted">
              <span>
                Budget Line: <strong className="text-sand">KES 1,850,000</strong>
              </span>
              <span>◆</span>
              <span>
                Beneficiaries: <strong className="text-baobab-green">4,200 Residents</strong>
              </span>
              <span>◆</span>
              <span>Dispatch: Sub-County Water Engineering</span>
            </div>
          </div>
          <button
            type="button"
            className="px-5 py-2.5 rounded-full bg-surface-card border border-border-strong text-sand font-mono text-xs hover:border-savanna-amber transition-colors shrink-0"
          >
            View Gazette Filing ↗
          </button>
        </div>
      </div>
      <div className="mt-14 flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#actors"
        >
          <span>Next: purpose-built workflows for every civic actor</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
