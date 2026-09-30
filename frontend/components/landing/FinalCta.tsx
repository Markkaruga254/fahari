"use client";

import Link from "next/link";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch final call-to-action band. The dashboard CTA points at
// /dashboard; "Report a need" keeps the Stitch #channels anchor until the
// /report route lands (Step 6).
export default function FinalCta() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full scroll-mt-28">
      <div className="rounded-card bg-surface-card border border-border-strong p-10 lg:p-16 text-center flex flex-col items-center space-y-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle font-mono text-xs text-savanna-amber">
          <span>◆</span>
          <span>KARIBU — EVERY WARD, EVERY VOICE</span>
          <span>◆</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-sand tracking-tight font-bold max-w-3xl">
          Ready to see what your ward actually{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">needs</span>?
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          Explore real-time clustered civic signals, test our open scoring algorithm, or connect
          your county&apos;s Africa&apos;s Talking USSD shortcode today.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            className="inline-flex items-center justify-center gap-2 bg-savanna-amber hover:bg-[#e09b00] text-obsidian font-display text-sm font-bold px-8 py-4 rounded-full transition-all active:scale-[0.98]"
            data-path="planner-dashboard"
            href="/dashboard"
          >
            <span>Open the live dashboard</span>
            <span className="font-mono text-xs">↗</span>
          </Link>
          <a
            className="inline-flex items-center justify-center gap-2 bg-surface-elevated text-sand border border-border-strong hover:border-savanna-amber font-display text-sm font-semibold px-8 py-4 rounded-full transition-colors"
            href="#channels"
          >
            <span>Report a need →</span>
          </a>
        </div>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-sand-muted">
          <span>No smartphone needed</span>
          <span className="text-sand-muted">◆</span>
          <span>Works in Kiswahili and English</span>
          <span className="text-sand-muted">◆</span>
          <span className="text-terracotta font-bold">Synthetic demo data</span>
        </div>
      </div>
    </section>
  );
}
