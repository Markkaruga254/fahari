"use client";

import Link from "next/link";
import { useScrollProgress } from "../../hooks/useScrollProgress";

// Port of the Stitch sticky nav. Client component because the active link
// follows the scroll position via useScrollProgress.
const LINKS = [
  { target: "hero", label: "Home", href: "#hero" },
  { target: "journey", label: "The Journey", href: "#journey" },
  { target: "channels", label: "Channels", href: "#channels" },
  { target: "the-score", label: "The Score", href: "#the-score" },
  { target: "dashboard-preview", label: "Dashboard", href: "#dashboard-preview" },
  { target: "governance", label: "Governance", href: "#governance" },
];

const SECTION_IDS = LINKS.map((link) => link.target);

const ACTIVE_CLASSES = "text-savanna-amber font-bold border-b-2 border-savanna-amber pb-1 transition-colors";
const IDLE_CLASSES = "text-sand-muted hover:text-sand transition-colors pb-1";

export default function Nav() {
  const { activeId } = useScrollProgress(SECTION_IDS);

  return (
    <header className="w-full bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle/50">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <a className="flex items-center gap-3 group" href="#hero">
            {/* STEP 9: replace hotlink with /logo.png via next/image once assets land in public/ */}
            <img
              alt="People's Priorities Logo"
              className="h-7 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1V8mY0PUpdUJY_EB3kBud4ZTtgN8K8NxumzwMlB-Isdn-gloBF_YUWh14ZPqBJH8YKFUrxTgPmrmQPB7KmWyRwUc4zpgn1AogiNzV73NSrGwCCHMFfqWOiYOd-6KzBvmvL2QAgXkNwLX8_NfUgf18T_Dn_aUgz_Mda0IQAVpYO7rurx2ekergd4uxGdGfDOVhSen8SIimuWkPSYaLWV2LKYxx2ow4d3WD_44SsB0wQ7xGP9XgZTu_NKqho"
            />
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-card text-savanna-amber border border-border-subtle hidden sm:inline-block">
              v0.9 Rasmi
            </span>
          </a>
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium font-body">
            {LINKS.map((link) => (
              <a
                key={link.target}
                className={`nav-link ${activeId === link.target ? ACTIVE_CLASSES : IDLE_CLASSES}`}
                data-target={link.target}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-card border border-border-subtle font-mono text-[11px] text-sand-muted">
            <span className="w-2 h-2 rounded-full bg-baobab-green animate-pulse"></span>
            <span>Mombasa Pilot · Miritini</span>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-savanna-amber hover:bg-[#e09b00] text-obsidian font-display text-xs font-bold tracking-tight transition-all active:scale-[0.98]"
            href="/dashboard"
          >
            <span>Open planner dashboard</span>
            <span className="font-mono text-xs">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
