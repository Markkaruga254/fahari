"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { USSD_CODE } from "../../lib/config";
import { useCountUp } from "../../hooks/useCountUp";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch hero section. Client component: the 91.4 score counts
// up once on entering the viewport and its bar fills from 0 on enter.
// The "verified" glyph uses lucide-react instead of Material Symbols.
const SCORE = 91.4;

export default function Hero() {
  const sectionRef = useReveal<HTMLElement>();
  const { ref: scoreRef, text: scoreText } = useCountUp(SCORE, 1);
  const [barWidth, setBarWidth] = useState(`${SCORE}%`);

  useEffect(() => {
    // SSR and no-JS render the final width; only animate when JS runs and
    // the user has no reduced-motion preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setBarWidth("0%");
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setBarWidth(`${SCORE}%`)),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 pb-16 w-full relative scroll-mt-28"
      id="hero"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-card border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-savanna-amber animate-pulse"></span>
            <span className="font-mono text-[11px] uppercase text-savanna-amber tracking-wider">
              // CONSTITUENCY PLANNING · MOMBASA PILOT
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-sand tracking-tight leading-[1.08] font-bold">
            Where communities{" "}
            <span className="font-editorial italic font-normal text-savanna-amber">speak</span>, and
            planners <span className="font-editorial italic font-normal text-savanna-amber">listen</span>.
          </h1>
          <p className="font-body text-base sm:text-lg text-sand-muted max-w-xl leading-relaxed">
            Report urgent water, road, clinic, and school priorities directly via USSD, Voice, SMS,
            or web. An open AI engine clusters grassroots signals and computes verified priority
            scores so county budgets reflect real community needs.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex items-center justify-center gap-2 bg-savanna-amber hover:bg-[#e09b00] text-obsidian font-display text-sm font-bold px-7 py-3.5 rounded-full transition-all active:scale-[0.98]"
              data-path="planner-dashboard"
              href="/dashboard"
            >
              <span>See the live dashboard</span>
              <span className="font-mono text-xs">↗</span>
            </Link>
            <a
              className="inline-flex items-center justify-center gap-2 bg-surface-card text-sand border border-border-strong hover:border-savanna-amber font-display text-sm font-semibold px-6 py-3.5 rounded-full transition-colors"
              href="#channels"
            >
              <span>How residents report</span>
              <span className="font-mono text-xs text-savanna-amber">↓</span>
            </a>
          </div>
          <div className="pt-4 border-t border-border-subtle flex items-center gap-4">
            <div className="relative shrink-0">
              {/* STEP 9: replace hotlink with local portrait via next/image once assets land in public/ */}
              <img
                alt="Kenyan Civic Planner"
                className="w-12 h-12 rounded-full object-cover border border-savanna-amber/40"
                src="https://lh3.googleusercontent.com/aida/AEtjO1Xh5T_zum1m7Yl63ZPDSz26mSbiAKXTu_utc1Mrqb77wabXQxihmiqj1cHfa8xKqSHkJzZkaXE1Ln02H3cbUYynU_E2EQKQIwwSJgnDu5-N4iayk7iqGksZ-5tB8c_AX03C39T-AfKhM71R6Xe7c0qyFQhfABuMCgH2iLsctbYQJDoDFOhagWHA54Eyxbtejx6BKWVeIt7yMiEyu4gCdShw35NsQ_wwhXUjmhSCRg3Ja9uSlEpTHHrV9g"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-baobab-green ring-2 ring-obsidian"></span>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-sand font-medium">
                <span className="text-savanna-amber">Reports from 12 wards</span>
                <span className="text-sand-muted">◆</span>
                <span>5 categories</span>
                <span className="text-sand-muted">◆</span>
                <span className="text-baobab-green">3 languages</span>
              </div>
              <span className="font-mono text-[10px] text-sand-muted uppercase tracking-wider mt-0.5">
                Illustrative demo figures · Verified Mombasa corridor
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-6 relative h-[440px] sm:h-[480px] flex items-center justify-center">
          <div className="absolute w-72 h-72 rounded-full bg-savanna-amber/10 blur-3xl pointer-events-none -top-10 -right-10"></div>
          <div className="absolute w-64 h-64 rounded-full bg-baobab-green/10 blur-3xl pointer-events-none -bottom-10 -left-10"></div>
          <div className="absolute left-2 sm:left-6 top-4 w-72 sm:w-80 bg-surface-card rounded-card p-4 border border-border-strong animate-float1 z-20 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle font-mono text-[10px] text-sand-muted">
              <span className="text-sand font-bold">NOKIA 105 · USSD GATEWAY</span>
              <span className="text-savanna-amber">BAT 98% ■■■</span>
            </div>
            <div className="mt-2.5 bg-[#090A08] p-3 rounded-lg border border-border-subtle font-mono text-[11px]">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border-subtle text-savanna-amber">
                <span className="font-bold">{USSD_CODE}</span>
                <span className="text-sand-muted text-[9px]">SAUTI YA JAMII</span>
              </div>
              <p className="text-sand font-bold mb-1">Miritini Priorities:</p>
              <div className="space-y-0.5 text-sand/80 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-savanna-amber font-bold">1.</span>
                  <span>Maji / Clean Water</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-savanna-amber font-bold">2.</span>
                  <span>Barabara / Roads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-savanna-amber font-bold">3.</span>
                  <span>Afya / Health Clinics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-savanna-amber font-bold">4.</span>
                  <span>Shule / Schools</span>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-border-subtle flex items-center justify-between text-sand-muted text-[10px]">
                <span>Chagua [1-4]:</span>
                <span className="text-savanna-amber font-bold animate-pulse">1_</span>
              </div>
            </div>
          </div>
          <div className="absolute right-2 sm:right-6 top-44 w-72 sm:w-80 bg-surface-card rounded-card p-4 border border-border-strong animate-float2 z-30 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-baobab-green font-mono text-[10px] uppercase font-bold">
                <span className="w-2 h-2 rounded-full bg-baobab-green animate-ping"></span> Live Signal
              </span>
              <span className="font-mono text-[10px] text-sand-muted">4s ago</span>
            </div>
            <p className="font-body text-xs text-sand font-medium mt-2 leading-snug">
              “Borehole 3 has stopped pumping, Miritini Sokoni. Salt water leaking.”
            </p>
            <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-savanna-amber/15 text-savanna-amber">
                Water · Urgency 9/10
              </span>
              <span className="text-sand-muted">via USSD</span>
            </div>
          </div>
          <div className="absolute left-10 sm:left-20 bottom-2 w-64 sm:w-72 bg-surface-card rounded-card p-4 border border-border-strong animate-float3 z-40 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-sand-muted">Rank #1 Clustered</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-baobab-green/20 text-baobab-green font-mono text-[10px] font-bold">
                +12 this week
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span ref={scoreRef} className="font-display text-3xl font-bold text-savanna-amber">
                  {scoreText}
                </span>
                <span className="font-mono text-xs text-sand-muted"> / 100</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-baobab-green">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified
              </span>
            </div>
            <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-savanna-amber h-full rounded-full"
                style={{
                  width: barWidth,
                  transition: "width 1.1s cubic-bezier(.2,.7,.2,1)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-14 pt-6 border-t border-border-subtle flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#problem"
        >
          <span>Next: the rails connecting every resident</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
