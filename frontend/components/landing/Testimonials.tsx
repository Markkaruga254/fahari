"use client";

import { useReveal } from "../../hooks/useReveal";

// Port of the Stitch testimonials section.
const QUOTES = [
  {
    badge: "Reports triaged in minutes",
    badgeClass: "bg-baobab-green/20 text-baobab-green",
    quote:
      "“Before People's Priorities, the loudest delegation got the tarmac road. When 35 mothers dial from Miritini over basic USSD, it surfaces as Priority #1 before anyone prints a petition.”",
    initials: "FB",
    avatarClass: "bg-savanna-amber text-obsidian",
    name: "Fatuma Bakari",
    role: "Lead Civic Planner · Mombasa Pilot",
  },
  {
    badge: "Zero subjective horse-trading",
    badgeClass: "bg-savanna-amber/20 text-savanna-amber",
    quote:
      "“The persistence metric solved our hardest challenge: identifying contractor repairs that fail three weeks after sign-off. The formula receipts don't lie.”",
    initials: "DM",
    avatarClass: "bg-surface-elevated border border-border-strong text-sand",
    name: "David Mwangi",
    role: "County Infrastructure Data Analyst",
  },
  {
    badge: "Our elders see the receipts",
    badgeClass: "bg-terracotta/20 text-terracotta",
    quote:
      "“I don't have a touch screen or internet, but I called the Swahili line. When the SMS ticket arrived with the county reference number, I knew my boma was counted.”",
    initials: "HO",
    avatarClass: "bg-terracotta text-sand",
    name: "Halima Omar",
    role: "Miritini Sokoni Community Elder",
  },
];

export default function Testimonials() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full border-t border-border-subtle scroll-mt-28"
      id="testimonials"
    >
      <div className="flex flex-col space-y-3 mb-14">
        <span className="font-mono text-xs text-savanna-amber uppercase tracking-wider">
          // 09 FIELD REFLECTIONS
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-sand tracking-tight font-bold">
          What do people{" "}
          <span className="font-editorial italic font-normal text-savanna-amber">say</span>?
        </h2>
        <p className="font-body text-sand-muted max-w-2xl text-base">
          Reflections from planners, civic analysts, and community elders inside the Miritini pilot
          corridor.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {QUOTES.map((item) => (
          <div
            key={item.initials}
            className="bg-surface-card rounded-card p-6 border border-border-strong flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${item.badgeClass}`}
              >
                {item.badge}
              </span>
              <p className="font-body text-sm text-sand leading-relaxed">{item.quote}</p>
            </div>
            <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full font-mono text-xs font-bold flex items-center justify-center ${item.avatarClass}`}
              >
                {item.initials}
              </div>
              <div>
                <div className="font-display text-sm font-bold text-sand">{item.name}</div>
                <div className="font-mono text-[11px] text-sand-muted">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
