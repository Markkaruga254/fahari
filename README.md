# People's Priorities

**AI-powered participatory constituency development planning.**

> Every ward gets a voice, every voice gets counted once, and every priority shows its receipts.

Residents report development needs (water, roads, health, education, ...) through channels that work on any
phone: **Africa's Talking USSD, Voice and SMS**, plus a web dashboard. AI turns raw submissions into structured
records, similar reports are clustered, and a **transparent, equity-aware priority score** gives planners
explainable intelligence. People provide the signal, AI organises it, humans decide.

> **All demo data in this repository is synthetic** and the dashboard labels it SYNTHETIC DEMO DATA.
> It never represents real residents.

## What actually works today

| Area | State |
|---|---|
| USSD report flow with re-prompts | working, tested |
| Persistence of reports with peppered phone hash | working, tested |
| Deterministic keyword enrichment (EN + Swahili) | working, tested |
| Opt-in SMS confirmation adapter | implemented; fake notifier tested |
| Priority scoring + GET /priorities (API-key protected, no PII output) | working, tested |
| Synthetic Mombasa demo data | working, tested |
| Web dashboard (frontend/, Next.js) | working locally; tests/build/typecheck in CI |
| Voice/STT, clustering, LLM enrichment, project tracking | not implemented |

## Dashboard

The read-only dashboard ranks ward/need combinations, shows score components and evidence, and supports
window and ward filters. It uses a single server-side API key, has no user login, and does not expose the
key to the browser. It is intended for a controlled demo/internal environment; no public authentication
layer or map is included.

Run it with:
- cd frontend
- cp .env.example .env.local
- Set BACKEND_URL and DASHBOARD_API_KEY to the backend values.
- npm install
- npm run dev
- npm test
- npm run typecheck
- npm run build

**Demo:** see [docs/DEMO.md](docs/DEMO.md) for a 5-minute Mombasa walkthrough and `scripts/demo_ussd.sh`.

## Backend quick start

- cp .env.example .env
- docker compose up -d --build
- curl localhost:8000/health
- curl localhost:8000/ready

## Layout

backend/app/     FastAPI API, channels, notifications, enrichment and priority services
backend/tests/   pytest
frontend/        Next.js priorities dashboard (Gate 5)
scripts/         seed + smoke scripts

## Security basics

Secrets live in .env (git-ignored). Webhooks sit behind a secret path token, inputs are validated and
length-limited, SQL is parameterised, phone numbers are never logged raw, and AI output is validated before
it is stored.
