import Link from "next/link";
import { USSD_CODE } from "../../lib/config";

// Port of the Stitch footer. Server component. Two deliberate deviations
// from the Stitch HTML: the Planner Portal link points at /dashboard, and
// the Twitter/X + Open Data links are removed (GitHub kept).
export default function Footer() {
  return (
    <footer className="w-full bg-obsidian border-t border-border-subtle mt-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-border-subtle">
          <div className="lg:col-span-4 space-y-4">
            {/* STEP 9: replace hotlink with /logo.png via next/image once assets land in public/ */}
            <img
              alt="People's Priorities Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1V8mY0PUpdUJY_EB3kBud4ZTtgN8K8NxumzwMlB-Isdn-gloBF_YUWh14ZPqBJH8YKFUrxTgPmrmQPB7KmWyRwUc4zpgn1AogiNzV73NSrGwCCHMFfqWOiYOd-6KzBvmvL2QAgXkNwLX8_NfUgf18T_Dn_aUgz_Mda0IQAVpYO7rurx2ekergd4uxGdGfDOVhSen8SIimuWkPSYaLWV2LKYxx2ow4d3WD_44SsB0wQ7xGP9XgZTu_NKqho"
            />
            <p className="font-editorial italic text-sand-muted text-base max-w-sm">
              “Every ward gets a voice, every voice gets counted once, and every priority shows its
              receipts.”
            </p>
            <div className="font-mono text-xs text-sand-muted pt-2 space-y-1">
              <div>Pilot Ward: Miritini · Constituency: Jomvu</div>
              <div>Decentralized civic deliberation infrastructure for East Africa</div>
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 font-body text-xs">
            <div className="space-y-3">
              <span className="font-mono text-[11px] text-savanna-amber uppercase tracking-wider block">
                // Product
              </span>
              <div className="flex flex-col space-y-2 text-sand-muted">
                <a className="hover:text-sand transition-colors" href="#journey">
                  The Journey
                </a>
                <a className="hover:text-sand transition-colors" href="#the-score">
                  4-Factor Score
                </a>
                <a className="hover:text-sand transition-colors" href="#channels">
                  USSD Engine
                </a>
                <a className="hover:text-sand transition-colors" href="#governance">
                  Security &amp; ID
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <span className="font-mono text-[11px] text-savanna-amber uppercase tracking-wider block">
                // Channels
              </span>
              <div className="flex flex-col space-y-2 text-sand-muted">
                <a className="hover:text-sand transition-colors" href="#channels">
                  {USSD_CODE} USSD
                </a>
                <a className="hover:text-sand transition-colors" href="#channels">
                  Voice IVR (Sauti)
                </a>
                <a className="hover:text-sand transition-colors" href="#channels">
                  SMS
                </a>
                <Link className="hover:text-sand transition-colors" href="/dashboard">
                  Planner Portal
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <span className="font-mono text-[11px] text-savanna-amber uppercase tracking-wider block">
                // Project
              </span>
              <div className="flex flex-col space-y-2 text-sand-muted">
                <a className="hover:text-sand transition-colors" href="#hero">
                  Mombasa Pilot
                </a>
                <a className="hover:text-sand transition-colors" href="#the-score">
                  Methodology
                </a>
                <a
                  className="hover:text-sand transition-colors"
                  href="https://africastalking.com"
                  target="_blank"
                >
                  Africa&apos;s Talking API
                </a>
                <a className="hover:text-sand transition-colors" href="#the-score">
                  Open Receipts
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <span className="font-mono text-[11px] text-savanna-amber uppercase tracking-wider block">
                // Governance
              </span>
              <div className="flex flex-col space-y-2 text-sand-muted">
                <a className="hover:text-sand transition-colors" href="#governance">
                  County Act Sec 115
                </a>
                <a className="hover:text-sand transition-colors" href="#governance">
                  Data Privacy
                </a>
                <a className="hover:text-sand transition-colors" href="#governance">
                  Audit Hashing
                </a>
                <a
                  className="hover:text-sand transition-colors flex items-center gap-1"
                  href="https://github.com/Markkaruga254/fahari"
                >
                  GitHub Source <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-sand-muted">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span className="text-terracotta font-bold">SYNTHETIC DEMO DATA</span>
            <span>·</span>
            <span>Built for the Africa&apos;s Talking Mombasa Hackathon</span>
            <span>·</span>
            <span>© 2026 People&apos;s Priorities</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              className="hover:text-savanna-amber transition-colors"
              href="https://github.com/Markkaruga254/fahari"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
