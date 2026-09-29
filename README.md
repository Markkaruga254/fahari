# People's Priorities

**AI-powered participatory constituency development planning.**

> Every ward gets a voice, every voice gets counted once, and every priority shows its receipts.

Residents report development needs (water, roads, health, education, ...) through channels that work on any
phone: **Africa's Talking USSD, Voice and SMS**, plus a web form. AI turns raw submissions into structured
records, similar reports are clustered, and a **transparent, equity-aware priority score** gives planners
explainable intelligence. People provide the signal, AI organises it, humans decide.

> **All demo data in this repository is synthetic** and the dashboard labels it `SYNTHETIC DEMO DATA`.
> It never represents real residents.

## Flow

```
Resident -> Africa's Talking (USSD / Voice) -> FastAPI -> validate -> PostgreSQL
         -> AI enrichment -> clustering -> priority engine -> dashboard -> SMS confirmation
```

## Status (build gates)

| Gate | Scope | Status |
|---|---|---|
| 1 | Skeleton + Africa's Talking connectivity | in progress |
| 2 | USSD -> FastAPI -> PostgreSQL | - |
| 3 | AI enrichment + fallback + clustering + SMS | - |
| 4 | Priority engine + APIs + seed data | - |
| 5 | Dashboard (Next.js) | - |
| 6 | Voice + project tracking | - |
| 7 | End-to-end testing + hardening | - |
| 8 | Demo / release | - |

## Quick start

```bash
cp .env.example .env            # then edit: WEBHOOK_SECRET, AT_API_KEY, ...
docker compose up -d --build    # postgres + api on :8000
curl localhost:8000/health      # {"status":"ok","db":"up"}
```

Run tests without Docker:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
```

## Expose the webhook to Africa's Talking

```bash
# pick one
ngrok http 8000
cloudflared tunnel --url http://localhost:8000
```

In the AT sandbox dashboard, set the USSD callback URL to:

```
https://<your-tunnel-host>/ussd/<WEBHOOK_SECRET>
```

## Layout

```
backend/app/
  main.py         FastAPI app
  config.py       settings from env
  db/             SQLAlchemy session (models arrive per gate)
  channels/       USSD (and later Voice) webhooks
  notify/         Notifier interface, FakeNotifier, Africa's Talking adapter
  ai/             Extractor interface + fallback (Gate 3)
  stt/            SpeechToText interface (Gate 6)
  services/       reports, clustering, priority engine
  api/            dashboard-facing REST endpoints
backend/tests/    pytest
frontend/         Next.js dashboard (Gate 5)
scripts/          seed + end-to-end smoke scripts
```

## Design rules

- Africa's Talking, AI, SMS and speech-to-text sit behind interfaces, so tests never touch a real service.
- The app must run with `AI_ENABLED=false` (deterministic keyword fallback).
- USSD state is derived from the AT `text` chain, so the state machine is a near-pure function.
- Dev/demo endpoints exist only when `DEMO_MODE=true`.

## Security basics

Secrets live in `.env` (git-ignored). Webhooks sit behind a secret path token. Inputs are validated and
length-limited, SQL is parameterised, phone numbers are never logged raw, and AI output is validated against
closed enums before it is stored.
