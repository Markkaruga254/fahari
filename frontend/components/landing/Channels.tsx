"use client";

import { useState } from "react";
import { USSD_CODE, VOICE_NUMBER } from "../../lib/config";
import { STRINGS, type Lang } from "../../lib/i18n";
import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch channels section: channel tabs (USSD / Voice / SMS /
// Web) plus the English/Kiswahili toggle. Tab copy comes from the typed
// lib/i18n.ts dictionary; the mockup panels are verbatim Stitch markup.
type Tab = "ussd" | "voice" | "sms" | "web";

const TABS: { id: Tab; label: string }[] = [
  { id: "ussd", label: "Dialpad USSD" },
  { id: "voice", label: "Voice IVR (Sauti)" },
  { id: "sms", label: "Two-Way SMS" },
  { id: "web", label: "Citizen Web Portal" },
];

const ACTIVE_TAB =
  "channel-tab-btn px-4 py-2 rounded-lg bg-savanna-amber text-obsidian font-mono text-xs font-bold transition-all";
const IDLE_TAB =
  "channel-tab-btn px-4 py-2 rounded-lg bg-surface-elevated text-sand hover:text-savanna-amber font-mono text-xs transition-all";

const ACTIVE_LANG = "lang-toggle-btn px-2 py-0.5 rounded-full bg-savanna-amber text-obsidian text-[11px] font-bold";
const IDLE_LANG = "lang-toggle-btn px-2 py-0.5 rounded-full text-sand-muted hover:text-sand text-[11px]";

export default function Channels() {
  const sectionRef = useReveal<HTMLElement>();
  const [tab, setTab] = useState<Tab>("ussd");
  const [lang, setLang] = useState<Lang>("sw");
  const dict = STRINGS[lang];

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28"
      id="channels"
    >
      <div className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-baobab-green uppercase tracking-wider">
          // 03 ACCESSIBILITY
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          Which phone, which{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">language</span>?
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          Eradicating digital barriers. Whether calling with coastal Swahili, sending an SMS, or
          dialing USSD on a feature phone, every citizen is heard.
        </p>
      </div>
      <div className="bg-surface-card rounded-card p-6 lg:p-8 border border-border-strong">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? ACTIVE_TAB : IDLE_TAB}
                data-tab={t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 bg-surface-elevated px-2 py-1 rounded-full border border-border-subtle font-mono text-xs">
            <span className="text-sand-muted text-[10px] uppercase">Lang:</span>
            <button
              type="button"
              className={lang === "sw" ? ACTIVE_LANG : IDLE_LANG}
              onClick={() => setLang("sw")}
            >
              Kiswahili
            </button>
            <button
              type="button"
              className={lang === "en" ? ACTIVE_LANG : IDLE_LANG}
              onClick={() => setLang("en")}
            >
              English
            </button>
          </div>
        </div>
        <div className="mt-8">
          {tab === "ussd" && (
            <div className="channel-pane grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="pane-ussd">
              <div className="md:col-span-5 bg-[#090A08] p-5 rounded-xl border border-border-subtle font-mono text-xs shadow-inner">
                <div className="text-savanna-amber font-bold pb-2 border-b border-border-subtle flex justify-between">
                  <span>USSD Session Active</span>
                  <span>{USSD_CODE}</span>
                </div>
                <div className="py-4 space-y-2 text-sand">
                  <p className="font-bold">{dict.ussdScreen[0]}</p>
                  {dict.ussdScreen.slice(1).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-sand-muted text-[11px]">
                  <span>
                    Response: <strong className="text-savanna-amber">1</strong>
                  </span>
                </div>
              </div>
              <div className="md:col-span-7 space-y-4">
                <span className="font-mono text-xs text-savanna-amber uppercase">
                  // 2G FEATURE PHONE COMPATIBLE
                </span>
                <h3 className="font-display text-2xl font-bold text-sand">{dict.ussdTitle}</h3>
                <p className="font-body text-sm text-sand-muted leading-relaxed">{dict.ussdDesc}</p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-surface-elevated rounded border border-border-subtle">
                    <span className="text-sand-muted block text-[10px]">Session duration</span>
                    <span className="text-sand font-bold text-sm">~45 seconds</span>
                  </div>
                  <div className="p-3 bg-surface-elevated rounded border border-border-subtle">
                    <span className="text-sand-muted block text-[10px]">Failure rate</span>
                    <span className="text-baobab-green font-bold text-sm">&lt; 0.2% on 2G</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "voice" && (
            <div className="channel-pane grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="pane-voice">
              <div className="md:col-span-5 bg-[#090A08] p-5 rounded-xl border border-border-subtle font-mono text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-baobab-green font-bold pb-2 border-b border-border-subtle">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-baobab-green animate-pulse"></span> IVR CALL
                    CONNECTED
                  </span>
                  <span>0:42</span>
                </div>
                <div className="flex items-center justify-center gap-1 h-12 py-2" aria-hidden="true">
                  <div className="w-1 bg-savanna-amber h-3 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-savanna-amber h-6 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-savanna-amber h-10 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-savanna-amber h-4 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-baobab-green h-8 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-baobab-green h-12 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-baobab-green h-5 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-savanna-amber h-9 rounded-full animate-pulse"></div>
                  <div className="w-1 bg-savanna-amber h-3 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-surface-card p-3 rounded text-[11px] text-sand italic border border-border-subtle">
                  “Naitwa Mwanamisi. Pampu yetu ya maji hapa Sokoni imezimika siku tatu. Watu
                  wanahangaika...”
                </div>
                <div className="text-[10px] text-sand-muted flex justify-between">
                  <span>Model: Coastal Whisper Swahili</span>
                  <span className="text-baobab-green">99.1% Confidence</span>
                </div>
              </div>
              <div className="md:col-span-7 space-y-4">
                <span className="font-mono text-xs text-baobab-green uppercase">
                  // SWAHILI &amp; KIGIRIAMA VOICE PROCESSING
                </span>
                <h3 className="font-display text-2xl font-bold text-sand">{dict.voiceTitle}</h3>
                <p className="font-body text-sm text-sand-muted leading-relaxed">{dict.voiceDesc}</p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-surface-elevated rounded border border-border-subtle">
                    <span className="text-sand-muted block text-[10px]">Dialects recognized</span>
                    <span className="text-sand font-bold text-sm">Swahili · Kigiriama · Sheng</span>
                  </div>
                  <div className="p-3 bg-surface-elevated rounded border border-border-subtle">
                    <span className="text-sand-muted block text-[10px]">Line</span>
                    <span className="text-baobab-green font-bold text-sm">{VOICE_NUMBER}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "sms" && (
            <div className="channel-pane grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="pane-sms">
              <div className="md:col-span-5 bg-[#090A08] p-5 rounded-xl border border-border-subtle font-mono text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-sand-muted pb-2 border-b border-border-subtle">
                  <span>SMS Thread · 21455</span>
                  <span className="text-baobab-green">Delivered</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="bg-surface-elevated p-2 rounded max-w-[85%] text-sand">
                    MAJI Miritini Central pampu ya maji imevunjika, tunaomba msaada wa haraka.
                  </div>
                  <div className="bg-baobab-green/20 p-2 rounded max-w-[85%] ml-auto text-sand border border-baobab-green/30">
                    Tiketi #MRT-882 imepokelewa. Tumeiunganisha na ripoti zingine 47. Asante!
                  </div>
                </div>
              </div>
              <div className="md:col-span-7 space-y-4">
                <span className="font-mono text-xs text-terracotta uppercase">
                  // INSTANT TWO-WAY FEEDBACK
                </span>
                <h3 className="font-display text-2xl font-bold text-sand">{dict.smsTitle}</h3>
                <p className="font-body text-sm text-sand-muted leading-relaxed">{dict.smsDesc}</p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-surface-elevated rounded border border-border-subtle">
                    <span className="text-sand-muted block text-[10px]">Receipt latency</span>
                    <span className="text-sand font-bold text-sm">&lt; 3 seconds</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "web" && (
            <div className="channel-pane grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="pane-web">
              <div className="md:col-span-5 bg-[#090A08] p-5 rounded-xl border border-border-subtle font-mono text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-sand-muted pb-2 border-b border-border-subtle">
                  <span className="text-savanna-amber">wadi.mombasa.go.ke</span>
                  <span className="text-[10px]">16.4 KB LOAD</span>
                </div>
                <div className="space-y-2 text-[11px] text-sand">
                  <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                    <div className="text-sand-muted text-[10px]">Location Pin</div>
                    <div>S 04°00&apos;24&quot;, E 39°34&apos;48&quot;</div>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                    <div className="text-sand-muted text-[10px]">Photo Evidence</div>
                    <div className="text-baobab-green">✓ borehole_corrosion.jpg (42KB compressed)</div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-7 space-y-4">
                <span className="font-mono text-xs text-savanna-amber uppercase">
                  // LOW-BANDWIDTH CITIZEN WEB
                </span>
                <h3 className="font-display text-2xl font-bold text-sand">{dict.webTitle}</h3>
                <p className="font-body text-sm text-sand-muted leading-relaxed">{dict.webDesc}</p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-surface-elevated rounded border border-border-subtle">
                    <span className="text-sand-muted block text-[10px]">Total payload</span>
                    <span className="text-savanna-amber font-bold text-sm">&lt; 18 KB gzipped</span>
                  </div>
                  <div className="p-3 bg-surface-elevated rounded border border-border-subtle">
                    <span className="text-sand-muted block text-[10px]">Offline caching</span>
                    <span className="text-baobab-green font-bold text-sm">IndexedDB Support</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-14 flex items-center justify-center">
        <a
          className="inline-flex items-center gap-2 font-mono text-xs text-sand-muted hover:text-savanna-amber transition-colors group"
          href="#the-score"
        >
          <span>Next: the transparent math behind the rank</span>
          <span className="text-savanna-amber group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </div>
    </section>
  );
}
