"use client";

import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch proof marquee strip plus the three
// problem-to-solution cards. Client component for useReveal.
const STRIP_ITEMS = [
  "Africa's Talking Telecom API",
  "USSD 2G Shortcodes",
  "Coastal Swahili Voice IVR",
  "Two-Way SMS",
  "PostgreSQL & Timescale",
  "FastAPI Inference Kernel",
  "Kenya County Gov Act Sec 115",
];

function StripRun({ hidden }: { hidden?: boolean }) {
  return (
    <>
      {STRIP_ITEMS.slice(0, hidden ? 5 : undefined).map((item) => (
        <span key={item} className="mx-6 flex items-center gap-1.5" aria-hidden={hidden}>
          <span className="text-savanna-amber">◆</span> {item}
        </span>
      ))}
    </>
  );
}

export default function Problem() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <>
      <div className="w-full bg-surface-card border-y border-border-subtle py-4 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-6 mb-2">
          <span className="font-mono text-[10px] uppercase text-sand-muted tracking-widest block text-center sm:text-left">
            // BUILT ON RAILS EVERY PHONE ALREADY SPEAKS
          </span>
        </div>
        <div className="animate-marquee font-mono text-xs text-sand tracking-wider uppercase flex items-center whitespace-nowrap">
          <StripRun />
          <StripRun hidden />
        </div>
      </div>
      <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full scroll-mt-28" id="problem">
        <div className="flex flex-col space-y-3 mb-14">
          <span className="font-mono text-xs text-savanna-amber uppercase tracking-wider">
            // 01 THE PROBLEM
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
            Why is constituency planning still{" "}
            <span className="font-editorial italic font-normal text-savanna-amber">guesswork</span>?
          </h2>
          <p className="font-body text-sand-muted max-w-2xl text-base">
            Before algorithms met basic feature phones, local budgets rewarded who yelled loudest at
            town meetings instead of the ground reality.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="interactive-card bg-surface-card rounded-card p-6 border border-border-strong flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-terracotta uppercase font-bold tracking-wider">
                // 01 UNHEARD VOICES
              </span>
              <div className="space-y-2">
                <div className="text-xs font-mono text-sand-muted line-through opacity-70">
                  Old way: 4-hour county hall meetings attended by 50 vocal insiders.
                </div>
                <div className="text-sm font-body text-sand font-semibold">
                  People&apos;s Priorities: Zero-barrier USSD &amp; Voice accessible to every mother
                  at the water kiosk in 45 seconds.
                </div>
              </div>
            </div>
          </div>
          <div className="interactive-card bg-surface-card rounded-card p-6 border border-border-strong flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-savanna-amber uppercase font-bold tracking-wider">
                // 02 DUPLICATE NOISE
              </span>
              <div className="space-y-2">
                <div className="text-xs font-mono text-sand-muted line-through opacity-70">
                  Old way: Chaotic WhatsApp groups, lost paper petitions, duplicate complaints.
                </div>
                <div className="text-sm font-body text-sand font-semibold">
                  People&apos;s Priorities: Semantic NLP de-duplicates 48 scattered whispers into 1
                  verified cluster.
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between font-mono text-[11px]">
              <span className="text-sand-muted">Noise reduction:</span>
              <span className="text-savanna-amber font-bold">1 single ticket</span>
            </div>
          </div>
          <div className="interactive-card bg-surface-card rounded-card p-6 border border-border-strong flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-baobab-green uppercase font-bold tracking-wider">
                // 03 OPAQUE PRIORITIES
              </span>
              <div className="space-y-2">
                <div className="text-xs font-mono text-sand-muted line-through opacity-70">
                  Old way: Political backroom favors deciding which road gets tarred.
                </div>
                <div className="text-sm font-body text-sand font-semibold">
                  People&apos;s Priorities: Transparent 4-factor scoring formula with audit
                  receipts anyone can check.
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between font-mono text-[11px]">
              <span className="text-sand-muted">Audit trail:</span>
              <span className="text-sand font-bold">100% explainable</span>
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-center">
          <a
            className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
            href="#journey"
          >
            <span>Next: trace one report from phone to planner</span>
            <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
          </a>
        </div>
      </section>
    </>
  );
}
