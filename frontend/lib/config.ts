// Single place that reads public runtime config. Components import from
// here, never from process.env directly. NEXT_PUBLIC_* values are inlined
// at build time, so the Dockerfile must provide them as build args (Step 8).
export const USSD_CODE: string = process.env.NEXT_PUBLIC_USSD_CODE ?? "*384*XXXX#";

export const VOICE_NUMBER: string =
  process.env.NEXT_PUBLIC_VOICE_NUMBER ?? "Voice line (demo)";
