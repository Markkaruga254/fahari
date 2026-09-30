"use client";

import Link from "next/link";
import { USSD_CODE } from "../../lib/config";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch actor cards. Dashboard CTA points at /dashboard; the
// resident dial link uses USSD_CODE from lib/config.ts.
export default function Actors() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28"
      id="actors"
    >
      <div className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-savanna-amber uppercase tracking-wider">
          // 07 CIVIC ACTORS
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          A civic interface built for three distinct{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">actors</span>.
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          Citizens report in seconds; planners eliminate paperwork; civil society audits public spend
          with verifiable receipts.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="interactive-card bg-surface-card rounded-card p-6 border border-border-strong flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="font-mono text-[10px] text-savanna-amber uppercase font-bold tracking-wider">
              // FOR RESIDENTS
            </span>
            <h3 className="font-display text-xl font-bold text-sand">
              Dial in 60 seconds. Follow every shilling.
            </h3>
            <p className="font-body text-xs text-sand-muted leading-relaxed">
              No smartphones, no expensive transport to Mombasa County Hall. Dial, pick
              your category, and get direct SMS updates whenever your ward committee takes action.
            </p>
            <ul className="font-mono text-xs text-sand-muted space-y-2 pt-2 border-t border-border-subtle">
              <li className="flex items-center gap-2">
                <span className="text-savanna-amber">◆</span> Works on Safaricom &amp; Airtel USSD
              </li>
              <li className="flex items-center gap-2">
                <span className="text-savanna-amber">◆</span> Automated Swahili voice prompts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-savanna-amber">◆</span> Tracking ticket via instant SMS
              </li>
            </ul>
          </div>
          <a
            className="inline-flex items-center gap-1.5 text-savanna-amber font-display text-xs font-bold hover:underline"
            href="#channels"
          >
            <span>Dial {USSD_CODE} to test</span>
            <span>→</span>
          </a>
        </div>
        <div className="interactive-card bg-surface-card rounded-card p-6 border border-border-strong flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="font-mono text-[10px] text-baobab-green uppercase font-bold tracking-wider">
              // FOR WARD PLANNERS
            </span>
            <h3 className="font-display text-xl font-bold text-sand">
              Auto-cluster signals. Export gazette dossiers.
            </h3>
            <p className="font-body text-xs text-sand-muted leading-relaxed">
              Inspect semantic clusters, filter by urgency, resolve competing priorities, and export
              audit-ready PDF dossiers ready for County Assembly review.
            </p>
            <ul className="font-mono text-xs text-sand-muted space-y-2 pt-2 border-t border-border-subtle">
              <li className="flex items-center gap-2">
                <span className="text-baobab-green">◆</span> Multi-channel feed (Voice/USSD/Web)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-baobab-green">◆</span> One-click PDF gazette dossier export
              </li>
              <li className="flex items-center gap-2">
                <span className="text-baobab-green">◆</span> Project status SMS (roadmap)
              </li>
            </ul>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 text-baobab-green font-display text-xs font-bold hover:underline"
            data-path="planner-dashboard"
            href="/dashboard"
          >
            <span>Open Planner Dashboard</span>
            <span>→</span>
          </Link>
        </div>
        <div className="interactive-card bg-surface-card rounded-card p-6 border border-border-strong flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="font-mono text-[10px] text-terracotta uppercase font-bold tracking-wider">
              // FOR COUNTY &amp; AUDITORS
            </span>
            <h3 className="font-display text-xl font-bold text-sand">
              Open API ledgers. Anti-duplication voter hashes.
            </h3>
            <p className="font-body text-xs text-sand-muted leading-relaxed">
              Civil society watchdogs and county auditors access public JSON endpoints,
              proofs of unique reports, and full statutory alignment records.
            </p>
            <ul className="font-mono text-xs text-sand-muted space-y-2 pt-2 border-t border-border-subtle">
              <li className="flex items-center gap-2">
                <span className="text-terracotta">◆</span> Open API &amp; JSON data receipts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terracotta">◆</span> Cryptographic phone number hashing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terracotta">◆</span> Compliant with CGA 2012 Sec 115
              </li>
            </ul>
          </div>
          <a
            className="inline-flex items-center gap-1.5 text-terracotta font-display text-xs font-bold hover:underline"
            href="#governance"
          >
            <span>Inspect Security Protocols</span>
            <span>→</span>
          </a>
        </div>
      </div>
      <div className="mt-14 flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#governance"
        >
          <span>Next: transparency, privacy, and statutory safety</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
