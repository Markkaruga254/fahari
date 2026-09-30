# Deploying the dashboard (Vercel)

The landing page (`/`) is fully static. `/dashboard` renders on demand and
reads the backend at request time, so the build needs no running backend.

## Vercel project settings

- Framework preset: **Next.js**
- Root Directory: **frontend**
- Build command / output: defaults (`npm run build`)
- No `vercel.json` — nothing in this setup requires one.

## Environment variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_USSD_CODE` | Production (and Preview if you test it) | Placeholder `*384*XXXX#`. Baked in at build time: changing it needs a redeploy. |
| `NEXT_PUBLIC_VOICE_NUMBER` | Production | Placeholder `Voice line (demo)`. Same rebuild note. |
| `BACKEND_URL` | Production | Backend base URL, e.g. the Render API service. Server-side only. |
| `DASHBOARD_API_KEY` | Production | Same value as the backend. Server-side only — **never** make this a `NEXT_PUBLIC_` variable. |

Without `BACKEND_URL`/`DASHBOARD_API_KEY`, `/dashboard` shows a friendly
"not configured" message instead of crashing.

## Update workflow

- Small commits to `main` go straight to production.
- Risky changes go on a branch first — Vercel gives each branch a preview URL.
