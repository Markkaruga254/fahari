"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { USSD_CODE } from "../../lib/config";
import { SIM_STEPS, type SimBoxLine } from "../../lib/journey";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch journey split-screen. Client component: the step card
// nearest the viewport centre (rootMargin "-42% 0px -42% 0px", as in Stitch)
// drives the pinned phone screen; the 5 buttons are a manual fallback.
// The grid holding the sticky phone never receives reveal transforms.
const STEP_LABELS = ["01 Dial", "02 Telecom", "03 NLP", "04 Cluster", "05 Receipt"];

const ACTIVE_BTN = "step-btn px-2.5 py-1.5 rounded bg-savanna-amber text-obsidian font-mono text-[10px] font-bold";
const IDLE_BTN = "step-btn px-2.5 py-1.5 rounded bg-surface-elevated text-sand hover:text-savanna-amber font-mono text-[10px]";

const HEADING_TONES: Record<string, string> = {
  amber: "text-savanna-amber",
  green: "text-baobab-green",
  terracotta: "text-terracotta",
};

const CHIP_TONES: Record<string, string> = {
  amber: "bg-savanna-amber/20 text-savanna-amber",
  terracotta: "bg-terracotta/20 text-terracotta",
  green: "bg-baobab-green/20 text-baobab-green",
};

const LINE_TONES: Record<string, string> = {
  sand: "text-sand",
  muted: "text-sand-muted",
  amber: "text-savanna-amber",
  green: "text-baobab-green",
};

function BoxLine({ line }: { line: SimBoxLine }) {
  return (
    <div className={`${line.bold ? "font-bold" : ""} ${line.tone ? LINE_TONES[line.tone] : ""}`}>
      {line.text}
    </div>
  );
}

const STEP_CARDS = [
  {
    badge: "w-8 h-8 rounded-full bg-savanna-amber text-obsidian font-mono text-xs font-bold flex items-center justify-center",
    label: "Step 01 · Signal Intake",
    labelClass: "text-savanna-amber",
    title: `Resident dials ${USSD_CODE} & selects category`,
    body: "Mama Amina dials from Miritini Sokoni. She chooses option 1: Borehole 3 motor burnout.",
  },
  {
    badge: "w-8 h-8 rounded-full bg-surface-elevated border border-border-strong text-sand font-mono text-xs font-bold flex items-center justify-center",
    label: "Step 02 · Telecom Carrier",
    labelClass: "text-baobab-green",
    title: "Africa's Talking gateway receives payload",
    body: "The Africa's Talking USSD & IVR infrastructure handles the multi-telco session over Safaricom/Airtel and delivers structured text payloads to our ingestion pipeline.",
  },
  {
    badge: "w-8 h-8 rounded-full bg-surface-elevated border border-border-strong text-sand font-mono text-xs font-bold flex items-center justify-center",
    label: "Step 03 · Local NLP",
    labelClass: "text-savanna-amber",
    title: "AI engine structures Swahili transcripts",
    body: "Audio memos and text tokens are parsed: [Category: Water Infrastructure], [Urgency: 9.4], [Location: Miritini Central], [Affected Households: 4,200].",
  },
  {
    badge: "w-8 h-8 rounded-full bg-surface-elevated border border-border-strong text-sand font-mono text-xs font-bold flex items-center justify-center",
    label: "Step 04 · De-duplication",
    labelClass: "text-terracotta",
    title: "Consolidated into Priority #01 cluster",
    body: "48 individual reports regarding the exact same borehole collapse into one audited civic dossier with computed spatial urgency scores.",
  },
  {
    badge: "w-8 h-8 rounded-full bg-baobab-green text-sand font-mono text-xs font-bold flex items-center justify-center",
    label: "Step 05 · Transparent Loop",
    labelClass: "text-baobab-green",
    title: "Mama Amina receives verified SMS receipt",
    body: "An instant SMS returns with Ticket #MRT-DEMO-001. When the Ward Planning Committee dispatches an engineer, Mama Amina receives an automated status SMS.",
  },
];

export default function Journey() {
  const headerRef = useReveal<HTMLDivElement>();
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const step = SIM_STEPS[activeStep - 1];

  useEffect(() => {
    document.documentElement.classList.add("js");
    const root = stepsRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll(".step-card"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = cards.indexOf(entry.target);
          if (i >= 0) setActiveStep(i + 1);
        });
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    cards.forEach((card) => io.observe(card));
    return () => io.disconnect();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28" id="journey">
      <div ref={headerRef} className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-savanna-amber uppercase tracking-wider">
          // 02 THE JOURNEY
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          How does a single report{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">travel</span>?
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          From a feature phone keypress under the Mombasa sun to a verified item on the County
          Planner&apos;s dispatch board.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="bg-surface-card rounded-card p-5 border border-border-strong shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle font-mono text-[11px] text-sand-muted">
              <span className="text-sand font-bold">INTERACTIVE SIMULATOR</span>
              <span className="text-baobab-green">● LIVE LINK</span>
            </div>
            <div className="mt-4 rounded-xl bg-[#090A08] p-4 border border-border-subtle min-h-[310px] flex flex-col justify-between font-mono">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-savanna-amber text-xs">
                  <span className="font-bold">{step.title}</span>
                  <span className="text-[10px] text-sand-muted">{step.meta}</span>
                </div>
                <div className="mt-3 text-xs text-sand space-y-2">
                  <p className={`font-bold ${HEADING_TONES[step.headingTone]}`}>{step.heading}</p>
                  {step.lines.length > 0 && (
                    <p className="text-sand/90">
                      {step.lines.map((line, i) => (
                        <span key={line}>
                          {i > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </p>
                  )}
                  <div
                    className={`p-2 rounded border text-[11px] ${
                      step.boxVariant === "success"
                        ? "bg-baobab-green/20 border-baobab-green/30 text-sand"
                        : "bg-surface-card border-border-subtle text-sand"
                    }`}
                  >
                    {step.chips.length > 0 && (
                      <div className="space-x-1">
                        {step.chips.map((chip) => (
                          <span
                            key={chip.text}
                            className={`inline-block px-1.5 py-0.5 rounded mr-1 ${CHIP_TONES[chip.tone]}`}
                          >
                            {chip.text}
                          </span>
                        ))}
                      </div>
                    )}
                    {step.boxLines.map((line) => (
                      <BoxLine key={line.text} line={line} />
                    ))}
                    {step.boxNote && <div className="text-sand-muted mt-1">{step.boxNote}</div>}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[10px] text-sand-muted">
                <span>{step.status}</span>
                <span className="text-baobab-green font-bold">Any phone</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-1">
              {STEP_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={activeStep === i + 1 ? ACTIVE_BTN : IDLE_BTN}
                  onClick={() => setActiveStep(i + 1)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          ref={stepsRef}
          className="lg:col-span-7 flex flex-col space-y-8 pl-0 lg:pl-6 border-l-0 lg:border-l border-border-subtle"
        >
          {STEP_CARDS.map((card, i) => (
            <div
              key={card.label}
              className={`step-card interactive-card bg-surface-card rounded-card p-6 border border-border-strong group${
                activeStep === i + 1 ? " is-active" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={card.badge}>{`0${i + 1}`}</span>
                <div>
                  <span className={`font-mono text-[11px] uppercase tracking-wider ${card.labelClass}`}>
                    {card.label}
                  </span>
                  <h3 className="font-display text-lg text-sand font-bold">{card.title}</h3>
                </div>
              </div>
              <p className="font-body text-sm text-sand-muted mt-3 leading-relaxed">{card.body}</p>
            </div>
          ))}
          <div className="p-6 bg-surface-elevated rounded-card border border-border-strong flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-sand font-display">Experience the live data pipe</div>
              <div className="text-xs text-sand-muted font-body">
                Inspect real-time incoming Mombasa clusters
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                className="px-4 py-2 rounded-full bg-savanna-amber text-obsidian font-display text-xs font-bold hover:bg-[#e09b00] transition-colors"
                data-path="planner-dashboard"
                href="/dashboard"
              >
                Open dashboard ↗
              </Link>
              <a
                className="px-4 py-2 rounded-full bg-surface-card border border-border-strong text-sand font-display text-xs hover:border-savanna-amber transition-colors"
                href="#channels"
              >
                Report a need →
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-14 flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#channels"
        >
          <span>Next: access for any phone and every dialect</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
