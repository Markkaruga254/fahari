"use client";

import { FileText, Fingerprint, Scale, ShieldCheck } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch governance section. Material Symbols glyphs use
// lucide-react equivalents (Fingerprint, Scale, FileText, ShieldCheck).
export default function Governance() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28"
      id="governance"
    >
      <div className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-baobab-green uppercase tracking-wider">
          // 08 STATUTORY INTEGRITY
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          Is it safe and{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">honest</span>?
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          Built according to the Kenya County Governments Act Section 115. Zero personally
          identifiable data exposed; zero AI hallucinations.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-card rounded-card p-6 border border-border-strong space-y-3">
          <Fingerprint className="h-6 w-6 text-savanna-amber" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-sand">Hashed Identity</h3>
          <p className="font-body text-xs text-sand-muted leading-relaxed">
            Phone numbers are cryptographically salted and hashed upon ingestion. Planners see
            verified unique citizens without exposing personal SIM credentials.
          </p>
        </div>
        <div className="bg-surface-card rounded-card p-6 border border-border-strong space-y-3">
          <Scale className="h-6 w-6 text-baobab-green" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-sand">Constrained AI</h3>
          <p className="font-body text-xs text-sand-muted leading-relaxed">
            Language models are restricted to pre-approved county infrastructure categories (water,
            roads, health, schooling). No generative hallucinations.
          </p>
        </div>
        <div className="bg-surface-card rounded-card p-6 border border-border-strong space-y-3">
          <FileText className="h-6 w-6 text-sand" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-sand">Paper Baraza Fallback</h3>
          <p className="font-body text-xs text-sand-muted leading-relaxed">
            The platform supports physical village meeting minutes. Planners can audit and reconcile
            paper ballots alongside the digital stream.
          </p>
        </div>
        <div className="bg-surface-card rounded-card p-6 border border-border-strong space-y-3">
          <ShieldCheck className="h-6 w-6 text-terracotta" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-sand">Synthetic Sandbox</h3>
          <p className="font-body text-xs text-sand-muted leading-relaxed">
            This deployment operates on high-fidelity synthetic demo data calibrated to Mombasa
            County geographic polygons for testing and demonstration.
          </p>
        </div>
      </div>
      <div className="mt-10 p-8 rounded-card bg-surface-elevated border border-border-strong flex flex-col items-center text-center space-y-4">
        <span className="font-mono text-xs text-savanna-amber uppercase tracking-wider">
          // KENYA COUNTY GOVERNMENTS ACT SEC. 115
        </span>
        <blockquote className="font-editorial italic text-2xl sm:text-3xl text-sand max-w-3xl leading-snug">
          “People provide the signal, AI organises it, humans decide.”
        </blockquote>
        <p className="font-mono text-xs text-sand-muted">
          Constitutional citizen participation mandate · Devolution governance compliance
        </p>
      </div>
      <div className="mt-14 flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#testimonials"
        >
          <span>Next: reflections from the pilot corridor</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
