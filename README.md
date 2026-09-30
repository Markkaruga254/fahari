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
| Inbound SMS callback POST /sms/&lt;secret&gt; (receipt + replay guard, no report fabricated) | SMS CALLBACK IMPL, tested; not yet wired to AT |
| Synthetic Mombasa demo data | working, tested |
| Landing page + dashboard (frontend/, Next.js) | live on Render (see Production deployment); typecheck/test/lint/build green |
| Voice/STT, clustering, LLM enrichment, project tracking | not implemented |

## Dashboard

Live: **https://fahari-dashboard.onrender.com** (landing page at `/`, planner
dashboard at `/dashboard`, backed by the production API below).

The read-only dashboard ranks ward/need combinations, shows score components and evidence, and supports
window and ward filters. It uses a single server-side API key, has no user login, and does not expose the
key to the browser. It is intended for a controlled demo/internal environment; no public authentication
layer or map is included.

Run it locally with:
- cd frontend
- cp .env.example .env.local
- Set BACKEND_URL and DASHBOARD_API_KEY to the backend values.
- npm install
- npm run dev
- npm test
- npm run typecheck
- npm run lint
- npm run build

**Demo:** see [docs/DEMO.md](docs/DEMO.md) for a 5-minute Mombasa walkthrough and `scripts/demo_ussd.sh`.
For a persistent one-command local stack (database + seeded API + wired dashboard),
run `./scripts/demo_stack.sh`.

## Backend quick start

- cp .env.example .env
- docker compose up -d --build
- curl localhost:8000/health
- curl localhost:8000/ready

## SMS callback (impl, not live)

`POST /sms/<WEBHOOK_SECRET>` receives Africa's Talking SMS callbacks (`from`,
`text`, `id`, `date`). The secret path is checked exactly like the USSD
callback (wrong secret → 404). Sender numbers are normalized and pepper-hashed
— raw numbers and message bodies are never stored or logged. Each AT message
`id` is stored once as an `SmsReceipt` (replays → 200, one effect; missing ids
fall back to a 10-minute same-phone/same-body window). A free-text SMS carries
no ward, so v1 deliberately records the receipt only and never fabricates a
`Submission`. Status: SMS CALLBACK IMPL — do not point AT at it until
`AT_API_KEY`/`SMS_ENABLED` are configured and the route is deployed.

## Layout

backend/app/     FastAPI API, channels, notifications, enrichment and priority services
backend/tests/   pytest
frontend/        Next.js landing page (/) + planner dashboard (/dashboard)
frontend/components/landing/  landing sections (Ticker, Nav, Hero, Problem, Journey, Channels, Score, DashboardPreview, StatusPipeline, Actors, Governance, Testimonials, FinalCta, Footer)
scripts/         seed + smoke scripts
docs/DEPLOY.md   production deployment notes

## Production deployment

Frontend and backend are separate Render services, both auto-deploying from `main`.
Details in [docs/DEPLOY.md](docs/DEPLOY.md).

- Frontend: `fahari-dashboard` → https://fahari-dashboard.onrender.com
  (`cd frontend && npm install && npm run build` / `cd frontend && npm start`)
- Backend: `peoples-priorities-api-gsvz` → https://peoples-priorities-api-gsvz.onrender.com
  (Docker, defined in `render.yaml`)

Note: the repo has no committed `frontend/package-lock.json`, so the Render
frontend build uses `npm install`, not `npm ci`.

## Security basics

Secrets live in .env (git-ignored). Webhooks sit behind a secret path token, inputs are validated and
length-limited, SQL is parameterised, phone numbers are never logged raw, and AI output is validated before
it is stored.
