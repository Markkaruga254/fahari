// Typed English/Kiswahili dictionary for the channel-tab section, ported
// from the Stitch landing page script. A missing key in either language is
// a TypeScript error because both entries must satisfy ChannelStrings.
//
// NOTE (copy claims): some Kiswahili strings say "bure" / "bila bando" /
// "0 KES". Those claims are not verified and must be reviewed when the
// Channels section is built — anything not built is labelled accordingly.
export type Lang = "sw" | "en";

export interface ChannelStrings {
  ussdTitle: string;
  ussdDesc: string;
  ussdScreen: string[];
  voiceTitle: string;
  voiceDesc: string;
  smsTitle: string;
  smsDesc: string;
  webTitle: string;
  webDesc: string;
}

export const STRINGS: Record<Lang, ChannelStrings> = {
  sw: {
    ussdTitle: "Menyu ya bure kwenye simu yoyote ya kawaida",
    ussdDesc:
      "Inafanya kazi bila bando ya intaneti wala simu janja. Mama mboga anaweza kuchagua kipaumbele chake kwa sekunde 45 tu kupitia Safaricom au Airtel.",
    ussdScreen: [
      "Miritini Vipaumbele:",
      "1. Maji / Kisima",
      "2. Barabara / Madaraja",
      "3. Zahanati ya Afya",
      "4. Shule za Msingi",
    ],
    voiceTitle: "Zungumza kwa Kiswahili safi au lahaja za pwani",
    voiceDesc:
      "Wazee na wakazi wanaopendelea sauti wanapiga nambari ya bure na kueleza shida zao kwa lugha ya nyumbani. AI inasikiliza na kuandika tiketi halisi.",
    smsTitle: "Ujumbe wa papo hapo na risiti ya ufuatiliaji",
    smsDesc:
      "Kila mwananchi anayetuma ripoti anapokea msimbo wa SMS wa kuthibitisha kuwa sauti yake imerekodiwa katika bajeti ya kaunti.",
    webTitle: "Tovuti nyepesi isiyotumia bando",
    webDesc:
      "Inafaa vijana na viongozi wa kijamii wanaotaka kupakia picha za mashimo ya barabara au visima vilivyoharibika moja kwa moja kwenye ramani.",
  },
  en: {
    ussdTitle: "USSD menu on any basic phone",
    ussdDesc:
      "Runs on standard USSD protocols supported by Safaricom and Airtel Kenya. Works with no mobile data and no smartphone.",
    ussdScreen: [
      "Miritini Citizen Priorities:",
      "1. Maji / Water Point",
      "2. Barabara / Feeder Road",
      "3. Afya / Health Clinic",
      "4. Shule / Primary School",
    ],
    voiceTitle: "Speak naturally in coastal Swahili or dialects",
    voiceDesc:
      "Elder residents or citizens uncomfortable with reading menus simply dial a local Mombasa number and speak their mind. Our speech pipeline transcribes and structures issues into verified municipal tickets.",
    smsTitle: "Two-way SMS receipts and milestone alerts",
    smsDesc:
      "Every reporter receives an immediate reference code. When the County Planning Committee allocates funds or dispatches a contractor, status alerts are pushed automatically back to the citizen.",
    webTitle: "Lightweight web form for basic Android phones",
    webDesc:
      "Built specifically for entry-level Android devices on flaky 3G connections. Allows youth leaders, teachers, and shopkeepers to upload photos and pinpoint coordinates without eating their mobile data bundle.",
  },
};
