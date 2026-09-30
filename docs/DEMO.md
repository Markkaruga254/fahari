# 5-minute demo: from a Mombasa USSD session to a ranked priority

**Story:** Amina lives in Kongowea. Her tap has been dry for two weeks. She has no smartphone and no data,
but she can dial a USSD code. People's Priorities counts every resident once and shows *why* a need ranks where it does.

> Everything below runs locally. The Africa's Talking calls are simulated by `scripts/demo_ussd.sh`, which
> posts exactly what Africa's Talking would post. **Nothing here has been verified against the live AT
> sandbox or a deployed instance.** The seeded wards are **synthetic**; the dashboard says so.

## 0. Setup (once)

```bash
cp .env.example .env    # set WEBHOOK_SECRET, PHONE_HASH_PEPPER, DASHBOARD_API_KEY (any strings in dev)
docker compose up -d --build                  # postgres + api :8000 + dashboard :3000
docker compose exec api python -m app.services.demo_seed --reset     # synthetic Mombasa data
```

Without Docker: run Postgres, then `uvicorn app.main:app` in `backend/`, `python -m app.services.demo_seed`,
and `npm run dev` in `frontend/` (see README). Open **http://localhost:3000**.

## 1. Problem (30s)
Show the dashboard. The yellow **SYNTHETIC DEMO DATA** banner is deliberate: ~400 generated reports across
six Mombasa-area wards (Changamwe, Likoni, Jomvu Kuu, Miritini, Port Reitz, Mtongwe). Real residents are
never mixed in silently; the banner counts how many reports are synthetic.

## 2. Citizen side: USSD (90s)
```bash
./scripts/demo_ussd.sh            # reads WEBHOOK_SECRET from .env; optional arg: base URL
```
Point out, in the printed screens:
- Amina mistypes the category, is re-prompted, and continues (no need to redial).
- Her network retries the same report from `0700…` format: **no duplicate**, same person.
- Juma reports the same water problem: a **second distinct voice**.
- Wanjiru cancels at the confirmation screen: **nothing is stored**.

Only a peppered hash of the phone number is stored, never the number. Reports are stored in Postgres and
tagged by the deterministic keyword enricher (English + Swahili: *maji*, *bomba*, *barabara*, ...).

## 3. Priority intelligence (90s)
Refresh the dashboard (or `?ward=Kongowea`). Kongowea now appears with **2 reporters**. Then explain a row
using the bars ("Why it ranks here"):

| Component | Meaning |
|---|---|
| Voices (35%) | distinct residents reporting this need, with diminishing returns |
| Ward share (30%) | share of the ward's reporters who raised it (a small ward's concentrated need is not drowned out) |
| Persistence (20%) | how many different days it was reported |
| Spread (15%) | how many wards report the same category |

Equity contrast to show: with the synthetic data, the top five contains large wards (Changamwe roads,
Likoni water) **and** small ones (Jomvu Kuu health, Miritini water, Mtongwe water). Exact order and decimals
shift a little from day to day because report dates are generated relative to "now". Repeating a report
never raises the score (residents are counted once per need).

## 4. What you can honestly claim as impact
- Each resident counts once, so volume cannot be gamed by one person resubmitting (demonstrated in step 2).
- Every rank is explainable from four visible numbers.
- Small wards with a concentrated need surface next to big wards (demonstrated on synthetic data).

You **cannot** claim measured real-world outcomes (time saved, projects funded). None exist yet.

## Known limits (say them before someone asks)
- USSD menu option 2 ("Community priorities") is a placeholder.
- SMS confirmations are implemented but only tested with a fake notifier.
- No voice channel, no clustering, no LLM enrichment, no project tracking (README gates 3, 6).
- Dashboard is read-only with one shared key and no user login.
- Docker images were written but not built in the authoring environment; the app, dashboard build and
  standalone server were verified directly.

## Reset
```bash
docker compose exec api python -m app.services.demo_seed --reset   # removes only synthetic rows
```
Your demo submissions (real hashes) are kept; delete them via SQL if you want a fully clean slate.
