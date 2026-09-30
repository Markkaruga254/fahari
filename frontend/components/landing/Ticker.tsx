"use client";

import { useScrollProgress } from "../../hooks/useScrollProgress";

// Port of the Stitch top ticker: scroll progress bar, scrolling marquee and
// the persistent SYNTHETIC DEMO DATA badge. Client component because the
// progress bar width updates on scroll.
const ITEMS: { text: string; className: string }[] = [
  { text: "MIRITINI WARD, MOMBASA", className: "mx-4 text-savanna-amber font-bold" },
  { text: "EVERY VOICE COUNTED ONCE", className: "mx-4" },
  { text: "NO SMARTPHONE NEEDED", className: "mx-4" },
  { text: "SYNTHETIC DEMO DATA", className: "mx-4 text-terracotta font-bold" },
  { text: "PEOPLE SIGNAL, AI ORGANISES, HUMANS DECIDE", className: "mx-4" },
  { text: "WADI YETU, SAUTI YETU", className: "mx-4 text-baobab-green" },
  { text: "TRANSPARENT CONSTITUENCY PLANNING", className: "mx-4" },
];

function MarqueeRun({ hidden }: { hidden?: boolean }) {
  return (
    <>
      {ITEMS.map((item) => (
        <span key={item.text} aria-hidden={hidden}>
          <span className={item.className}>{item.text}</span>
          <span className="mx-2 text-savanna-amber">◆</span>
        </span>
      ))}
    </>
  );
}

export default function Ticker() {
  const { progress } = useScrollProgress([]);

  return (
    <>
      <div
        className="h-0.5 bg-savanna-amber transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
      <div className="h-8 w-full flex items-center overflow-hidden relative select-none">
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="animate-marquee font-mono text-[11px] text-sand-muted tracking-widest uppercase flex items-center whitespace-nowrap">
            <MarqueeRun />
            <MarqueeRun hidden />
          </div>
        </div>
        <div className="shrink-0 z-10 bg-obsidian pl-3 pr-4 flex items-center border-l border-border-subtle">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-terracotta/15 border border-terracotta/30 text-terracotta font-mono text-[9px] tracking-widest uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse"></span>
            SYNTHETIC DEMO DATA
          </span>
        </div>
      </div>
    </>
  );
}
