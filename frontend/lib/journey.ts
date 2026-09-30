import { USSD_CODE } from "./config";

// Typed phone-screen contents for the Journey simulator, ported from the
// Stitch landing page script. Structured data, never innerHTML strings.
export type SimTone = "amber" | "green" | "terracotta";

export interface SimChip {
  text: string;
  tone: "amber" | "terracotta" | "green";
}

export interface SimBoxLine {
  text: string;
  bold?: boolean;
  tone?: "sand" | "muted" | "amber" | "green";
}

export interface SimStep {
  title: string;
  meta: string;
  status: string;
  heading: string;
  headingTone: SimTone;
  lines: string[];
  chips: SimChip[];
  boxNote?: string;
  boxVariant: "default" | "success";
  boxLines: SimBoxLine[];
}

export const SIM_STEPS: SimStep[] = [
  {
    title: USSD_CODE,
    meta: "Step 1 of 5",
    status: "USSD session opened",
    heading: "Mama Amina dials from Miritini:",
    headingTone: "amber",
    lines: ["Chagua Kipaumbele:", "1. Maji (Borehole 3)", "2. Barabara (Road)", "3. Afya (Clinic)"],
    chips: [],
    boxVariant: "default",
    boxLines: [
      { text: "Input received: " },
      { text: '"1" (Water failure)', bold: true, tone: "amber" },
    ],
  },
  {
    title: "Africa's Talking Gateway",
    meta: "Step 2 of 5",
    status: "Carrier payload routed",
    heading: "Telecom Session Handshake:",
    headingTone: "green",
    lines: [],
    chips: [],
    boxVariant: "default",
    boxLines: [
      { text: "Network: Safaricom / Airtel" },
      { text: "Region: Mombasa (demo)" },
      { text: "Channel: USSD session", bold: true, tone: "green" },
    ],
  },
  {
    title: "AI Semantic Classifier",
    meta: "Step 3 of 5",
    status: "NLP Structuring: Success",
    heading: "Tokens Extracted:",
    headingTone: "amber",
    lines: [],
    chips: [
      { text: "[Water]", tone: "amber" },
      { text: "[Urgency: 9.4]", tone: "terracotta" },
      { text: "[Miritini Cent.]", tone: "green" },
    ],
    boxNote: "Severity: High saline intrusion",
    boxVariant: "default",
    boxLines: [],
  },
  {
    title: "Priority #01 Clustered",
    meta: "Step 4 of 5",
    status: "Deduplication: 48 reports -> 1",
    heading: "Consolidated Cluster:",
    headingTone: "terracotta",
    lines: [],
    chips: [],
    boxVariant: "default",
    boxLines: [
      { text: "Borehole 3 Salinity Surge", bold: true, tone: "sand" },
      { text: "48 signals merged", tone: "muted" },
      { text: "Priority Score: 91.4 / 100", bold: true, tone: "amber" },
    ],
  },
  {
    title: "SMS Receipt Delivered",
    meta: "Step 5 of 5",
    status: "Delivered to +254 7XX...482",
    heading: "SMS Receipt #MRT-DEMO-001:",
    headingTone: "green",
    lines: [],
    chips: [],
    boxVariant: "success",
    boxLines: [
      {
        text: "“Ripoti yako ya pampu ya maji imesajiliwa kama Kipaumbele #1. Asante kwa sauti yako.”",
      },
    ],
  },
];
