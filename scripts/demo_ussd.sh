#!/usr/bin/env bash
# Plays realistic Mombasa USSD sessions against a running API (what Africa's Talking would POST).
# Usage: WEBHOOK_SECRET=... ./scripts/demo_ussd.sh [BASE_URL]      (default http://localhost:8000)
# The numbers below are clearly fake (+2547000001xx) and are stored only as peppered hashes.
set -euo pipefail

BASE="${1:-http://localhost:8000}"
if [ -z "${WEBHOOK_SECRET:-}" ] && [ -f "$(dirname "$0")/../.env" ]; then
  WEBHOOK_SECRET="$(grep -E '^WEBHOOK_SECRET=' "$(dirname "$0")/../.env" | head -1 | cut -d= -f2-)"
fi
: "${WEBHOOK_SECRET:?set WEBHOOK_SECRET (or put it in .env)}"

dial() { # phone, session, text
  curl -sS -X POST "$BASE/ussd/$WEBHOOK_SECRET" \
    -d "sessionId=$2" -d "serviceCode=*384*1234#" -d "phoneNumber=$1" -d "networkCode=99999" \
    --data-urlencode "text=$3"
  echo
}
step() { printf '\n\033[1m%s\033[0m\n' "$1"; }

step "1. Amina (Kongowea) dials in, picks a bad category, then recovers"
dial +254700000101 A1 ""
dial +254700000101 A1 "1*Kongowea"
dial +254700000101 A1 "1*Kongowea*9"
dial +254700000101 A1 "1*Kongowea*9*1"
dial +254700000101 A1 "1*Kongowea*9*1*Hakuna maji kwa wiki mbili*1"

step "2. Amina's network retries the same submission from '0700...' format (replay: no duplicate)"
dial 0700000101 A2 "1*Kongowea*1*Hakuna maji kwa wiki mbili*1"

step "3. Juma (Kongowea) reports the same need: a second, distinct voice"
dial +254700000102 J1 "1*Kongowea*1*Bomba limepasuka, maji yanapotea*1"

step "4. Otieno (Likoni) reports a road problem in English"
dial +254700000103 O1 "1*Likoni*2*Big potholes near the market*1"

step "5. Wanjiru changes her mind at the confirmation screen (nothing stored)"
dial +254700000104 W1 "1*Mtongwe*3*Clinic has no medicine*2"

printf '\nDone. Now open the dashboard (or GET /priorities) and look for Kongowea.\n'
